#!/usr/bin/env perl
use strict;
use warnings;
use utf8;
use FindBin;
use IO::Socket::INET;
use JSON::PP;

my $BOT_TOKEN  = $ENV{BOT_TOKEN} || "8979510433:AAGd4TEZb_rx4b8lZrFFfJfAz-dAI2ZRzMw";
my $BASE_DIR   = $ENV{BASE_DIR} || $FindBin::Bin;
my $DB_FILE    = $ENV{DB_FILE} || "$BASE_DIR/bot/database.json";
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

    # Health Check for Cloud Platforms & Uptime monitors
    if ($method eq "GET" && ($path eq "/health" || $path eq "/api/health")) {
        my $res = '{"status":"ok","service":"TeacherOS Cloud Suite","timestamp":' . time() . '}';
        print $client "HTTP/1.1 200 OK\r\n";
        print $client "Content-Type: application/json\r\n";
        print $client "Content-Length: " . length($res) . "\r\n";
        print $client "Access-Control-Allow-Origin: *\r\n";
        print $client "Connection: close\r\n\r\n";
        print $client $res;
        close $client;
        next;
    }

    # API: GET /api/classroom?key=...
    if ($method eq "GET" && $path eq "/api/classroom") {
        my %params = map { split(/=/, $_, 2) } split(/&/, $query_string);
        my $rk = uc($params{key} || "");
        my $db = read_db();
        my $c = $db->{classrooms}->{$rk};

        my $res_body;
        if ($c) {
            my @st_details;
            for my $sid (@{ $c->{students} || [] }) {
                my $s_obj = $db->{students}->{$sid};
                push @st_details, { id => $sid, name => ($s_obj ? $s_obj->{name} : "O\x27quvchi") };
            }
            $res_body = encode_json({
                ok => JSON::PP::true,
                roomKey => $rk,
                name => $c->{name},
                teacher_id => $c->{teacher_id},
                students => $c->{students} || [],
                student_details => \@st_details,
                active_assignment => $c->{active_assignment} || undef
            });
        } else {
            $res_body = encode_json({ ok => JSON::PP::false, error => "Classroom not found" });
        }

        print $client "HTTP/1.1 200 OK\r\n";
        print $client "Content-Type: application/json; charset=utf-8\r\n";
        print $client "Access-Control-Allow-Origin: *\r\n";
        print $client "Content-Length: " . length($res_body) . "\r\n";
        print $client "Connection: close\r\n\r\n";
        print $client $res_body;
        close $client;
        next;
    }

    # API: POST /api/assign-homework
    if ($method eq "POST" && $path eq "/api/assign-homework") {
        my $body = "";
        if ($content_length > 0) {
            read($client, $body, $content_length);
        }
        my $data = eval { decode_json($body) } || {};
        my $rk = uc($data->{roomKey} || "");
        my $topic = $data->{topic} || "Bugungi Mavzu";
        my $level = $data->{level} || "B1";
        my $deadline = $data->{deadline} || "Bugun 22:00 gacha";
        my $room_hash = $data->{roomHash} || "";

        my $db = read_db();
        my $c = $db->{classrooms}->{$rk};
        if (!$c && $db->{classrooms}) {
            my ($first_k) = sort keys %{ $db->{classrooms} };
            $c = $db->{classrooms}->{$first_k} if $first_k;
            $rk = $first_k if $first_k;
        }

        my $res_body;
        if (!$c) {
            $res_body = encode_json({ ok => JSON::PP::false, error => "Classroom not found" });
        } else {
            # Save assignment state in database
            $c->{active_assignment} = {
                topic => $topic,
                level => $level,
                deadline => $deadline,
                roomKey => $rk,
                roomHash => $room_hash,
                classroomData => $data->{classroomData} || undef,
                assigned_at => time()
            };
            write_db($db);

            my $students = $c->{students} || [];
            my $sent_count = 0;
            my $cname = $c->{name} || "Sinf";

            # Clean and lightweight student link that NEVER exceeds Telegram's 4096-char limit
            my $student_link = "$PUBLIC_URL/index.html#class=" . $rk . "&role=student";

            my $tag = $topic;
            $tag =~ s/[^a-zA-Z0-9]//g;
            $tag = "Dars" unless $tag;

            my $student_msg = "📚 <b>YANGI UYGA VAZIFA!</b>\n" .
              "━━━━━━━━━━━━━━━━━━━━\n" .
              "👥 <b>Sinf:</b> $cname\n" .
              "📌 <b>Mavzu:</b> $topic (#$tag)\n" .
              "🎯 <b>Daraja:</b> $level\n" .
              "⏳ <b>Topshirish muddati:</b> $deadline (#Deadline)\n" .
              "━━━━━━━━━━━━━━━━━━━━\n" .
              "👇 <b>Dars va vazifani ochish uchun bosing:</b>\n" .
              "$student_link\n\n" .
              "<i>💡 Havolani oching, slaydlar va darsni o\x27rganib, sahifa oxiridagi <b>\x27Topshirish (Submit)\x27</b> tugmasi orqali vazifani topshiring!</i>";

            my $kb = {
                inline_keyboard => [
                    [ { text => "\xF0\x9F\x9A\x80 Darslik & Vazifani Ochish", url => $student_link } ]
                ]
            };

            for my $sid (@$students) {
                send_telegram_dm($sid, $student_msg, $kb);
                $sent_count++;
            }

            # Notify teacher
            if ($c->{teacher_id}) {
                my $teacher_msg = "🚀 <b>VAZIFA O\x27QUVCHILARGA YETKAZILDI!</b>\n" .
                  "━━━━━━━━━━━━━━━━━━━━\n" .
                  "📚 <b>Mavzu:</b> $topic\n" .
                  "👥 <b>Guruh:</b> $cname\n" .
                  "📨 <b>O\x27quvchilar soni:</b> $sent_count ta o\x27quvchiga avtomatik yuborildi.\n" .
                  "━━━━━━━━━━━━━━━━━━━━\n" .
                  "<i>O\x27quvchilar vazifani bajarib topshirganda, natijalar to\x27g\x27ridan-to\x27g\x27ri sizga yuboriladi!</i>";
                send_telegram_dm($c->{teacher_id}, $teacher_msg);
            }

            $res_body = encode_json({
                ok => JSON::PP::true,
                sent_count => $sent_count,
                total_students => scalar @$students
            });
        }

        print $client "HTTP/1.1 200 OK\r\n";
        print $client "Content-Type: application/json; charset=utf-8\r\n";
        print $client "Access-Control-Allow-Origin: *\r\n";
        print $client "Content-Length: " . length($res_body) . "\r\n";
        print $client "Connection: close\r\n\r\n";
        print $client $res_body;
        close $client;
        next;
    }

    # API: POST /api/generate-curriculum (Backend Google Gemini AI Engine)
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

        my $GEMINI_KEY = $ENV{GEMINI_API_KEY} || "AIzaSyBmXda2F3ehCvoOaETwNV25YrFeMoKDEiE";
        my @models_to_try = ("gemini-flash-lite-latest", "gemini-3.1-flash-lite", "gemini-3.8-flash");

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
                temperature => 0.3
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
                my $cmd = qq{/usr/bin/curl -s --connect-timeout 10 --max-time 45 -X POST "https://generativelanguage.googleapis.com/v1beta/models/$m:generateContent?key=$GEMINI_KEY" -H "Content-Type: application/json" --data-binary \@$tmp_req > $tmp_res};
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
                            print "Model $m failed or busy, trying fallback model...\n";
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
            $res_body = encode_json({ ok => JSON::PP::true, curriculum => $curriculum });
        } else {
            $res_body = encode_json({ ok => JSON::PP::false, error => "Gemini generation failed" });
        }

        print $client "HTTP/1.1 200 OK\r\n";
        print $client "Content-Type: application/json; charset=utf-8\r\n";
        print $client "Access-Control-Allow-Origin: *\r\n";
        print $client "Content-Length: " . length($res_body) . "\r\n";
        print $client "Connection: close\r\n\r\n";
        print $client $res_body;
        close $client;
        next;
    }

    # Static file serving
    $path = "/index.html" if $path eq "/";
    my $file = $BASE_DIR . $path;
    if (-f $file) {
        open(my $fh, "<:raw", $file);
        my $content = do { local $/; <$fh> };
        close($fh);

        my $type = "text/html; charset=utf-8";
        $type = "application/javascript" if $file =~ /\.js$/;
        $type = "text/css" if $file =~ /\.css$/;
        $type = "image/png" if $file =~ /\.png$/;
        $type = "image/jpeg" if $file =~ /\.jpg$/;

        print $client "HTTP/1.1 200 OK\r\n";
        print $client "Content-Type: $type\r\n";
        print $client "Content-Length: " . length($content) . "\r\n";
        print $client "Access-Control-Allow-Origin: *\r\n";
        print $client "Connection: close\r\n\r\n";
        print $client $content;
    } else {
        my $msg = "404 Not Found";
        print $client "HTTP/1.1 404 Not Found\r\n";
        print $client "Content-Type: text/plain\r\n";
        print $client "Content-Length: " . length($msg) . "\r\n";
        print $client "Connection: close\r\n\r\n";
        print $client $msg;
    }
    close($client);
}
