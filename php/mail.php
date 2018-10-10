<?php

$to = "andrytsy@mail.ru";
$sitename = "Конфигуратор стеллажных конструкций";

$name = trim($_POST["username"]);
$email = trim($_POST["email"]);
$phone = trim($_POST["phone"]);
$message = trim($_POST["message"]);
$full_message = "Имя: $name \nПочта: $email \nТелефон: $phone \nТекст: $message";

$pagetitle = "Новая заявка с сайта \"$sitename\"";
$result = mail($to, $pagetitle, $full_message, " From: $email\r\nReply-to: $email\r\nContent-type: text/plain; charset=\"utf-8\"\r\n");
echo "Succes";