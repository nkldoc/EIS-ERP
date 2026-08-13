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
            //dc_ta.i_cal  --คิด/หัก ภาษี (1=คิด/หัก, 2=ไม่คิด/หัก)
            Ext.TAX_CAL_YES = <?php echo TAX_CAL_YES; ?>;//คิด/หัก
            Ext.TAX_CAL_NO = <?php echo TAX_CAL_NO; ?>;//คิด/หัก
            
            //ประเภทการคิดภาษี ตาราง dc_tax.i_type_whtax
            Ext.TAX_BY_RATE = <?php echo TAX_BY_RATE; ?>;//หักตามอัตราภาษี
            Ext.TAX_BY_PROGRESS = <?php echo TAX_BY_PROGRESS; ?>;//หักตามอัตราก้าวหน้า
            Ext.TAX_BY_M48 = <?php echo TAX_BY_M48; ?>;//หักตามเกณฑ์มาตรา 48
            Ext.TAX_BY_PENSION = <?php echo TAX_BY_PENSION; ?>;//หัก ณ ที่จ่ายจากบำเหน็จ
            Ext.TAX_BY_NONE = <?php echo TAX_BY_NONE; ?>;//ไม่หัก ณ ที่จ่าย
            
            //กำหนดแสดงอัตราภาษีฯ dc_tax.i_show_by
            Ext.TAX_SHOW_BY_NONE = <?php echo TAX_SHOW_BY_NONE; ?>;//ไม่แสดงอัตราภาษีหัก ณ ที่จ่าย
            Ext.TAX_SHOW_BY_TAX = <?php echo TAX_SHOW_BY_TAX; ?>;//แสดง ตามอัตราภาษีหัก ณ ที่จ่าย
            Ext.TAX_SHOW_BY_PROGRESS = <?php echo TAX_SHOW_BY_PROGRESS; ?>;//แสดง แบบสะสมยอด อัตราก้าวหน้า
            
            //กำหนดแสดงชื่อภาษี สำหรับใบสำคัญจ่ายเงิน (Payment Voucher) dc_tax.i_show
            Ext.TAX_SHOW_NONE = <?php echo TAX_SHOW_NONE; ?>;// ไม่แสดงชื่อภาษี
            Ext.TAX_SHOW_NONE_ISPROGRESS = <?php echo TAX_SHOW_NONE_ISPROGRESS; ?>;// ไม่แสดงชื่อภาษี แต่สะสมยอดที่ภาษีหัก ณ ที่จ่ายอัตราก้าวหน้า
            Ext.TAX_SHOW_YES = <?php echo TAX_SHOW_YES; ?>;// แสดงชื่อภาษี
           
        </script>
        <script type="text/javascript" src="js/DcTax.js?_dc=<?php echo rand(0,100000); ?>"></script>
    </head>
    <body>
    </body>
</html>