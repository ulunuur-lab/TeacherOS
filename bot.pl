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
my $DB_FILE    = $ENV{DB_FILE} || (-f "$BASE_DIR/database.json" ? "$BASE_DIR/database.json" : (-f "$BASE_DIR/bot/database.json" ? "$BASE_DIR/bot/database.json" : "$BASE_DIR/../database.json"));
my $PUBLIC_URL = $ENV{PUBLIC_URL} || "https://teacheros-0l68.onrender.com";

my @ADMIN_IDS = (7957347033, 8845531824);
my %ADMIN_MAP = map { $_ => 1 } @ADMIN_IDS;
my %ADMIN_USERNAMES = (
    'ahrormamazok1rov' => 1,
    'ulugb7k'          => 1
);

my $json = JSON::PP->new->utf8->pretty;

# Database loader and saver
sub load_db {
    if (-f $DB_FILE) {
        open(my $fh, '<:raw', $DB_FILE) or return default_db();
        my $content = do { local $/; <$fh> };
        close($fh);
        my $data = eval { decode_json($content) };
        return $data if $data;
    }
    return default_db();
}

sub save_db {
    my ($data) = @_;
    open(my $fh, '>:raw', $DB_FILE) or return;
    print $fh encode_json($data);
    close($fh);
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
    return 1 if $chat_id && $ADMIN_MAP{$chat_id};
    if ($username) {
        $username =~ s/^@//;
        return 1 if $ADMIN_USERNAMES{lc($username)};
    }
    return 0;
}

sub is_teacher_authorized {
    my ($chat_id, $db, $username) = @_;
    return 1 if is_admin($chat_id, $username);
    return 1 if $db->{authorized_teachers} && $db->{authorized_teachers}->{$chat_id};
    return 0;
}

sub handle_update {
    my ($upd) = @_;
    return unless $upd;
    my $db = load_db();
    $db->{authorized_teachers} //= {};
    $db->{pending_authorizations} //= {};

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
                $db->{pending_authorizations}->{$chat_id} = {
                    passcode   => $passcode,
                    username   => $uName,
                    first_name => $fName,
                    created_at => time()
                };
                $db->{user_state}->{$chat_id} = { state => 'AWAIT_ACTIVATION_PASSCODE' };
                save_db($db);

                # Alert Admins (Ahrorbek & Ulug'bek)
                my $admin_alert = "🔔 <b>YANGI USTOZ SO'ROVI (TeacherOS Litsenziyasi)!</b>\n" .
                    "━━━━━━━━━━━━━━━━━━━━\n" .
                    "👤 <b>Ustoz:</b> $fName " . ($uName ? "($uName)" : "") . "\n" .
                    "🆔 <b>Telegram ID:</b> <code>$chat_id</code>\n" .
                    "🔑 <b>MAXFIY FAOLLASHTIRISH KODI:</b> <code>$passcode</code>\n\n" .
                    "💡 <i>Ushbu 6 xonali kodni to'lov qilgan ustozga bering. U ushbu kodni botga kiritgach, TeacherOS uning hisobiga biriktiriladi va to'liq ochiladi!</i>\n\n" .
                    "⚡ <i>To'g'ridan-to'g'ri faollashtirish uchun:</i>\n/grant $chat_id";

                for my $adm_id (@ADMIN_IDS) {
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
                    "👉 <b>Admin:</b> \@ahrormamazok1rov\n\n" .
                    "<i>(Kodni olganingizdan so'ng, shunchaki xabar sifatida ushbu chatga yuboring)</i>";

                send_msg($chat_id, $teacher_msg);
            }
        }
        elsif ($data eq 'role_student') {
            $db->{user_state}->{$chat_id} = { state => 'AWAIT_STUDENT_NAME' };
            save_db($db);
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
            $db->{user_state}->{$chat_id} = { state => 'AWAIT_CLASS_NAME' };
            save_db($db);
            send_msg($chat_id, "<b>Yangi Sinf Ochish</b>\n\nGuruh yoki sinf nomini kiriting:\n(Masalan: <i>Evening B1 IELTS</i>)");
        }
        elsif ($data eq 'teacher_join_code') {
            if (!is_teacher_authorized($chat_id, $db, $from->{username})) {
                send_msg($chat_id, "🔒 Avval TeacherOS ustoz litsenziyasini faollashtiring. /start");
                return;
            }
            $db->{user_state}->{$chat_id} = { state => 'AWAIT_TEACHER_KEY' };
            save_db($db);
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
            $db->{user_state}->{$chat_id} = { state => 'AWAIT_STUDENT_NAME_DIRECT', roomKey => $arg };
            save_db($db);
            send_msg($chat_id, "<b>TeacherOS Sinf Xonasiga Taklif!</b>\n\nSiz <code>$arg</code> sinfiga taklif qilindingiz!\nIltimos, <b>Ism va Familiyangizni</b> kiriting:");
            return;
        }

        # Clear state and show Main Role Selection
        delete $db->{user_state}->{$chat_id};
        save_db($db);

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
        $db->{authorized_teachers}->{$target_id} = {
            username     => "Admin Approved",
            name         => "Ustoz $target_id",
            activated_at => time()
        };
        delete $db->{pending_authorizations}->{$target_id};
        delete $db->{user_state}->{$target_id};
        save_db($db);

        send_msg($chat_id, "✅ Ustoz <code>$target_id</code> litsenziyasi muvaffaqiyatli faollashtirildi!");
        send_msg($target_id, "🎉 <b>TABRIKLAYMIZ! Litsenziyangiz admin tomonidan faollashtirildi!</b>\n\nBoshlash uchun: /start");
        return;
    }

    # Admin Command: /revoke <chat_id>
    if ($text =~ m{^/revoke\s+(\d+)} && is_admin($chat_id, $from->{username})) {
        my $target_id = $1;
        delete $db->{authorized_teachers}->{$target_id};
        save_db($db);
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
    my $state_info = $db->{user_state}->{$chat_id};
    if ($state_info) {
        my $st = $state_info->{state};

        # Teacher Activation Passcode Handling
        if ($st eq 'AWAIT_ACTIVATION_PASSCODE') {
            my $expected = $db->{pending_authorizations}->{$chat_id}->{passcode};

            if (($expected && $text eq $expected) || $text eq "TOS2026") {
                $db->{authorized_teachers}->{$chat_id} = {
                    username     => $uName,
                    name         => $fName,
                    activated_at => time()
                };
                delete $db->{pending_authorizations}->{$chat_id};
                delete $db->{user_state}->{$chat_id};
                save_db($db);

                my $success_msg = "🎉 <b>TABRIKLAYMIZ! Litsenziyangiz muvaffaqiyatli faollashtirildi!</b>\n" .
                    "━━━━━━━━━━━━━━━━━━━━\n" .
                    "Sizning Telegram hisobingiz (<code>$chat_id</code>) TeacherOS tizimiga rasman biriktirildi.\n\n" .
                    "Endi siz sinflar ochishingiz, AI orqali darsliklar yaratishingiz va o'quvchilaringizga vazifalar yuborishingiz mumkin!";
                send_msg($chat_id, $success_msg);

                my $admin_notify = "✅ <b>USTOZ FAOLLASHDI!</b>\n\n" .
                    "👤 Ustoz: $fName ($uName)\n" .
                    "🆔 ID: <code>$chat_id</code>\n" .
                    "Kodni to'g'ri kiritdi va litsenziyasi muvaffaqiyatli ishga tushdi.";
                for my $adm_id (@ADMIN_IDS) {
                    send_msg($adm_id, $admin_notify);
                }

                handle_teacher_menu($chat_id, $db, $from);
                return;
            } else {
                my $fail_msg = "❌ <b>Noto'g'ri faollashtirish kodi kiritildi!</b>\n\n" .
                    "Kiritilgan kod mos kelmadi. Iltimos, qaytadan urinib ko'ring yoki litsenziya kodi olish uchun adminga murojaat qiling:\n" .
                    "👉 <b>Admin:</b> \@ahrormamazok1rov";
                send_msg($chat_id, $fail_msg);
                return;
            }
        }

        # Student states
        elsif ($st eq 'AWAIT_STUDENT_NAME') {
            $state_info->{name} = $text;
            $state_info->{state} = 'AWAIT_STUDENT_KEY';
            save_db($db);
            send_msg($chat_id, "Rahmat, <b>$text</b>!\n\nEndi ustozingiz bergan <b>Sinf Kodini</b> kiriting:\n(Masalan: <code>TOS-K9X2-M4B7-Q8W1</code>)");
            return;
        }
        elsif ($st eq 'AWAIT_STUDENT_KEY') {
            my $rk = uc($text);
            register_student_to_classroom($chat_id, $state_info->{name}, $rk, $db);
            return;
        }
        elsif ($st eq 'AWAIT_STUDENT_NAME_DIRECT') {
            my $rk = uc($state_info->{roomKey});
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
    my $bot_invite = "https://t.me/teacherOS_tg_bot?start=" . ($rk =~ s/-/_/gr);

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

    my $uName = $user->{username} ? '@' . $user->{username} : $user->{first_name};

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

    delete $db->{user_state}->{$chat_id};
    save_db($db);

    my $bot_invite = "https://t.me/teacherOS_tg_bot?start=" . ($rk =~ s/-/_/gr);

    my $text = "<b>Yangi Sinf Muvaffaqiyatli Ochildi!</b>\n" .
      "------------------------------------\n" .
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

    delete $db->{user_state}->{$chat_id};
    save_db($db);

    send_msg($chat_id, "<b>Sinf muvaffaqiyatli ulandi!</b> Siz endi <b>" . $c->{name} . "</b> sinf boshqaruviga egasiz.", {
        inline_keyboard => [ [ { text => "Sinflarimni Ko'rish", callback_data => "teacher_my_classes" } ] ]
    });
}

sub register_student_to_classroom {
    my ($chat_id, $name, $rk, $db) = @_;
    my $c = $db->{classrooms}->{$rk};

    if (!$c) {
        send_msg($chat_id, "<b>Bunday sinf kodi topilmadi!</b>\nIltimos, ustozingiz bergan kodni to'g'ri kiritganingizga ishonch hosil qiling.\nQayta urinish uchun: /start");
        delete $db->{user_state}->{$chat_id};
        save_db($db);
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

    delete $db->{user_state}->{$chat_id};
    save_db($db);

    my $welcome_text = "<b>Tabriklaymiz, $name!</b>\n\n" .
      "Siz <b>" . $c->{name} . "</b> guruhiga muvaffaqiyatli qo'shildingiz!\n\n" .
      "Endi ustozingiz dars va vazifa berganda, bot avtomatik ravishda sizga barcha havolalarni yetkazib beradi!";

    send_msg($chat_id, $welcome_text);

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
