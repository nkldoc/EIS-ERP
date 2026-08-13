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
            //การสรุปข้อมูล dc_tax_income.i_is_method:(1=ไม่ต้องสรุปข้อมูลรายปี, 2=ต้องสรุปข้อมูลรายปี)
            Ext.DC_TAX_INCOME_METHOD_NOSUM = <?php echo DC_TAX_INCOME_METHOD_NOSUM; ?>;//ไม่ต้องสรุปข้อมูลรายปี
            Ext.DC_TAX_INCOME_METHOD_ISSUM = <?php echo DC_TAX_INCOME_METHOD_ISSUM; ?>;//ต้องสรุปข้อมูลรายปี
            
            //ประเภทแบบ dc_tax_income.i_is_type:(1=แบบแสดงรายการประจำเดือน, 2=แบบสรุปรายการประจำปี)
            Ext.DC_TAX_INCOME_TYPE_MONTH = <?php echo DC_TAX_INCOME_TYPE_MONTH; ?>;//แบบแสดงรายการประจำเดือน
            Ext.DC_TAX_INCOME_TYPE_YEAR = <?php echo DC_TAX_INCOME_TYPE_YEAR; ?>;//แบบสรุปรายการประจำปี
        </script>
        <script type="text/javascript" src="js/DcTaxIncome.js?_dc=<?php echo rand(0,100000); ?>"></script>
    </head>
    <body>
    </body>
</html>