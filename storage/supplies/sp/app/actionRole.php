<?php
include("../../conf/config.php");

//print_r($_SESSION);
//exit();
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml"> 
   <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  
    <!-- ExtJS 3.4 -->
    <script type="text/javascript" src="../../js/jquery.js"></script> 
    <link href="../../js/ext-3.4.0/resources/css/ext-all.css" rel="stylesheet" type="text/css"/>
    
<link rel="stylesheet" type="text/css" title="gray" href="../../js/ext-3.4.0/resources/css/xtheme-blue.css" />
<link rel="stylesheet" type="text/css" href="../../css/icon_all.css" />
<link rel="stylesheet" type="text/css" href="../../css/switch.css" />
<link rel="stylesheet" type="text/css" href="../../js/ComboCheckBox/css/Ext.ux.form.LovCombo.css">
<link rel="stylesheet" type="text/css" href="../../js/ComboCheckBox/css/lovcombo.css">
<link rel="stylesheet" type="text/css" href="../../js/build/resources/css/ext-ux-livegrid.css" />
<link rel="stylesheet" type="text/css" href="../../js/fileUpload/css/fileuploadfield.css" />
<link rel="stylesheet" type="text/css" href="../../css/report_css.css" />
<link rel="stylesheet" type="text/css" href="../../js/examples/examples.css" />

    <script src="js/extjs3.4.1-1/ext-base.js" type="text/javascript"></script>
    <script src="js/extjs3.4.1-1/ext-all.js" type="text/javascript"></script>
<script type="text/javascript" src="../../js/Date/calendarOverride.js"></script>
<script type="text/javascript" src="../../js/config.js"></script>
<script type="text/javascript" src="../../js/InfoMainGrid.js"></script>
<script type="text/javascript" src="../../js/validationForm.js"></script>
<script type="text/javascript" src="../../js/Excel/Exporter-all.js"></script>
<script type="text/javascript" src="../../js/Ext.ux.util.js"></script>
<script type="text/javascript" src="../../js/ComboCheckBox/js/Ext.ux.form.ThemeCombo.js"></script>
<script type="text/javascript" src="../../js/ComboCheckBox/js/Ext.ui.ComboCheckBox.js"></script>
<script type="text/javascript" src="../../js/Ext.ux.LinkButton.js"></script>
<script type="text/javascript" src="../../js/Ext.ux.FileUpload.js"></script>
<script type="text/javascript" src="../../js/Ext.ux.Poplov.js"></script>
<!--<script type="text/javascript" src="../../js/Ext.ux.IdCardField.js"></script>
<script type="text/javascript" src="./js/dashboardform.js"></script>
<script type="text/javascript" src="../../js/build/livegrid-all-debug.js"></script>
<script type="text/javascript" src="../../js/Date/calendarOverride.js"></script>
<script type="text/javascript" src="../../js/config.js"></script>
<script type="text/javascript" src="../../js/InfoMainGrid.js"></script>
<script type="text/javascript" src="../../js/validationForm.js"></script>
<script type="text/javascript" src="../../js/Excel/Exporter-all.js"></script>
<script type="text/javascript" src="../../js/Ext.ux.util.js"></script>
<script type="text/javascript" src="../../js/ComboCheckBox/js/Ext.ux.form.ThemeCombo.js"></script>
<script type="text/javascript" src="../../js/ComboCheckBox/js/Ext.ui.ComboCheckBox.js"></script>
<script type="text/javascript" src="../../js/Ext.ux.LinkButton.js"></script>
<script type="text/javascript" src="../../js/Ext.ux.FileUpload.js"></script>
<script type="text/javascript" src="../../js/Ext.ux.Poplov.js"></script>
<script type="text/javascript" src="../../js/Ext.ux.IdCardField.js"></script>
<script type="text/javascript" src="./js/dashboardform.js"></script>
<script type="text/javascript" src="../../js/build/livegrid-all-debug.js"></script>-->
    <!-- Maximgb TreeGrid -->
    <link rel="stylesheet" href="./css/maximgb-treegrid.css" />
    <script src="../../js/TreeGrid/TreeGrid.js"></script>
    <link href="../../css/icon_all.css" rel="stylesheet" type="text/css"/>
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
                    /*url(../../../../js/resources/images/icons/silk/building.png)*/
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
            Ext.contenterCenterWindParent = window.parent.Ext.contenterCenter;
            Ext.BLANK_IMAGE_URL = '../../js/ext-3.4.0/resources/images/default/s.gif'; 
            //set storeDefault
/*

1	APSTEPS10	พนักงานผู้ดำเนินการ ลงนามตรวจสอบ
2	APSTEPS20	หัวหน้าสายงานซื้อจ้าง ลงนามตรวจสอบ
3	APSTEPS30	หัวหน้าพัสดุ ลงนามตรวจสอบ
4	APSTEPS40	รองคณะบดี ลงนามตรวจสอบ
5	APSTEPS50	คณะบดีลงนามอนุมัติเอกสาร*/        
            Ext.status_sigature_document = 'APSTEPS10'; //APSTEPS[10-50]
            Ext.title = 'บันทึกขอ <font color="/blue/">(ลงนาม เอกสารภายใน) เอกสารที่ดำเนินการ</font>';
            Ext.keyData = 1;
            Ext.menu_i_alarm = 1;
            Ext.menu_i_day = 1;
            Ext.store_i_edit = true,
            Ext.menu_id = 1;
            Ext.store_enable = 1;
            Ext.PATH_DOCUMENTS = '<?php echo PATH_DOCUMENTS;?>';
            Ext.contenterCenterTab = window.parent.Ext.getCmp('tabs-panel-sign');
 

        </script>
        <!-- System ERP :: --> 
        <script type="text/javascript" src="../uiData/configStoreUi.js?_dc=<?= __VPRODUCT_; ?>"></script>
        <script type="text/javascript" src="../../js/config_function.js?dc=<?= __VPRODUCT_ ?>"></script>
        <script language="javascript" src="../../js/RowExpander.js"></script> 
        <script language="javascript" src="../../js/TreeGrid/TreeGrid.js"></script> 
        <!-- System ERP :: -->
 
    <!-- System ERP :: -->
    <script type="text/javascript" src="../../lib/right/GrantPermission.php?_dc=<?= __VPRODUCT_; ?>&f=<?php echo $_SERVER["PHP_SELF"]; ?>"></script>
     <!--Doument Sing--> 
        <script type="text/javascript" src="./spAddTemplate/stores.js?_dc=<?= __VPRODUCT_; ?>"></script>        
        <script type="text/javascript" src="./spAddTemplate/FormGrid.js?_dc=<?= __VPRODUCT_; ?>"></script> 
        <script type="text/javascript" src="./spAddTemplate/FormAdd.js?_dc=<?= __VPRODUCT_; ?>"></script>
        <script type="text/javascript" src="./spAddTemplate/FormAddDtl.js?_dc=<?= __VPRODUCT_; ?>"></script>
        <script type="text/javascript" src="./spAddTemplate/FormGridDtl.js?_dc=<?= __VPRODUCT_; ?>"></script>
<!--        <script type="text/javascript" src="./js/view-docs.js?_dc=<?= __VPRODUCT_; ?>"></script>-->
        
    </head>
    <body>
    </body>

</html>