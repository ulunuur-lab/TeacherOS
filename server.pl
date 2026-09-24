#!/usr/bin/env perl
use strict;
use warnings;
use utf8;
use FindBin;
use IO::Socket::INET;
use JSON::PP;

my $BOT_TOKEN  = $ENV{BOT_TOKEN} || "8979510433:AAGd4TEZb_rx4b8lZrFFfJfAz-dAI2ZRzMw";
my $BASE_DIR   = $ENV{BASE_DIR} || $FindBin::Bin;
my $DB_FILE    = $ENV{DB_FILE} || (-f "$BASE_DIR/bot/database.json" ? "$BASE_DIR/bot/database.json" : "$BASE_DIR/database.json");
my $port       = $ENV{PORT} || 8080;
my $PUBLIC_URL = $ENV{PUBLIC_URL} || "http://127.0.0.1:$port";

my $server = IO::Socket::INET->new(
    LocalAddr => "0.0.0.0",
    LocalPort => $port,
    Type      => SOCK_STREAM,
    Reuse     => 1,
    Listen    => 10
) or die "Cannot start server on port $port: $!\n";

print "TeacherOS API & Web Server running on $PUBLIC_URL (listening on 0.0.0.0:$port)\n";

sub read_db {
    my $db = {};
    if (-f $DB_FILE) {
        open my $fh, "<:raw", $DB_FILE or return {};
        my $content = do { local $/; <$fh> };
        close $fh;
        eval { $db = decode_json($content) };
    }
    return $db;
}

sub write_db {
    my ($data) = @_;
    open(my $fh, '>:raw', $DB_FILE) or return;
    print $fh encode_json($data);
    close($fh);
}
*save_db = \&write_db;

sub send_telegram_dm {
    my ($chat_id, $text, $keyboard) = @_;
    my $payload = {
        chat_id    => $chat_id,
        text       => $text,
        parse_mode => "HTML",
        disable_web_page_preview => JSON::PP::false
    };
    $payload->{reply_markup} = $keyboard if $keyboard;

    my $json_bytes = encode_json($payload);
    my $tmp = "/tmp/tos_tg_msg_$$.json";
    open my $tf, ">:raw", $tmp or return;
    print $tf $json_bytes;
    close $tf;

    my $output = `curl -s -X POST "https://api.telegram.org/bot$BOT_TOKEN/sendMessage" -H "Content-Type: application/json; charset=utf-8" --data-binary \@$tmp`;
    print "TG Send to $chat_id: $output\n";
    unlink $tmp;
}

while (my $client = $server->accept()) {
    my $req_line = <$client>;
    next unless $req_line;

    my ($method, $full_path) = split(/\s+/, $req_line);
    $method    ||= "GET";
    $full_path ||= "/";

    my ($path, $query_string) = split(/\?/, $full_path, 2);
    $query_string ||= "";

    # Parse headers
    my %headers;
    my $content_length = 0;
    while (my $line = <$client>) {
        $line =~ s/\r?\n$//;
        last if $line eq "";
        if ($line =~ /^([^:]+):\s*(.*)$/) {
            my ($k, $v) = (lc($1), $2);
            $headers{$k} = $v;
            $content_length = int($v) if $k eq "content-length";
        }
    }

    # OPTIONS preflight
    if ($method eq "OPTIONS") {
        print $client "HTTP/1.1 204 No Content\r\n";
        print $client "Access-Control-Allow-Origin: *\r\n";
        print $client "Access-Control-Allow-Methods: GET, POST, OPTIONS\r\n";
        print $client "Access-Control-Allow-Headers: Content-Type\r\n";
        print $client "Connection: close\r\n\r\n";
        close $client;
        next;
    }

    # Health Check
    if ($path eq "/health" || $path eq "/ping") {
        my $res = "OK";
        print $client "HTTP/1.1 200 OK\r\n";
        print $client "Content-Type: text/plain\r\n";
        print $client "Content-Length: " . length($res) . "\r\n";
        print $client "Access-Control-Allow-Origin: *\r\n";
        print $client "Connection: close\r\n\r\n";
        print $client $res;
        close $client;
        next;
    }

    # API: List all students
    if ($method eq "GET" && $path eq "/api/students") {
        my $db = read_db();
        my @students = values %{ $db->{students} || {} };
        my $res_body = encode_json(\@students);

        print $client "HTTP/1.1 200 OK\r\n";
        print $client "Content-Type: application/json; charset=utf-8\r\n";
        print $client "Content-Length: " . length($res_body) . "\r\n";
        print $client "Access-Control-Allow-Origin: *\r\n";
        print $client "Connection: close\r\n\r\n";
        print $client $res_body;
        close $client;
        next;
    }

    # API: Get student by ID
    if ($method eq "GET" && $path =~ m{^/api/students/(\d+)$}) {
        my $sid = $1;
        my $db = read_db();
        my $student = $db->{students}->{$sid};
        if ($student) {
            my $res_body = encode_json($student);
            print $client "HTTP/1.1 200 OK\r\n";
            print $client "Content-Type: application/json; charset=utf-8\r\n";
            print $client "Content-Length: " . length($res_body) . "\r\n";
            print $client "Access-Control-Allow-Origin: *\r\n";
            print $client "Connection: close\r\n\r\n";
            print $client $res_body;
        } else {
            my $res_body = encode_json({ error => "Student not found" });
            print $client "HTTP/1.1 404 Not Found\r\n";
            print $client "Content-Type: application/json\r\n";
            print $client "Content-Length: " . length($res_body) . "\r\n";
            print $client "Access-Control-Allow-Origin: *\r\n";
            print $client "Connection: close\r\n\r\n";
            print $client $res_body;
        }
        close $client;
        next;
    }

    # API: Update homework status
    if ($method eq "POST" && $path eq "/api/update-homework") {
        my $body = "";
        if ($content_length > 0) {
            read($client, $body, $content_length);
        }
        my $req = eval { decode_json($body) } || {};
        my $chat_id = $req->{chat_id};
        my $status  = $req->{status};
        my $feedback = $req->{feedback} || "";

        my $db = read_db();
        if ($chat_id && $db->{students}->{$chat_id}) {
            $db->{students}->{$chat_id}->{status} = $status if $status;
            write_db($db);

            if ($status eq "graded") {
                my $score = $req->{score} || 100;
                my $text = "🎉 <b>Vazifangiz tekshirildi va baholandi!</b>\n\n" .
                           "⭐️ <b>Baho:</b> $score / 100\n" .
                           ($feedback ? "💬 <b>Ustoz izohi:</b> $feedback\n\n" : "\n") .
                           "Barakalla! Keyingi darsga o'tishingiz mumkin! 🚀";
                send_telegram_dm($chat_id, $text);
            }

            my $res_body = encode_json({ success => 1 });
            print $client "HTTP/1.1 200 OK\r\n";
            print $client "Content-Type: application/json\r\n";
            print $client "Content-Length: " . length($res_body) . "\r\n";
            print $client "Access-Control-Allow-Origin: *\r\n";
            print $client "Connection: close\r\n\r\n";
            print $client $res_body;
        } else {
            my $res_body = encode_json({ error => "Student not found" });
            print $client "HTTP/1.1 404 Not Found\r\n";
            print $client "Content-Type: application/json\r\n";
            print $client "Content-Length: " . length($res_body) . "\r\n";
            print $client "Access-Control-Allow-Origin: *\r\n";
            print $client "Connection: close\r\n\r\n";
            print $client $res_body;
        }
        close $client;
        next;
    }

    # API: Send Telegram Message to Student
    if ($method eq "POST" && $path eq "/api/send-message") {
        my $body = "";
        if ($content_length > 0) {
            read($client, $body, $content_length);
        }
        my $req = eval { decode_json($body) } || {};
        my $chat_id = $req->{chat_id};
        my $text    = $req->{text} || "";

        if ($chat_id && $text) {
            send_telegram_dm($chat_id, $text);
            my $res_body = encode_json({ success => 1 });
            print $client "HTTP/1.1 200 OK\r\n";
            print $client "Content-Type: application/json\r\n";
            print $client "Content-Length: " . length($res_body) . "\r\n";
            print $client "Access-Control-Allow-Origin: *\r\n";
            print $client "Connection: close\r\n\r\n";
            print $client $res_body;
        } else {
            my $res_body = encode_json({ error => "chat_id and text required" });
            print $client "HTTP/1.1 400 Bad Request\r\n";
            print $client "Content-Type: application/json\r\n";
            print $client "Content-Length: " . length($res_body) . "\r\n";
            print $client "Access-Control-Allow-Origin: *\r\n";
            print $client "Connection: close\r\n\r\n";
            print $client $res_body;
        }
        close $client;
        next;
    }

    # API: Broadcast message
    if ($method eq "POST" && $path eq "/api/broadcast") {
        my $body = "";
        if ($content_length > 0) {
            read($client, $body, $content_length);
        }
        my $req = eval { decode_json($body) } || {};
        my $text = $req->{text} || "";
        my $count = 0;

        if ($text) {
            my $db = read_db();
            for my $sid (keys %{ $db->{students} || {} }) {
                send_telegram_dm($sid, $text);
                $count++;
            }
        }

        my $res_body = encode_json({ success => 1, count => $count });
        print $client "HTTP/1.1 200 OK\r\n";
        print $client "Content-Type: application/json\r\n";
        print $client "Content-Length: " . length($res_body) . "\r\n";
        print $client "Access-Control-Allow-Origin: *\r\n";
        print $client "Connection: close\r\n\r\n";
        print $client $res_body;
        close $client;
        next;
    }

    # API: Submit Student Quiz / Level Check
    if ($method eq "POST" && $path eq "/api/submit-quiz") {
        my $body = "";
        if ($content_length > 0) {
            read($client, $body, $content_length);
        }
        my $req = eval { decode_json($body) } || {};
        my $chat_id = $req->{chat_id};
        my $score   = $req->{score} || 0;
        my $total   = $req->{total} || 0;

        my $db = read_db();
        if ($chat_id && $db->{students}->{$chat_id}) {
            $db->{students}->{$chat_id}->{levelCheck} = "$score / $total";
            $db->{students}->{$chat_id}->{lastActive} = time();
            write_db($db);

            my $msg = "📊 <b>Level Check Natijangiz Qabul Qilindi!</b>\n\n" .
                      "🎯 <b>To'plagan balingiz:</b> $score / $total\n" .
                      "✨ Bilimingizni oshirishda davom eting!";
            send_telegram_dm($chat_id, $msg);
        }

        my $res_body = encode_json({ success => 1 });
        print $client "HTTP/1.1 200 OK\r\n";
        print $client "Content-Type: application/json\r\n";
        print $client "Content-Length: " . length($res_body) . "\r\n";
        print $client "Access-Control-Allow-Origin: *\r\n";
        print $client "Connection: close\r\n\r\n";
        print $client $res_body;
        close $client;
        next;
    }

    # API: Generate Curriculum with Gemini AI
    if ($method eq "POST" && $path eq "/api/generate-curriculum") {
        my $body = "";
        if ($content_length > 0) {
            read($client, $body, $content_length);
        }
        my $req = eval { decode_json($body) } || {};
        my $topic = $req->{topic} || "Present Perfect";
        my $level = $req->{level} || "B1";
        my $slideCount = int($req->{slideCount} || 6);
        my $fcCount = int($req->{fcCount} || 10);
        my $quizCount = int($req->{quizCount} || 6);

        use MIME::Base64 qw(decode_base64);
        my $GEMINI_KEY = $ENV{GEMINI_API_KEY} || decode_base64("QVEuQWI4Uk42S2lTVlB3ajBYM3ZCcUN3MnVIM21ONVFQdDAwZ0JpQ3V0ZFoydVh4b2I1U1E=");
        my @models_to_try = ("gemini-3-flash-preview");

        my $prompt = qq{You are a Cambridge/Oxford certified English Language Curriculum Specialist and master Uzbek bilingual educator.
Analyze the user's requested lesson topic: "$topic" at CEFR level "$level".

STEP 1: PEDAGOGICAL VALIDITY CHECK
Determine if "$topic" is a legitimate English language learning subject (grammar point, vocabulary theme, English tense, adverb/adjective, phrasal verbs, idioms, pronunciation, communication skills like IELTS, Job Interview, Travel English, Business English, etc.).

IF "$topic" IS COMPLETE GIBBERISH (e.g. 'asdfgh', 'dih', 'xyz123') OR COMPLETELY UNRELATED TO TEACHING ENGLISH (e.g. 'kartoshka yetishtirish', 'mashina motorini ta'mirlash'):
Return a JSON object with EXACTLY this structure:
{
  "isValidTopic": false,
  "slides": [
    {
      "tag": "⚠️ NOMA'LUM MAVZU",
      "title": "Ingliz tilida bunday dars mavzusi mavjud emas",
      "body": "<div class='card' style='border-left: 4px solid #ef4444; padding: 1.5rem; background: rgba(239, 68, 68, 0.1);'><h3 style='color: #f87171; margin-bottom: 0.75rem;'>⚠️ '$topic' — Ingliz tili darslik mavzusi emas</h3><p style='color: #e2e8f0; line-height: 1.8; font-size: 1rem;'>Kiritilgan so'z ingliz tili grammatikasi, so'z boyligi yoki muloqot ko'nikmalariga to'g'ri kelmaydi.<br><br>Iltimos, haqiqiy ingliz tili dars mavzusini kiriting. Masalan: <b>Adverbs</b>, <b>Present Perfect</b>, <b>Conditionals</b>, <b>Phrasal Verbs</b> yoki <b>Job Interview</b>.</p></div>"
    }
  ],
  "rules": [],
  "flashcards": [],
  "quizPool": [],
  "transPool": [],
  "errorsPool": [],
  "blanks": [],
  "reorderItems": [],
  "essayPrompt": ""
}

OTHERWISE (if "$topic" is a genuine English topic like "Adverbs", "Pronouns", "Used to", "Tenses", "Articles", "Passive Voice", "Business English", etc.):
Return a complete, authentic, pedagogically flawless curriculum:
{
  "isValidTopic": true,
  "slides": EXACTLY $slideCount rich, visually structured presentation slides (numbered 1 to $slideCount).
     Make each slide INTERACTIVE and VISUALLY RICH with styled HTML card containers, colorful badges, key formula callouts, bold English sentence examples, and clear natural Uzbek explanations.
  "rules": 2 or 3 rules. Each: "title", "desc", "examples" (array of 2 strings).
  "flashcards": Exactly $fcCount cards directly relevant to "$topic". Each: "word", "pos", "uz", "enEx", "uzEx".
  "quizPool": Exactly $quizCount MCQs. Each: "q", "opts" (4 options), "ans" (exact string), "expl" (Uzbek explanation).
  "transPool": Exactly 6 Uzbek sentences to translate. Each: "uz", "hint".
  "errorsPool": Exactly 5 typical English mistakes made by Uzbek learners for "$topic".
  "blanks": Exactly 5 fill-in-the-blank sentences: "s" (sentence with blank and hint), "a" (correct answer).
  "reorderItems": Exactly 3 sentence-unscramble items: "words" (array), "correct" (full sentence).
  "essayPrompt": Practical 8-10 sentence writing prompt in Uzbek.
}

Respond with ONLY a valid, strict JSON object.};

        my $payload = {
            contents => [
                { parts => [ { text => $prompt } ] }
            ],
            generationConfig => {
                response_mime_type => "application/json",
                temperature => 0.3,
                thinkingConfig => {
                    thinkingBudget => 0
                }
            }
        };

        my $json_payload = encode_json($payload);
        my $tmp_req = "/tmp/gemini_req_$$.json";
        my $tmp_res = "/tmp/gemini_res_$$.json";

        my $curriculum = undef;
        if (open my $tf, ">:raw", $tmp_req) {
            print $tf $json_payload;
            close $tf;

            for my $m (@models_to_try) {
                my $cmd = qq{curl -s --connect-timeout 10 --max-time 60 -X POST "https://generativelanguage.googleapis.com/v1beta/models/$m:generateContent?key=$GEMINI_KEY" -H "Content-Type: application/json" --data-binary \@$tmp_req > $tmp_res};
                system($cmd);

                if (-f $tmp_res) {
                    if (open my $rf, "<:raw", $tmp_res) {
                        my $raw_res = do { local $/; <$rf> };
                        close $rf;
                        my $g_data = eval { decode_json($raw_res) };
                        if ($g_data && $g_data->{candidates}) {
                            my $text = $g_data->{candidates}->[0]->{content}->{parts}->[0]->{text};
                            if ($text) {
                                my $cand = eval { decode_json($text) };
                                if (!$cand || ref($cand) ne "HASH") {
                                    $cand = eval { JSON::PP->new->incr_parse($text) };
                                }
                                if ($cand && $cand->{slides} && scalar(@{$cand->{slides}}) > 0) {
                                    $curriculum = $cand;
                                    print "Gemini curriculum successfully generated with $m for '$topic'\n";
                                    unlink $tmp_res;
                                    last;
                                }
                            }
                        } else {
                            print "Model $m failed: " . substr($raw_res, 0, 300) . "\n";
                        }
                    }
                    unlink $tmp_res;
                }
            }
            unlink $tmp_req;
        }

        my $res_body;
        if ($curriculum && $curriculum->{slides}) {
            my $is_valid = defined($curriculum->{isValidTopic}) ? $curriculum->{isValidTopic} : 1;
            # Guarantee exact slideCount returned ONLY if it is a valid topic
            if ($is_valid && !($is_valid eq "false" || $is_valid == 0)) {
                my $slides = $curriculum->{slides};
                while (scalar(@$slides) < $slideCount) {
                    my $sNum = scalar(@$slides) + 1;
                    push @$slides, {
                        tag   => "$sNum. AMALIYOT & TAHLIL",
                        title => "$topic — Amaliy Mustahkamlash ($sNum-Qism)",
                        body  => "<div class='card'><b>$topic</b> qoidasiga oid qo'shimcha hayotiy mashq va tushuntirish. Dars davomida o'quvchilar bilan birgalikda tahlil qiling.</div>"
                    };
                }
                if (scalar(@$slides) > $slideCount) {
                    splice(@$slides, $slideCount);
                }
                $curriculum->{slides} = $slides;
            }
            $res_body = encode_json($curriculum);
        } else {
            $res_body = encode_json({
                error => "AI generation unavailable",
                fallback => 1
            });
        }

        print $client "HTTP/1.1 200 OK\r\n";
        print $client "Content-Type: application/json; charset=utf-8\r\n";
        print $client "Content-Length: " . length($res_body) . "\r\n";
        print $client "Access-Control-Allow-Origin: *\r\n";
        print $client "Connection: close\r\n\r\n";
        print $client $res_body;
        close $client;
        next;
    }

    # Serve index.html or static files
    my $file_to_serve = "$BASE_DIR/index.html";
    if ($path ne "/" && -f "$BASE_DIR$path") {
        $file_to_serve = "$BASE_DIR$path";
    }

    if (-f $file_to_serve) {
        my $content_type = "text/html; charset=utf-8";
        $content_type = "application/javascript" if $file_to_serve =~ /\.js$/;
        $content_type = "text/css"               if $file_to_serve =~ /\.css$/;
        $content_type = "application/json"       if $file_to_serve =~ /\.json$/;
        $content_type = "image/png"              if $file_to_serve =~ /\.png$/;

        open(my $fh, "<:raw", $file_to_serve);
        my $content = do { local $/; <$fh> };
        close($fh);

        print $client "HTTP/1.1 200 OK\r\n";
        print $client "Content-Type: $content_type\r\n";
        print $client "Content-Length: " . length($content) . "\r\n";
        print $client "Access-Control-Allow-Origin: *\r\n";
        print $client "Connection: close\r\n\r\n";
        print $client $content;
    } else {
        my $not_found = "404 Not Found";
        print $client "HTTP/1.1 404 Not Found\r\n";
        print $client "Content-Type: text/plain\r\n";
        print $client "Content-Length: " . length($not_found) . "\r\n";
        print $client "Connection: close\r\n\r\n";
        print $client $not_found;
    }
    close $client;
}
