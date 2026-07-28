<?PHP require_once("conf/config.php");
ob_start();     // Turn on output buffering
$ss_user_id = $_SESSION["user_id"] ?? null; 
if (!$ss_user_id) { 
    session_destroy();
    echo "<script>window.location.href =\"./access/signin.php\"</script>";
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

</body>
</html>