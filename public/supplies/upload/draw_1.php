<!DOCTYPE html>
<html lang="th">
    <head>
        <meta charset="UTF-8">
        <title>รวมไฟล์ PDF</title>
    </head>
    <body>
    <form action="/supplies/signner" method="post" enctype="multipart/form-data">
<!--    <input type="text" name="foldername" placeholder="ชื่อโฟลเดอร์" required>
    <input type="text" name="filename" placeholder="ชื่อไฟล์" required> 
    <input type="file" name="file" multiple required>
    <input type="text" name="showPages" value"1,2" placeholder="วางลายเซ็นหน้า" required> 

    <fieldset>
        <legend>เลือกผู้ที่จะแสดงใน PDF:</legend>
        <label><input type="checkbox" name="showNames" value="A"> นาย A (ผู้อนุมัติ)</label><br>
        <label><input type="checkbox" name="showNames" value="B"> นาย B (รองลงนาม)</label><br>
        <label><input type="checkbox" name="showNames" value="C"> นาย C (หัวหน้าพัสดุ)</label><br>
        <label><input type="checkbox" name="showNames" value="D"> นาย D (หัวหน้าซื้อจ้าง)</label><br>
        <label><input type="checkbox" name="showNames" value="E"> นาย E (ผู้ดำเนินการ)</label>
    </fieldset>

    <button type="submit">รวมไฟล์ PDF</button>-->
         <fieldset>
    <legend>เลือกผู้ที่จะแสดงใน PDF:</legend>

    <label>
      <input type="checkbox" name="signData" 
             value="JK.KUT|ผู้ช่วยศาสตราจารย์จักราวุธ มณีฤทธิ|คณบดีคณะแพทยศาสตร์วชิรพยาบาล|ปฏิบัติการแทนอธิการบด">
     ตำแหน่งที่ A
    </label><br>

    <label>
      <input type="checkbox" name="signData" 
             value="ANU.SANG|ผู้ช่วยศาสตราจารย์อนุแสง จิตสมเกษม|รองคณบดีคณะแพทยศาสตร์วชิรพยาบาล|รองคณบดีคณะแพทยศาสตร์วชิรพยาบาล">
    ตำแหน่งที่ B
    </label><br>

    <label>
      <input type="checkbox" name="signData" 
             value="PURI.CHAOR|นายภูริวัชร์ เชาว์โรจนนนท์|หัวหน้าเจ้าหนัาที่|หัวหน้าเจ้าหนัาที่">
    ตำแหน่งที่ C
    </label><br>

    <label>
      <input type="checkbox" name="signData" 
             value="PIYA.SUK|นางสาวปิยภรณ์ สุขประเสริฐ|หัวหนัาเจ้าที่ซื้อจ้าง|หัวหน้าเจ้าหนัาที่">
    ตำแหน่งที่ D
    </label><br>

    <label>
      <input type="checkbox" name="signData" 
             value="PIYA.SUK|นางสาวปิยภรณ์ สุขประเสริฐ|เจ้าหนัาที่|หัวหน้าเจ้าหนัาที่">
    ตำแหน่งที่ E
    </label><br>

    <input type="file" name="pdfFiles" multiple>
    <input type="text" name="filename" placeholder="ชื่อไฟล์">
    <input type="text" name="foldername" placeholder="ชื่อโฟลเดอร์">
    <input type="text" name="showPages" value="1,2"> <!-- หน้าใส่ลายเซ็น -->
    <button type="submit">รวม PDF</button>
  </fieldset>
  </form>
 
<?php
$filename = 'D:/Documents/images/output_combined_watermarked.pdf';
$command = escapeshellcmd("python3 get_outline.py " . escapeshellarg($filename));
$output = shell_exec($command);
echo nl2br($output);
?>
?>
 
    </body>
</html>
