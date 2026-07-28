<?php
include("../conf/config.php");

//print_r($_SESSION);
//exit();
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml"> 
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <!-- System ERP :: Src js  -->
        <?php include("../lib/loadJs.php"); ?>
        <?php include("../lib/loadCss.php"); ?>
        <style>
            .loader {
                border: 4px solid #B9B9B9;
                border-radius: 50%;
                border-top: 4px solid #3498db;
                width: 12px;
                height: 12px;
                -webkit-animation: spin 1s linear infinite;
                /* Safari */
                animation: spin 1s linear infinite;
            }

            .color-green {
                background: #E4FFE4;
            }

            .color-red {
                background: #FFEBEB;
            }

            .color-grey {
                background: #E6E6E6;
            }

            .color-yellow {
                background: #FEF8C2;
            }

            .td-primary {
                background: #FEFAD1;
            }
            .x-grid3-hd-company {
                background: transparent
                    url(../js/resources/images/icons/silk/building.png)
                    no-repeat 3px 3px ! important;
                padding-left:20px;
            }   .x-btnss:{
    border: 0 none; 
    padding-left: 3px;
    padding-right: 3px;
    cursor: pointer;
    margin: 0;
    overflow: visible;
    width: auto;
    -moz-outline: 0 none;
    outline: 0 none;
    background-color: #FFEBEB;
},
        </style>
        <title><?php echo COMPANY_NAME; ?></title> 
        <title><?php echo COMPANY_NAME; ?></title>

        <script type="text/javascript">
            Ext.C_CODE_SYS = "SP";
            Ext.I_STATUS_BEFORE = 0;
            Ext.I_STATUS = 0; 
            Ext.I_SUB_STATUS_BEFORE = '0.20';
            Ext.I_SUB_STATUS = '0.30'; //บันทึกใบขอเบิก
            Ext.SS_I_TYPE_USER = <?php echo $_SESSION["i_type_user"]; ?>;
            Ext.SS_DC_COST_ID = <?php echo $_SESSION["dc_cost_id"]; ?>;
            Ext.DateNow = "<?php echo date('Y-m-d') ?>";
            Ext.INSIDE_COST = true;
            Ext.rec = null;
            //set storeDefault
/*

1	APSTEPS10	พนักงานผู้ดำเนินการ ลงนามตรวจสอบ
2	APSTEPS20	หัวหน้าสายงานซื้อจ้าง ลงนามตรวจสอบ
3	APSTEPS30	หัวหน้าพัสดุ ลงนามตรวจสอบ
4	APSTEPS40	รองคณะบดี ลงนามตรวจสอบ
5	APSTEPS50	คณะบดีลงนามอนุมัติเอกสาร*/        
            Ext.status_sigature_document = 'APSTEPSAUDIT01'; //APSTEPS[10-50]
            Ext.title = 'บันทึกขอ <font color="/blue/">(ลงนาม เอกสารภายใน) เอกสารที่ดำเนินการ</font>';
            Ext.keyData = 1;
            Ext.menu_i_alarm = 1;
            Ext.menu_i_day = 1;
            Ext.store_i_edit = true,
            Ext.menu_id = 1;
            Ext.store_enable = 1;
            Ext.PATH_DOCUMENTS = '<?php echo PATH_DOCUMENTS;?>';
 

        </script>
        <!-- System ERP :: -->
        <script type="text/javascript" src="../lib/right/GrantPermission.php?_dc=<?= __VPRODUCT_; ?>&f=<?php echo $_SERVER["PHP_SELF"]; ?>"></script>
        <script type="text/javascript" src="app/conf/config.json"></script>
        <script type="text/javascript" src="./uiData/configStoreUi.js?_dc=<?= __VPRODUCT_; ?>"></script>
        <script type="text/javascript" src="../js/config_function.js?dc=<?= __VPRODUCT_ ?>"></script>
        <script language="javascript" src="../js/RowExpander.js"></script> 
        <script language="javascript" src="../js/TreeGrid/TreeGrid.js"></script> 
        <!-- System ERP :: -->
 
     <!--Doument Sing--> 
        <script type="text/javascript" src="app/spAddDoc/stores.js?_dc=<?= __VPRODUCT_; ?>"></script>        
        <script type="text/javascript" src="app/spAddDoc/FormGrid.js?_dc=<?= __VPRODUCT_; ?>"></script> 
        <script type="text/javascript" src="app/spAddDoc/FormAdd.js?_dc=<?= __VPRODUCT_; ?>"></script>
        <script type="text/javascript" src="app/spAddDoc/FormAddDtl.js?_dc=<?= __VPRODUCT_; ?>"></script>
        <script type="text/javascript" src="app/spAddDoc/FormGridDtl.js?_dc=<?= __VPRODUCT_; ?>"></script>
        <script type="text/javascript" src="app/js/view-docs.js?_dc=<?= __VPRODUCT_; ?>"></script>
    </head>

    <body>
    </body>

</html>