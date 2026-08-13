<?php
    include("../conf/config.php"); 
    include("conf/configTax.php");
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
	<title><?php echo COMPANY_NAME;?></title> 
		 
	<!-- System ERP :: Src js  -->
        <?php include("../lib/loadJs.php"); ?> 
        <?php include("../lib/loadCss.php"); ?>  
	<!-- System ERP :: Permission -->
        <script type="text/javascript" src="../lib/right/GrantPermission.php?_dc=<?php echo rand(0,100000); ?>&f=<?php echo $_SERVER["PHP_SELF"];?>"></script>
	<!-- System ERP :: -->
        <style type="text/css">
            .ui-space{
                padding:18px;
            }
            .txtBlue{
                color:blue;
            }
            .txtRed{
                color:red;
            }
            .lblShow{
                padding-left:5px;
                padding-right:5px;
            }
        </style>
        <script type="text/javascript">
            //มีรายการภาษีเงินได้สำหรับจัดซื้อจัดจ้าง  รายการภาษีเงินไดั dc_tax_customer.i_is_type:
            Ext.DC_TAX_IS_INCOME = <?php echo DC_TAX_IS_INCOME; ?>;//มีรายการภาษีเงินได้สำหรับจัดซื้อจัดจ้าง
            Ext.DC_TAX_IS_INCOME_NONE = <?php echo DC_TAX_IS_INCOME_NONE; ?>;//ไม่มีรายการภาษีเงินได้สำหรับจัดซื้อจัดจ้าง
            
            //การคิดภาษีหัก ณ ที่จ่ายของประเภทกิจการ (ระบบเจ้าหนี้/บริหารการเงิน ตรวจจ่าย) ตาราง dc_tax_customer.i_type_tax
            Ext.TAX_NOT = <?php echo TAX_NOT; ?>;//ยังไม่ระบุ
            Ext.TAX_JURISTIC_PERSON = <?php echo TAX_JURISTIC_PERSON; ?>;//นิติบุคคล
            Ext.TAX_NORMAL_PERSON = <?php echo TAX_NORMAL_PERSON; ?>;//บุคคลธรรมดา
        </script>
        <script type="text/javascript" src="js/DcTaxCustomer.js?_dc=<?php echo rand(0,100000); ?>"></script>
    </head>
    <body>
    </body>
</html>