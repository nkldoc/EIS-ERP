<?PHP
require_once("../conf/config.php");

if (!isset($_SESSION['user_id'])) {
	echo "<script>window.top.location.href =\"../access/signin.php\"</script>";
	exit;
}
