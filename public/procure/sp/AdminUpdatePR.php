<?php include("../conf/config.php") ;
if (!isset($_SESSION['user_id'])) {
    echo "<script>window.top.location.href =\"../access/signin.php\"</script>";
    exit;
}
?>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <title><?php echo COMPANY_NAME ; ?></title>
        <!-- System ERP :: Src js  -->
        <?php include("../lib/loadJs.php") ; ?>
        <?php include("../lib/loadCss.php") ; ?>
        <!-- System ERP :: -->
        <script type="text/javascript" src="../lib/right/GrantPermission.php?_dc=<?=__VPRODUCT_ ; ?>&f=<?php echo $_SERVER[ "PHP_SELF" ] ; ?>"></script>
        <!-- System ERP :: -->
        <script type="text/javascript">
            if(!Ext.isEmpty(Ext.session)){
                console.log(Ext.session);
            }else{
                window.top.location.href = "../access/logout.php";
            }
        </script>
        <style>
            .buttonx {
                width: 100px;
                height: 60px;
                background: #fa4;
                border-radius: 5px;
                font-family: "Arial";
                font-size: 24px;
                border: 5px solid #afd;
            }
        </style>
        <script type="text/javascript" src="adminupdatepr/stores.js?_dc=<?= __VPRODUCT_; ?>"></script>
        <script type="text/javascript" src="adminupdatepr/FormAdd.js?_dc=<?= __VPRODUCT_; ?>"></script>
        <script type="text/javascript" src="adminupdatepr/FormGrid.js?_dc=<?= __VPRODUCT_; ?>"></script>
        <script type="text/javascript" src="adminupdatepr/FormGridDtl.js?_dc=<?= __VPRODUCT_; ?>"></script>
    </head>
    <body>
    </body>
</html>
