#!/usr/bin/env perl
use strict;
use warnings;
use utf8;
use open ':std', ':encoding(UTF-8)';
use JSON::PP;
use Encode qw(encode decode);

use FindBin;

my $BOT_TOKEN  = $ENV{BOT_TOKEN} || "8979510433:AAGd4TEZb_rx4b8lZrFFfJfAz-dAI2ZRzMw";
my $BASE_DIR   = $ENV{BASE_DIR} || "$FindBin::Bin/..";
my $DB_FILE    = $ENV{DB_FILE} || "$FindBin::Bin/database.json";
my $PUBLIC_URL = $ENV{PUBLIC_URL} || "http://127.0.0.1:8080";

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
    open(my $fh, '>:raw', $DB_FILE) or die "Cannot write to $DB_FILE: $!";
    print $fh encode_json($data);
    close($fh);
}

sub default_db {
    return {
        teachers => {},    # chat_id => { username => ..., classrooms => [ { roomKey, name, url } ] }
        students => {},    # chat_id => { name => ..., classrooms => [ roomKey ] }
        classrooms => {},  # roomKey => { name => ..., teacher_id => ..., students => [ chat_id ] }
        user_state => {}   # chat_id => { state => ..., temp => ... }
    };
}

# Clean Telegram API wrapper writing pure UTF-8 bytes to temp file
sub call_tg {
    my ($method, $payload) = @_;
    my $json_bytes = encode_json($payload);
    
    my $tmp_file = "/tmp/tg_payload_$$.json";
    open(my $th, '>:raw', $tmp_file) or return undef;
    print $th $json_bytes;
    close($th);

    my $url = "https://api.telegram.org/bot$BOT_TOKEN/$method";
    my $cmd = "curl -s -X POST '$url' -H 'Content-Type: application/json; charset=utf-8' -d \@$tmp_file";
    my $res = `$cmd`;
    unlink $tmp_file;

    return eval { decode_json($res) };
}

sub send_msg {
    my ($chat_id, $text, $reply_markup) = @_;
    my $payload = {
        chat_id    => $chat_id,
        text       => $text,
        parse_mode => "HTML"
    };
    $payload->{reply_markup} = $reply_markup if $reply_markup;
    return call_tg("sendMessage", $payload);
}

# Main polling loop
print "TeacherOS Telegram Bot (v2 Clean UTF-8) is running...\n";
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

sub handle_update {
    my ($upd) = @_;
    my $db = load_db();

    # Handle Callback Queries (Inline Buttons)
    if ($upd->{callback_query}) {
        my $cb = $upd->{callback_query};
        my $chat_id = $cb->{from}->{id};
        my $data = $cb->{data};

        call_tg("answerCallbackQuery", { callback_query_id => $cb->{id} });

        if ($data eq 'role_teacher') {
            handle_teacher_menu($chat_id, $db, $cb->{from});
        }
        elsif ($data eq 'role_student') {
            $db->{user_state}->{$chat_id} = { state => 'AWAIT_STUDENT_NAME' };
            save_db($db);
            send_msg($chat_id, "<b>O'quvchi xush kelibsiz!</b>\n\nIltimos, o'z <b>Ism va Familiyangizni</b> kiriting:\n(Masalan: <i>Jasur Aliyev</i>)");
        }
        elsif ($data eq 'teacher_my_classes') {
            show_teacher_classes($chat_id, $db);
        }
        elsif ($data eq 'teacher_new_class') {
            $db->{user_state}->{$chat_id} = { state => 'AWAIT_CLASS_NAME' };
            save_db($db);
            send_msg($chat_id, "<b>Yangi Sinf Ochish</b>\n\nGuruh yoki sinf nomini kiriting:\n(Masalan: <i>Evening B1 IELTS</i>)");
        }
        elsif ($data eq 'teacher_join_code') {
            $db->{user_state}->{$chat_id} = { state => 'AWAIT_TEACHER_KEY' };
            save_db($db);
            send_msg($chat_id, "<b>Mavjud Sinfga Kirish</b>\n\nSinf Kodini (Classroom Key) kiriting:\n(Masalan: <code>TOS-K9X2-M4B7-Q8W1</code>)");
        }
        elsif ($data =~ /^view_class_(.+)$/) {
            my $rk = $1;
            show_classroom_details($chat_id, $rk, $db);
        }
        return;
    }

    # Handle Normal Messages
    return unless $upd->{message} && $upd->{message}->{text};
    my $msg = $upd->{message};
    my $chat_id = $msg->{chat}->{id};
    my $text = $msg->{text};
    $text =~ s/^\s+|\s+$//g;

    # /start command
    if ($text =~ m{^/start}) {
        # Check deep-link parameter: /start TOS_XXXX
        if ($text =~ m{^/start\s+(.+)$}) {
            my $arg = $1;
            $arg =~ s/_/-/g; # Telegram changes dash to underscore in deep links
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

    # /myclassrooms or /sinflarim
    if ($text =~ m{^/(myclassrooms|sinflarim|classes)}) {
        show_teacher_classes($chat_id, $db);
        return;
    }

    # State Machine Handling
    my $state_info = $db->{user_state}->{$chat_id};
    if ($state_info) {
        my $st = $state_info->{state};

        # Student states
        if ($st eq 'AWAIT_STUDENT_NAME') {
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

        # Teacher states
        elsif ($st eq 'AWAIT_CLASS_NAME') {
            my $className = $text;
            create_new_teacher_classroom($chat_id, $className, $db, $msg->{from});
            return;
        }
        elsif ($st eq 'AWAIT_TEACHER_KEY') {
            my $rk = uc($text);
            link_teacher_to_existing_key($chat_id, $rk, $db);
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
        # Returning Teacher with existing classes
        show_teacher_classes($chat_id, $db);
    } else {
        # New Teacher
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
    my ($chat_id, $rk, $db) = @_;
    my $c = $db->{classrooms}->{$rk};
    if (!$c) {
        send_msg($chat_id, "Sinf topilmadi.");
        return;
    }

    my $st_count = scalar @{ $c->{students} || [] };
    my $bot_invite = "https://t.me/teacherOS_tg_bot?start=" . ($rk =~ s/-/_/gr);

    # Direct Web Link to Teacher Studio
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
            [ { text => "🖥️ Ustoz Studiyasini Ochish", url => $web_direct_url } ],
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
    my ($chat_id, $rk, $db) = @_;
    my $c = $db->{classrooms}->{$rk};

    if (!$c) {
        send_msg($chat_id, "Bunday kodli sinf topilmadi. Kodni to'g'ri kiritganingizni tekshiring.");
        return;
    }

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
      "Endi ustozingiz dars va vazifa berganda, bot avtomatik ravishda sizga barcha havolalarni xeshteglar bilan yetkazib beradi!";

    send_msg($chat_id, $welcome_text);

    # Notify teacher
    if ($c->{teacher_id}) {
        send_msg($c->{teacher_id}, "<b>Yangi o'quvchi qo'shildi!</b>\n\nO'quvchi: <b>$name</b>\nGuruh: <b>" . $c->{name} . "</b>");
    }
}
