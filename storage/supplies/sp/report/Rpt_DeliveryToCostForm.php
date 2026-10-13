<!DOCTYPE html>
<html lang="th">
<head>
<meta charset="UTF-8">
<title>UI Report</title>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css">
<style>
  body { font-family: Tahoma, sans-serif; margin: 20px; }
  form { margin-bottom: 15px; padding: 10px; background: #f4f4f4; border-radius: 8px; }
  label { margin-right: 10px; }
  iframe { width: 100%; height: 600px; border: 1px solid #aaa; border-radius: 6px; }
  button {
    padding: 8px 14px;
    margin-left: 5px;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    cursor: pointer;
    transition: 0.2s;
  }
  button i { margin-right: 6px; }
  button[value="view"] { background: #007bff; color: white; }
  button[value="excel"] { background: #28a745; color: white; }
  button:hover { opacity: 0.85; }
</style>
</head>
<body>

<h2>ระบบออกรายงานโครงการ</h2>

<form id="reportForm" target="reportFrame" method="get" action="Rpt_DeliveryToCost.php">
  <label>
    เลือกปีงบประมาณ:
    <select name="year">
      <option value="65">2565</option>
      <option value="66">2566</option>
      <option value="67">2567</option>
      <option value="68">2568</option>
    </select>
  </label>

  <label>
    หน่วยงาน:
    <select name="unit">
      <option value="">-- ทั้งหมด --</option>
      <option value="office">สำนักงานสภามหาวิทยาลัย</option>
      <option value="admin">สำนักงานอธิการบดี</option>
    </select>
  </label>

  <button type="submit" name="action" value="view">
    <i class="fa-solid fa-chart-column"></i> แสดงรายงาน
  </button>

  <button type="submit" name="action" value="excel">
    <i class="fa-solid fa-file-excel"></i> Export to Excel
  </button>
</form>

<iframe name="reportFrame"></iframe>

</body>
</html>
