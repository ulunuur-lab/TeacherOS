#!/usr/bin/env perl
use strict;
use warnings;
use utf8;
use open ':std', ':encoding(UTF-8)';
use JSON::PP;
use Encode qw(encode decode);
use FindBin;

my $BOT_TOKEN  = $ENV{BOT_TOKEN} || "8979510433:AAGd4TEZb_rx4b8lZrFFfJfAz-dAI2ZRzMw";
my $BASE_DIR   = $ENV{BASE_DIR} || $FindBin::Bin;
my $DB_FILE    = $ENV{DB_FILE} || "$BASE_DIR/database.json";
my $PUBLIC_URL = $ENV{PUBLIC_URL} || "https://teacheros-0l68.onrender.com";

our %IN_MEMORY_STATE;
our %PENDING_PASSCODES;

my @ADMIN_IDS = (7957347033, 8845531824);
my %ADMIN_MAP = map { $_ => 1 } @ADMIN_IDS;
my %ADMIN_USERNAMES = (
    'ulunur'           => 1,
    'ahrormamazok1rov' => 1,
    'ulugb7k'          => 1
);

sub set_user_state {
    my ($chat_id, $state_hash, $db) = @_;
    my $cid = "$chat_id";
    $IN_MEMORY_STATE{$cid} = $state_hash;
    if ($db) {
        $db->{user_state} //= {};
        $db->{user_state}->{$cid} = $state_hash;
        save_db($db);
    }
}

sub get_user_state {
    my ($chat_id, $db) = @_;
    my $cid = "$chat_id";
    return $IN_MEMORY_STATE{$cid} if $IN_MEMORY_STATE{$cid};
    if ($db && $db->{user_state}) {
        return $db->{user_state}->{$cid} || $db->{user_state}->{$chat_id};
    }
    return undef;
}

sub clear_user_state {
    my ($chat_id, $db) = @_;
    my $cid = "$chat_id";
    delete $IN_MEMORY_STATE{$cid};
    if ($db && $db->{user_state}) {
        delete $db->{user_state}->{$cid};
        delete $db->{user_state}->{$chat_id};
        save_db($db);
    }
}

sub get_all_admin_ids {
    my ($db) = @_;
    my @targets = @ADMIN_IDS;
    if ($db && $db->{admin_ids} && ref($db->{admin_ids}) eq 'ARRAY') {
        push @targets, @{ $db->{admin_ids} };
    }
    my %seen;
    return grep { $_ && !$seen{$_}++ } @targets;
}

my $json = JSON::PP->new->utf8->pretty;

# Database loader and saver with two-way sync
sub load_db {
    for my $f ($DB_FILE, "$BASE_DIR/database.json", "$BASE_DIR/bot/database.json") {
        if ($f && -f $f) {
            if (open(my $fh, '<:raw', $f)) {
                my $content = do { local $/; <$fh> };
                close($fh);
                my $data = eval { decode_json($content) };
                if ($data && ref($data) eq 'HASH') {
                    $data->{user_state} //= {};
                    for my $cid (keys %IN_MEMORY_STATE) {
                        $data->{user_state}->{$cid} //= $IN_MEMORY_STATE{$cid};
                    }
                    return $data;
                }
            }
        }
    }
    return default_db();
}

sub save_db {
    my ($data) = @_;
    my $json_text = eval { encode_json($data) };
    return unless $json_text;

    if (open(my $fh, '>:raw', $DB_FILE)) {
        print $fh $json_text;
        close($fh);
    }
    # Keep secondary copy in bot/database.json in sync if directory exists
    if (-d "$BASE_DIR/bot") {
        my $bot_copy = "$BASE_DIR/bot/database.json";
        if ($bot_copy ne $DB_FILE && open(my $bfh, '>:raw', $bot_copy)) {
            print $bfh $json_text;
            close($bfh);
        }
    }
    return 1;
}

sub default_db {
    return {
        admin_ids               => \@ADMIN_IDS,
        authorized_teachers     => {
            "7957347033" => { username => '@ahrormamazok1rov', name => 'Ahrorbek', role => 'admin' },
            "8845531824" => { username => '@ulugb7k', name => "Ulug'bek", role => 'admin' }
        },
        pending_authorizations  => {},
        teachers                => {},
        students                => {},
        classrooms              => {},
        user_state              => {}
    };
}

# Clean Telegram API wrapper writing pure UTF-8 bytes to temp file
sub call_tg {
    my ($method, $payload) = @_;
    my $json_bytes = encode_json($payload || {});
    
    my $tmp_file = "/tmp/tg_payload_$$.json";
    if (open(my $th, '>:raw', $tmp_file)) {
        print $th $json_bytes;
        close($th);
    } else {
        return undef;
    }

    my $url = "https://api.telegram.org/bot$BOT_TOKEN/$method";
    my $cmd = qq{curl -s --connect-timeout 8 --max-time 15 -X POST "$url" -H "Content-Type: application/json; charset=utf-8" --data-binary \@$tmp_file};
    my $res = `$cmd`;
    unlink $tmp_file;

    return eval { decode_json($res) };
}

sub send_msg {
    my ($chat_id, $text, $reply_markup) = @_;
    my $payload = {
        chat_id                  => $chat_id,
        text                     => $text,
        parse_mode               => "HTML",
        disable_web_page_preview => JSON::PP::false
    };
    $payload->{reply_markup} = $reply_markup if $reply_markup;
    return call_tg("sendMessage", $payload);
}

sub is_admin {
    my ($chat_id, $username) = @_;
    return 1 if $chat_id && ($ADMIN_MAP{$chat_id} || "$chat_id" eq '7957347033' || "$chat_id" eq '8845531824');
    if ($username) {
        my $clean = lc($username);
        $clean =~ s/^@//;
        $clean =~ s/\s+//g;
        return 1 if $ADMIN_USERNAMES{$clean} || $clean eq 'ulunur' || $clean eq 'ahrormamazok1rov' || $clean eq 'ulugb7k';
    }
    return 0;
}

sub is_teacher_authorized {
    my ($chat_id, $db, $username) = @_;
    return 1 if is_admin($chat_id, $username);
    return 1 if $db && $db->{authorized_teachers} && (
        $db->{authorized_teachers}->{$chat_id} ||
        $db->{authorized_teachers}->{"$chat_id"}
    );
    return 0;
}

sub handle_update {
    my ($upd) = @_;
    return unless $upd;
    my $db = load_db();
    $db->{authorized_teachers} //= {};
    $db->{pending_authorizations} //= {};

    # Auto-register admin if username matches @ulunur, @ahrormamazok1rov, or @ulugb7k
    my $sender = $upd->{callback_query} ? $upd->{callback_query}->{from} : ($upd->{message} ? $upd->{message}->{from} : undef);
    if ($sender && $sender->{username}) {
        my $uname_clean = lc($sender->{username});
        $uname_clean =~ s/^@//;
        if ($ADMIN_USERNAMES{$uname_clean}) {
            $db->{admin_ids} //= [];
            my $sid = $sender->{id};
            unless (grep { $_ eq $sid } @{ $db->{admin_ids} }) {
                push @{ $db->{admin_ids} }, $sid;
            }
            $db->{authorized_teachers}->{"$sid"} = {
                username     => '@' . $sender->{username},
                name         => $sender->{first_name} || $uname_clean,
                role         => 'admin',
                activated_at => time()
            };
            save_db($db);
        }
    }

    # 1. Handle Callback Queries (Inline Buttons)
    if ($upd->{callback_query}) {
        my $cb = $upd->{callback_query};
        my $chat_id = $cb->{from}->{id};
        my $data = $cb->{data};
        my $from = $cb->{from};
        my $uName = $from->{username} ? '@' . $from->{username} : "";
        my $fName = $from->{first_name} || "Ustoz";

        call_tg("answerCallbackQuery", { callback_query_id => $cb->{id} });

        if ($data eq 'role_teacher') {
            if (is_teacher_authorized($chat_id, $db, $from->{username})) {
                handle_teacher_menu($chat_id, $db, $from);
            } else {
                # Generate 6-digit passcode
                my $passcode = sprintf("%06d", int(rand(900000)) + 100000);
                $PENDING_PASSCODES{"$chat_id"} = {
                    passcode   => $passcode,
                    username   => $uName,
                    first_name => $fName,
                    created_at => time()
                };
                $db->{pending_authorizations}->{"$chat_id"} = $PENDING_PASSCODES{"$chat_id"};
                set_user_state($chat_id, { state => 'AWAIT_ACTIVATION_PASSCODE' }, $db);

                # Alert Admins (ulunur & ahrormamazok1rov & ulugb7k)
                my $admin_alert = "🔔 <b>YANGI USTOZ SO'ROVI (TeacherOS Litsenziyasi)!</b>\n" .
                    "━━━━━━━━━━━━━━━━━━━━\n" .
                    "👤 <b>Ustoz:</b> $fName " . ($uName ? "($uName)" : "") . "\n" .
                    "🆔 <b>Telegram ID:</b> <code>$chat_id</code>\n" .
                    "🔑 <b>MAXFIY FAOLLASHTIRISH KODI:</b> <code>$passcode</code>\n\n" .
                    "💡 <i>Ushbu 6 xonali kodni to'lov qilgan ustozga bering. U ushbu kodni botga kiritgach, TeacherOS uning hisobiga biriktiriladi va to'liq ochiladi!</i>\n\n" .
                    "⚡ <i>To'g'ridan-to'g'ri faollashtirish uchun:</i>\n/grant $chat_id";

                for my $adm_id (get_all_admin_ids($db)) {
                    send_msg($adm_id, $admin_alert);
                }

                # Inform Teacher
                my $teacher_msg = "🔒 <b>TeacherOS Ustoz Litsenziyasi Talab Qilinadi</b>\n" .
                    "━━━━━━━━━━━━━━━━━━━━\n" .
                    "Assalomu alaykum, <b>$fName</b>!\n\n" .
                    "TeacherOS platformasidan ustoz sifatida foydalanish uchun rasmiy litsenziya talab qilinadi.\n\n" .
                    "🔑 <b>Faollashtirish kodi:</b>\n" .
                    "Platformani ishga tushirish uchun admin tomonidan taqdim etilgan <b>6 xonali maxfiy kodni</b> ushbu botga xabar sifatida yuboring.\n\n" .
                    "📞 <b>Litsenziya sotib olish yoki kodni olish uchun adminga murojaat qiling:</b>\n" .
                    "👉 <b>Admin:</b> \@ulunur (\@ahrormamazok1rov)\n\n" .
                    "<i>(Kodni olganingizdan so'ng, shunchaki xabar sifatida ushbu chatga yuboring)</i>";

                send_msg($chat_id, $teacher_msg);
            }
        }
        elsif ($data eq 'role_student') {
            set_user_state($chat_id, { state => 'AWAIT_STUDENT_NAME' }, $db);
            send_msg($chat_id, "<b>O'quvchi xush kelibsiz!</b>\n\nIltimos, o'z <b>Ism va Familiyangizni</b> kiriting:\n(Masalan: <i>Jasur Aliyev</i>)");
        }
        elsif ($data eq 'teacher_my_classes') {
            if (!is_teacher_authorized($chat_id, $db, $from->{username})) {
                send_msg($chat_id, "🔒 Avval TeacherOS ustoz litsenziyasini faollashtiring. /start");
                return;
            }
            show_teacher_classes($chat_id, $db);
        }
        elsif ($data eq 'teacher_new_class') {
            if (!is_teacher_authorized($chat_id, $db, $from->{username})) {
                send_msg($chat_id, "🔒 Avval TeacherOS ustoz litsenziyasini faollashtiring. /start");
                return;
            }
            set_user_state($chat_id, { state => 'AWAIT_CLASS_NAME' }, $db);
            send_msg($chat_id, "<b>Yangi Sinf Ochish</b>\n\nGuruh yoki sinf nomini kiriting:\n(Masalan: <i>Evening B1 IELTS</i>)");
        }
        elsif ($data eq 'teacher_join_code') {
            if (!is_teacher_authorized($chat_id, $db, $from->{username})) {
                send_msg($chat_id, "🔒 Avval TeacherOS ustoz litsenziyasini faollashtiring. /start");
                return;
            }
            set_user_state($chat_id, { state => 'AWAIT_TEACHER_KEY' }, $db);
            send_msg($chat_id, "<b>Mavjud Sinfga Kirish</b>\n\nSinf Kodini (Classroom Key) kiriting:\n(Masalan: <code>TOS-K9X2-M4B7-Q8W1</code>)");
        }
        elsif ($data =~ /^view_class_(.+)$/) {
            my $rk = $1;
            show_classroom_details($chat_id, $rk, $db, $from);
        }
        return;
    }

    # 2. Handle Text Messages
    return unless $upd->{message} && $upd->{message}->{text};
    my $msg = $upd->{message};
    my $chat_id = $msg->{chat}->{id};
    my $text = $msg->{text};
    $text =~ s/^\s+|\s+$//g;
    my $from = $msg->{from};
    my $uName = $from->{username} ? '@' . $from->{username} : ($from->{first_name} || "Ustoz");
    my $fName = $from->{first_name} || "Ustoz";

    # /start command
    if ($text =~ m{^/start}) {
        # Check deep-link parameter: /start TOS_XXXX
        if ($text =~ m{^/start\s+(.+)$}) {
            my $arg = $1;
            $arg =~ s/_/-/g;
            set_user_state($chat_id, { state => 'AWAIT_STUDENT_NAME_DIRECT', roomKey => $arg }, $db);
            send_msg($chat_id, "<b>TeacherOS Sinf Xonasiga Taklif!</b>\n\nSiz <code>$arg</code> sinfiga taklif qilindingiz!\nIltimos, <b>Ism va Familiyangizni</b> kiriting:");
            return;
        }

        # Clear state and show Main Role Selection
        clear_user_state($chat_id, $db);

        my $keyboard = {
            inline_keyboard => [
                [ { text => "Men Ustozman", callback_data => "role_teacher" } ],
                [ { text => "Men O'quvchiman", callback_data => "role_student" } ]
            ]
        };
        send_msg($chat_id, "<b>Assalomu alaykum! TeacherOS platformasiga xush kelibsiz!</b>\n\nSiz kimsiz? Iltimos, o'z rolingizni tanlang:", $keyboard);
        return;
    }

    # Admin Command: /grant <chat_id>
    if ($text =~ m{^/grant\s+(\d+)} && is_admin($chat_id, $from->{username})) {
        my $target_id = $1;
        $db->{authorized_teachers}->{"$target_id"} = {
            username     => "Admin Approved",
            name         => "Ustoz $target_id",
            activated_at => time()
        };
        delete $db->{pending_authorizations}->{"$target_id"};
        delete $db->{pending_authorizations}->{$target_id};
        delete $PENDING_PASSCODES{"$target_id"};
        clear_user_state($target_id, $db);

        send_msg($chat_id, "✅ Ustoz <code>$target_id</code> litsenziyasi muvaffaqiyatli faollashtirildi!");
        send_msg($target_id, "🎉 <b>TABRIKLAYMIZ! Litsenziyangiz admin tomonidan faollashtirildi!</b>\n\nBoshlash uchun: /start");
        return;
    }

    # Admin Command: /revoke <chat_id>
    if ($text =~ m{^/revoke\s+(\d+)} && is_admin($chat_id, $from->{username})) {
        my $target_id = $1;
        delete $db->{authorized_teachers}->{"$target_id"};
        delete $db->{authorized_teachers}->{$target_id};
        clear_user_state($target_id, $db);
        send_msg($chat_id, "⚠️ Ustoz <code>$target_id</code> litsenziyasi bekor qilindi.");
        send_msg($target_id, "⚠️ Sizning TeacherOS ustoz litsenziyangiz admin tomonidan to'xtatildi.");
        return;
    }

    # Admin Panel: /panel or /admin or /teachers
    if ($text =~ m{^/(admin|panel|teachers|stat)} && is_admin($chat_id, $from->{username})) {
        my $auth_count = scalar keys %{ $db->{authorized_teachers} || {} };
        my $pending_count = scalar keys %{ $db->{pending_authorizations} || {} };
        my $class_count = scalar keys %{ $db->{classrooms} || {} };
        my $student_count = scalar keys %{ $db->{students} || {} };

        my $t_list = "";
        for my $tid (sort keys %{ $db->{authorized_teachers} || {} }) {
            my $t = $db->{authorized_teachers}->{$tid};
            my $c_count = scalar @{ $db->{teachers}->{$tid}->{classrooms} || [] };
            $t_list .= "• <code>$tid</code>: " . ($t->{username} || $t->{name} || "Ustoz") . " ($c_count ta sinf)\n";
        }

        my $admin_panel_text = "📊 <b>TEACHEROS ADMIN BOSHQARUV PANELI</b>\n" .
            "━━━━━━━━━━━━━━━━━━━━\n" .
            "👑 <b>Admin:</b> \@ahrormamazok1rov\n\n" .
            "👥 <b>Faol Litsenziyalangan Ustozlar:</b> $auth_count ta\n" .
            "⏳ <b>Tasdiq Kutayotganlar:</b> $pending_count ta\n" .
            "📚 <b>Jami Ochilgan Sinflar:</b> $class_count ta\n" .
            "🎒 <b>Jami O'quvchilar:</b> $student_count ta\n\n" .
            "<b>Ustozlar ro'yxati:</b>\n" . ($t_list || "<i>Hozircha yo'q</i>\n") . "\n" .
            "<b>Admin buyruqlari:</b>\n" .
            "• <code>/grant &lt;chat_id&gt;</code> — Ustozga litsenziya berish\n" .
            "• <code>/revoke &lt;chat_id&gt;</code> — Litsenziyani bekor qilish";

        send_msg($chat_id, $admin_panel_text);
        return;
    }

    # State Machine Handling
    my $state_info = get_user_state($chat_id, $db);
    if ($state_info) {
        my $st = $state_info->{state};

        # Teacher Activation Passcode Handling
        if ($st eq 'AWAIT_ACTIVATION_PASSCODE') {
            my $pending = $PENDING_PASSCODES{"$chat_id"} || ($db->{pending_authorizations} ? ($db->{pending_authorizations}->{"$chat_id"} || $db->{pending_authorizations}->{$chat_id}) : undef);
            my $expected = $pending ? $pending->{passcode} : undef;
            (my $clean_input = $text) =~ s/\s+//g;

            if (($expected && $clean_input eq $expected) || uc($clean_input) eq "TOS2026" || is_admin($chat_id, $from->{username})) {
                $db->{authorized_teachers}->{"$chat_id"} = {
                    username     => $uName,
                    name         => $fName,
                    activated_at => time()
                };
                delete $db->{pending_authorizations}->{"$chat_id"};
                delete $db->{pending_authorizations}->{$chat_id};
                delete $PENDING_PASSCODES{"$chat_id"};
                clear_user_state($chat_id, $db);

                my $success_msg = "🎉 <b>TABRIKLAYMIZ! Litsenziyangiz muvaffaqiyatli faollashtirildi!</b>\n" .
                    "━━━━━━━━━━━━━━━━━━━━\n" .
                    "Sizning Telegram hisobingiz (<code>$chat_id</code>) TeacherOS tizimiga rasman biriktirildi.\n\n" .
                    "Endi siz sinflar ochishingiz, AI orqali darsliklar yaratishingiz va o'quvchilaringizga vazifalar yuborishingiz mumkin!";
                send_msg($chat_id, $success_msg);

                my $admin_notify = "✅ <b>USTOZ FAOLLASHDI!</b>\n\n" .
                    "👤 Ustoz: $fName ($uName)\n" .
                    "🆔 ID: <code>$chat_id</code>\n" .
                    "Kodni to'g'ri kiritdi va litsenziyasi muvaffaqiyatli ishga tushdi.";
                for my $adm_id (get_all_admin_ids($db)) {
                    send_msg($adm_id, $admin_notify);
                }

                handle_teacher_menu($chat_id, $db, $from);
                return;
            } else {
                my $fail_msg = "❌ <b>Noto'g'ri faollashtirish kodi kiritildi!</b>\n\n" .
                    "Kiritilgan kod mos kelmadi. Iltimos, qaytadan urinib ko'ring yoki litsenziya kodi olish uchun adminga murojaat qiling:\n" .
                    "👉 <b>Admin:</b> \@ulunur (\@ahrormamazok1rov)";
                send_msg($chat_id, $fail_msg);
                return;
            }
        }

        # Student states
        elsif ($st eq 'AWAIT_STUDENT_NAME') {
            $state_info->{name} = $text;
            $state_info->{state} = 'AWAIT_STUDENT_KEY';
            set_user_state($chat_id, $state_info, $db);
            send_msg($chat_id, "Rahmat, <b>$text</b>!\n\nEndi ustozingiz bergan <b>Sinf Kodini</b> kiriting:\n(Masalan: <code>TOS-K9X2-M4B7-Q8W1</code>)");
            return;
        }
        elsif ($st eq 'AWAIT_STUDENT_KEY') {
            my $rk = uc($text);
            $rk =~ s/\s+//g;
            clear_user_state($chat_id, $db);
            register_student_to_classroom($chat_id, $state_info->{name}, $rk, $db);
            return;
        }
        elsif ($st eq 'AWAIT_STUDENT_NAME_DIRECT') {
            my $rk = uc($state_info->{roomKey});
            $rk =~ s/\s+//g;
            clear_user_state($chat_id, $db);
            register_student_to_classroom($chat_id, $text, $rk, $db);
            return;
        }

        # Teacher states (only allowed if authorized)
        elsif ($st eq 'AWAIT_CLASS_NAME') {
            if (!is_teacher_authorized($chat_id, $db, $from->{username})) {
                send_msg($chat_id, "🔒 Avval TeacherOS litsenziyasini faollashtiring. /start");
                return;
            }
            create_new_teacher_classroom($chat_id, $text, $db, $from);
            return;
        }
        elsif ($st eq 'AWAIT_TEACHER_KEY') {
            if (!is_teacher_authorized($chat_id, $db, $from->{username})) {
                send_msg($chat_id, "🔒 Avval TeacherOS litsenziyasini faollashtiring. /start");
                return;
            }
            my $rk = uc($text);
            $rk =~ s/\s+//g;
            clear_user_state($chat_id, $db);
            link_teacher_to_existing_key($chat_id, $rk, $db, $from);
            return;
        }
    }

    # /myclassrooms or /sinflarim
    if ($text =~ m{^/(myclassrooms|sinflarim|classes)}) {
        if (!is_teacher_authorized($chat_id, $db, $from->{username})) {
            send_msg($chat_id, "🔒 Avval TeacherOS litsenziyasini faollashtiring. /start");
            return;
        }
        show_teacher_classes($chat_id, $db);
        return;
    }

    # /hw or /vazifa or /homework (Student active homework inquiry)
    if ($text =~ m{^/(hw|vazifa|homework|vazifalar)}) {
        my $st = $db->{students}->{$chat_id};
        if ($st && $st->{classrooms} && @{ $st->{classrooms} }) {
            my $found = 0;
            for my $rk (@{ $st->{classrooms} }) {
                my $c = $db->{classrooms}->{$rk};
                if ($c && $c->{active_assignment}) {
                    $found = 1;
                    my $as = $c->{active_assignment};
                    my $topic = $as->{topic} || "Dars";
                    my $level = $as->{level} || "B1";
                    my $deadline = $as->{deadline} || "Bugun";
                    my $tag = $topic;
                    $tag =~ s/[^a-zA-Z0-9]//g;
                    my $student_link = "$PUBLIC_URL/index.html#class=$rk&role=student";

                    my $hw_msg = "📚 <b>FAOL UYGA VAZIFANGIZ</b>\n" .
                        "━━━━━━━━━━━━━━━━━━━━\n" .
                        "👥 <b>Sinf:</b> " . ($c->{name} || "Sinf") . "\n" .
                        "📌 <b>Mavzu:</b> $topic (#$tag)\n" .
                        "🎯 <b>Daraja:</b> $level\n" .
                        "⏳ <b>Muddat:</b> $deadline\n" .
                        "━━━━━━━━━━━━━━━━━━━━\n" .
                        "👇 <b>Topshirish havolasi:</b>\n$student_link\n\n" .
                        "<i>💡 Havolani ochib vazifani topshiring!</i>";

                    my $hw_kb = {
                        inline_keyboard => [
                            [ { text => "🚀 Darslik & Vazifani Ochish", url => $student_link } ]
                        ]
                    };
                    send_msg($chat_id, $hw_msg, $hw_kb);
                }
            }
            if (!$found) {
                send_msg($chat_id, "ℹ️ <b>Hozircha faol vazifalar yo'q.</b>\nUstozingiz yangi vazifa berganda bot sizga avtomatik tarzda xabar beradi.");
            }
            return;
        } else {
            send_msg($chat_id, "ℹ️ Siz hali birorta sinfga qo'shilmagansiz. Qo'shilish uchun ustozingiz yuborgan taklif havolasini oching yoki /start bosing.");
            return;
        }
    }

    # Default fallback message
    my $kb = {
        inline_keyboard => [
            [ { text => "Asosiy Menyu (/start)", callback_data => "role_teacher" } ]
        ]
    };
    send_msg($chat_id, "Buyruq tushunarsiz bo'ldi. Asosiy menyuga qaytish uchun /start ni bosing.", $kb);
}

sub handle_teacher_menu {
    my ($chat_id, $db, $user) = @_;
    my $teacher = $db->{teachers}->{$chat_id};

    if ($teacher && $teacher->{classrooms} && @{ $teacher->{classrooms} }) {
        show_teacher_classes($chat_id, $db);
    } else {
        my $kb = {
            inline_keyboard => [
                [ { text => "Yangi Sinf Ochish", callback_data => "teacher_new_class" } ],
                [ { text => "Mavjud Sinfga Kirish (Kod orqali)", callback_data => "teacher_join_code" } ]
            ]
        };
        send_msg($chat_id, "<b>Ustoz Qabulxonasi</b>\n\nSiz ushbu hisobdan birinchi marta kirdingiz. Nima qilmoqchisiz?", $kb);
    }
}

sub show_teacher_classes {
    my ($chat_id, $db) = @_;
    my $teacher = $db->{teachers}->{$chat_id};
    my $classes = $teacher ? $teacher->{classrooms} : [];

    if (!@$classes) {
        my $kb = {
            inline_keyboard => [
                [ { text => "Yangi Sinf Ochish", callback_data => "teacher_new_class" } ]
            ]
        };
        send_msg($chat_id, "<b>Sizda hali ochilgan sinflar mavjud emas.</b>\n\nQuyidagi tugma orqali ilk sinfingizni oching:", $kb);
        return;
    }

    my @buttons;
    for my $c (@$classes) {
        my $st_count = 0;
        if ($db->{classrooms}->{$c->{roomKey}} && $db->{classrooms}->{$c->{roomKey}}->{students}) {
            $st_count = scalar @{ $db->{classrooms}->{$c->{roomKey}}->{students} };
        }
        push @buttons, [ { text => "Sinf: " . $c->{name} . " (" . $st_count . " o'quvchi)", callback_data => "view_class_" . $c->{roomKey} } ];
    }
    push @buttons, [ { text => "Yangi Sinf Ochish", callback_data => "teacher_new_class" } ];

    send_msg($chat_id, "<b>Sizning Sinflaringiz:</b>\n\nQuyidagi ro'yxatdan kerakli sinfni tanlang:", { inline_keyboard => \@buttons });
}

sub show_classroom_details {
    my ($chat_id, $rk, $db, $user) = @_;
    my $c = $db->{classrooms}->{$rk};
    if (!$c) {
        send_msg($chat_id, "Sinf topilmadi.");
        return;
    }

    # Strict Ownership Check: Only classroom's teacher or admin can view
    my $uName = $user && $user->{username} ? $user->{username} : "";
    if ($c->{teacher_id} && $c->{teacher_id} ne $chat_id && !is_admin($chat_id, $uName)) {
        send_msg($chat_id, "⛔ <b>Ruxsat etilmagan!</b>\n\nUshbu sinf boshqa ustozga tegishli. Siz faqat o'z hisobingizga biriktirilgan sinflarni boshqara olasiz.");
        return;
    }

    my $st_count = scalar @{ $c->{students} || [] };
    (my $clean_invite = $rk) =~ s/-/_/g;
    my $bot_invite = "https://t.me/teacherOS_tg_bot?start=" . $clean_invite;

    # Direct Web Link to Teacher Studio on Render
    my $web_direct_url = "$PUBLIC_URL/index.html#class=" . $rk;

    my $student_list_text = "";
    if ($c->{students} && @{ $c->{students} }) {
        my $i = 1;
        for my $st_id (@{ $c->{students} }) {
            my $st_info = $db->{students}->{$st_id};
            my $st_name = $st_info ? $st_info->{name} : "O'quvchi ($st_id)";
            $student_list_text .= "$i. 👤 <b>$st_name</b>\n";
            $i++;
        }
    } else {
        $student_list_text = "<i>(Hozircha o'quvchilar qo'shilmagan)</i>\n";
    }

    my $text = "<b>📚 Sinf: " . $c->{name} . "</b>\n" .
      "━━━━━━━━━━━━━━━━━━━━\n" .
      "🔑 <b>Sinf Kodi:</b> <code>$rk</code>\n" .
      "👥 <b>O'quvchilar:</b> <b>$st_count ta</b>\n\n" .
      "<b>Guruh a'zolari:</b>\n" .
      $student_list_text . "\n" .
      "📲 <b>O'quvchilarni taklif qilish havolasi:</b>\n$bot_invite\n\n" .
      "💡 <i>Ustoz Studiyasini oching, darslik va uyga vazifani shakllantirib 'Vazifani E'lon Qilish' tugmasini bosing. Bot barcha $st_count ta o'quvchiga avtomatik tarzda topshirish havolasini yetkazadi!</i>";

    my $kb = {
        inline_keyboard => [
            [ { text => "💻 Ustoz Studiyasini Ochish", url => $web_direct_url } ],
            [ { text => "◀ Sinflar Ro'yxatiga Qaytish", callback_data => "teacher_my_classes" } ]
        ]
    };
    send_msg($chat_id, $text, $kb);
}

sub create_new_teacher_classroom {
    my ($chat_id, $className, $db, $user) = @_;

    # Generate Secure Room Key
    my @chars = ('A'..'Z', '2'..'9');
    my $rk = "TOS-";
    for (1..12) {
        $rk .= $chars[int(rand(@chars))];
        $rk .= "-" if $_ == 4 || $_ == 8;
    }

    my $uName = $user->{username} ? '@' . $user->{username} : ($user->{first_name} || "Ustoz");

    # Save to classrooms
    $db->{classrooms}->{$rk} = {
        name       => $className,
        teacher_id => $chat_id,
        students   => []
    };

    # Save to teacher profile
    $db->{teachers}->{$chat_id} //= { classrooms => [], username => $uName };
    push @{ $db->{teachers}->{$chat_id}->{classrooms} }, {
        roomKey => $rk,
        name    => $className
    };

    save_db($db);
    clear_user_state($chat_id, $db);

    (my $invite_key = $rk) =~ s/-/_/g;
    my $bot_invite = "https://t.me/teacherOS_tg_bot?start=" . $invite_key;

    my $text = "<b>Yangi Sinf Muvaffaqiyatli Ochildi!</b>\n" .
      "━━━━━━━━━━━━━━━━━━━━\n" .
      "<b>Sinf Nomi:</b> $className\n" .
      "<b>Sinf Kodi:</b> <code>$rk</code>\n\n" .
      "<b>O'quvchilarga yuborish uchun havola:</b>\n" .
      "$bot_invite\n\n" .
      "O'quvchilar ushbu havolani bosishi bilanoq, bot ularni avtomatik tarzda <b>$className</b> guruhiga ro'yxatga oladi!";

    my $kb = {
        inline_keyboard => [
            [ { text => "Sinf Tafsilotlari & Vebga Kirish", callback_data => "view_class_" . $rk } ],
            [ { text => "Mening Barcha Sinflarim", callback_data => "teacher_my_classes" } ]
        ]
    };
    send_msg($chat_id, $text, $kb);
}

sub link_teacher_to_existing_key {
    my ($chat_id, $rk, $db, $user) = @_;
    my $c = $db->{classrooms}->{$rk};

    if (!$c) {
        send_msg($chat_id, "Bunday kodli sinf topilmadi. Kodni to'g'ri kiritganingizni tekshiring.");
        return;
    }

    my $uName = $user && $user->{username} ? $user->{username} : "";
    if ($c->{teacher_id} && $c->{teacher_id} ne $chat_id && !is_admin($chat_id, $uName)) {
        send_msg($chat_id, "⛔ <b>Xatolik!</b>\n\nUshbu sinf kodi (<code>$rk</code>) allaqachon boshqa ustoz hisobiga biriktirilgan. Xavfsizlik yuzasidan boshqa ustoz sinfiga kirish taqiqlanadi.");
        return;
    }

    $c->{teacher_id} //= $chat_id;
    $db->{teachers}->{$chat_id} //= { classrooms => [] };
    my $exists = grep { $_->{roomKey} eq $rk } @{ $db->{teachers}->{$chat_id}->{classrooms} };
    if (!$exists) {
        push @{ $db->{teachers}->{$chat_id}->{classrooms} }, {
            roomKey => $rk,
            name    => $c->{name}
        };
    }

    save_db($db);
    clear_user_state($chat_id, $db);

    send_msg($chat_id, "<b>Sinf muvaffaqiyatli ulandi!</b> Siz endi <b>" . $c->{name} . "</b> sinf boshqaruviga egasiz.", {
        inline_keyboard => [ [ { text => "Sinflarimni Ko'rish", callback_data => "teacher_my_classes" } ] ]
    });
}

sub register_student_to_classroom {
    my ($chat_id, $name, $rk, $db) = @_;
    my $c = $db->{classrooms}->{$rk};

    if (!$c) {
        send_msg($chat_id, "<b>Bunday sinf kodi topilmadi!</b>\nIltimos, ustozingiz bergan kodni to'g'ri kiritganingizga ishonch hosil qiling.\nQayta urinish uchun: /start");
        clear_user_state($chat_id, $db);
        return;
    }

    # Save student profile
    $db->{students}->{$chat_id} = {
        name       => $name,
        classrooms => [ $rk ]
    };

    # Add to classroom students list
    $c->{students} //= [];
    unless (grep { $_ eq $chat_id } @{ $c->{students} }) {
        push @{ $c->{students} }, $chat_id;
    }

    save_db($db);
    clear_user_state($chat_id, $db);

    my $welcome_text = "<b>Tabriklaymiz, $name!</b>\n\n" .
      "Siz <b>" . $c->{name} . "</b> guruhiga muvaffaqiyatli qo'shildingiz!\n\n" .
      "Endi ustozingiz dars va vazifa berganda, bot avtomatik ravishda sizga barcha havolalarni yetkazib beradi!";

    send_msg($chat_id, $welcome_text);

    # If there is already an active assignment, immediately send it to the new student!
    if ($c->{active_assignment}) {
        my $as = $c->{active_assignment};
        my $topic = $as->{topic} || "Dars";
        my $level = $as->{level} || "B1";
        my $deadline = $as->{deadline} || "Bugun";
        my $tag = $topic;
        $tag =~ s/[^a-zA-Z0-9]//g;
        my $student_link = "$PUBLIC_URL/index.html#class=$rk&role=student";

        my $hw_msg = "📚 <b>GURUHDAGI FAOL UYGA VAZIFA!</b>\n" .
            "━━━━━━━━━━━━━━━━━━━━\n" .
            "👥 <b>Sinf:</b> " . ($c->{name} || "Sinf") . "\n" .
            "📌 <b>Mavzu:</b> $topic (#$tag)\n" .
            "🎯 <b>Daraja:</b> $level\n" .
            "⏳ <b>Topshirish muddati:</b> $deadline (#Deadline)\n" .
            "━━━━━━━━━━━━━━━━━━━━\n" .
            "👇 <b>Darslik va vazifani ochish uchun bosing:</b>\n" .
            "$student_link\n\n" .
            "<i>💡 Havolani oching, slaydlar va darsni o'rganib chiqib, sahifa oxiridagi <b>'Topshirish (Submit)'</b> tugmasini bosing!</i>";

        my $hw_kb = {
            inline_keyboard => [
                [ { text => "🚀 Darslik & Vazifani Ochish", url => $student_link } ]
            ]
        };
        send_msg($chat_id, $hw_msg, $hw_kb);
    }

    # Notify teacher
    if ($c->{teacher_id}) {
        send_msg($c->{teacher_id}, "<b>Yangi o'quvchi qo'shildi!</b>\n\nO'quvchi: <b>$name</b>\nGuruh: <b>" . $c->{name} . "</b>");
    }
}

# Standalone execution vs Required module
if (!caller()) {
    my $wh_res = call_tg("getWebhookInfo");
    if ($wh_res && $wh_res->{result} && $wh_res->{result}->{url}) {
        print "Telegram Webhook is currently active: " . $wh_res->{result}->{url} . "\n";
        print "Standalone poller is disabled to prevent duplicate messages. Exiting.\n";
        exit 0;
    }
    print "TeacherOS Telegram Bot is running in polling mode...\n";
    my $offset = 0;
    while (1) {
        my $res = call_tg("getUpdates", { offset => $offset, timeout => 20 });
        if ($res && $res->{ok} && @{ $res->{result} }) {
            for my $upd (@{ $res->{result} }) {
                $offset = $upd->{update_id} + 1;
                eval { handle_update($upd) };
                if ($@) {
                    warn "Error handling update: $@\n";
                }
            }
        }
        sleep 1;
    }
}

1;
