<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'vendor/autoload.php'; // ใช้เมื่อคุณติดตั้ง PHPMailer ผ่าน Composer

$mail = new PHPMailer(true); // สร้างวัตถุ PHPMailer

try {
    // ตั้งค่าการใช้งาน SMTP
    $mail->isSMTP();
    $mail->Host       = 'smtp.gmail.com';
    $mail->SMTPAuth   = true;
    $mail->Username   = 'eis@nmu.ac.th'; // ใส่อีเมลของคุณ
    $mail->Password   = 'nkl111111'; // ใส่รหัสผ่านของอีเมลของคุณ
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port       = 587;

    // ตั้งค่าผู้ส่งและผู้รับ
    $mail->setFrom('eis@nmu.ac.th', 'EIS Systems'); // ใส่อีเมลและชื่อผู้ส่ง
    $mail->addAddress('eak.ibanez@gmail.com', 'Eak Name'); // ใส่อีเมลและชื่อผู้รับ

    // เนื้อหาของอีเมล
    $mail->isHTML(true); // ตั้งค่าส่งอีเมลในรูปแบบ HTML
    $mail->Subject = 'Here is the subject';
    $mail->Body    = 'This is the HTML message body <b>in bold!</b>';
    $mail->AltBody = 'This is the body in plain text for non-HTML mail clients';

    $mail->send();
    echo 'Message has been sent';
} catch (Exception $e) {
    echo "Message could not be sent. Mailer Error: {$mail->ErrorInfo}";
}
?>
