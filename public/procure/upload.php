<?PHP require_once("conf/config.php");
ob_start();     // Turn on output buffering
//Java Session
require_once("java/Java.inc");
$session = procure_java_session();

if (java_is_null($session->get("user_name"))) {
    $session->put("user_name", $ss_username);
}
if (java_is_null($session->get("user_id"))) {
    $session->put("user_id", $ss_user_id);
}
if (java_is_null($session->get("dc_cost_id"))) {
    $session->put("dc_cost_id", $ss_cost_id);
}
if (java_is_null($session->get("sp_emp_id"))) {
    $session->put("sp_emp_id", $ss_emp_id);
}

$user_name = java_values($session->get("user_name"));
$user_id = java_values($session->get("user_id"));
$dc_cost_id = java_values($session->get("dc_cost_id"));
$sp_emp_id = java_values($session->get("sp_emp_id"));

//Java check is null || php

if ((!$user_id) || (!isset($_SESSION['user_id']))) {
    echo "<script>window.location.href =\"access/signin.php\"</script>";
    exit;
}

echo "<h1> Domain ".DOMAIN['th']." JAVA SESSION ::  {$user_name} ,{$user_id} ,{$dc_cost_id},{$sp_emp_id} </h1>"; 
//exit();
?>
<!DOCTYPE html> 
<html> 
<head> 
<title> Java File Upload Servlet Example </title> 
</head> 
<body>

  <form method="post" action="fileuploadservlet" enctype="multipart/form-data">
    <input type="file" name="file" />
    <input type="submit" value="Upload" />
  </form>

    <!-- HTML5 Input Form Elements -->
    <input id="fileupload" type="file" name="fileupload" />
    <button id="upload-button" onclick="uploadFile()"> Upload </button>

    <!-- Ajax JavaScript File Upload Logic -->
    <script>
    async function uploadFile() {

    let formData = new FormData();
    formData.append("file", fileupload.files[0]);
    formData.append("dir", "D:\\ExportFile\\");
    await fetch('./FileUploadServletJson', {
      method: "POST",
      body: formData
    });
    alert('The file has been uploaded successfully.');
    }
    </script>
</body>
</html>
