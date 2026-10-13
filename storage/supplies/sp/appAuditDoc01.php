<?php
include("../conf/config.php");
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
            }
/* ===== Timeline row ===== */
.tl-row {
    display: flex;
    padding: 10px 0;
    border-left: 3px solid #ddd;
    margin-left: 20px;
    position: relative;

    transition: 
        background-color 0.25s ease,
        transform 0.25s ease,
        box-shadow 0.25s ease;
}

/* hover effect */
.tl-row:hover {
    background-color: #f9fafb;
    transform: translateX(6px);   /* 👈 ขยับขวา */
    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
    border-left-color: #4caf50;
}

/* แถวปัจจุบัน */
.tl-row.tl-current {
    border-left-color: #2e7d32;
    background: #f1f8e9;
}

/* ===== Icon ===== */
.tl-icon {
    width: 30px;
    text-align: center;
    font-size: 18px;
    position: absolute;
    left: -18px;
    top: 10px;
    background: #fff;

    transition: transform 0.25s ease;
}

.tl-row:hover .tl-icon {
    transform: scale(1.15);   /* 👈 icon ขยาย */
}

/* ===== Content ===== */
.tl-content {
    padding-left: 25px;
    width: 100%;
}

.tl-title {
    font-weight: bold;
    font-size: 14px;
}

.tl-meta {
    font-size: 12px;
    color: #666;
    margin-top: 2px;
}

.tl-user {
    font-weight: bold;
}

/* ===== Status ===== */
.tl-status {
    margin-top: 4px;
    font-size: 12px;
}

.st-pending { color: #999; }
.st-done    { color: #2e7d32; }
.st-warning { color: #f57c00; }
.st-return  { color: #c62828; }

/* ===== Comment ===== */
.tl-comment {
    margin-top: 4px;
    color: #333;
}
/* ===== Timeline Button ===== */
.btn-timeline {
    background: linear-gradient(135deg, #4caf50, #2e7d32);
    border: none;
    color: #fff;
    padding: 6px 14px;
    font-size: 12px;
    font-weight: bold;
    border-radius: 18px;
    cursor: pointer;

    box-shadow: 0 2px 6px rgba(0,0,0,0.18);
    transition: 
        transform 0.2s ease,
        box-shadow 0.2s ease,
        background 0.2s ease;
}

/* hover */
.btn-timeline:hover {
    background: linear-gradient(135deg, #66bb6a, #388e3c);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.25);
}

/* click */
.btn-timeline:active {
    transform: translateY(0);
    box-shadow: 0 2px 6px rgba(0,0,0,0.18);
}

/* focus (keyboard) */
.btn-timeline:focus {
    outline: none;
}


        </style>
        <title><?php echo COMPANY_NAME; ?></title>  
        <!-- System ERP :: -->
        <script type="text/javascript" src="../lib/right/GrantPermission.php?_dc=<?= __VPRODUCT_; ?>&f=<?php echo $_SERVER["PHP_SELF"]; ?>"></script> 
        <script language="javascript" src="../js/RowExpander.js"></script> 

<!--        <script type="text/javascript" src="app/spAddDoc/FormAddDtl.js"></script>
        <script type="text/javascript" src="app/spAddDoc/FormGridDtl.js?_dc=<?= __VPRODUCT_; ?>"></script>
        <script type="text/javascript" src="app/js/view-docs.js?_dc=<?= __VPRODUCT_; ?>"></script>-->
        <script type="text/javascript">
     
//    Ext.QuickTips.init();
           
            Ext.C_CODE_SYS = "SP";
            Ext.I_STATUS_BEFORE = 0;
            Ext.I_STATUS = 0; 
            Ext.I_SUB_STATUS_BEFORE = '0.20';
            Ext.I_SUB_STATUS = '0.30'; //บันทึกใบขอเบิก
            Ext.SS_I_TYPE_USER = <?php echo $_SESSION["i_type_user"]; ?>;
            Ext.SS_DC_COST_ID = <?php echo $_SESSION["dc_cost_id"]; ?>;
            Ext.DateNow = "<?php echo date('Y-m-d') ?>";
            Ext.INSIDE_COST = true; 
            //set storeDefault
/*

1	APSTEPS10	พนักงานผู้ดำเนินการ ลงนามตรวจสอบ
2	APSTEPS20	หัวหน้าสายงานซื้อจ้าง ลงนามตรวจสอบ
3	APSTEPS30	หัวหน้าพัสดุ ลงนามตรวจสอบ
4	APSTEPS40	รองคณะบดี ลงนามตรวจสอบ
5	APSTEPS50	คณะบดีลงนามอนุมัติเอกสาร*/        
            Ext.status_sigature_document = 'APSTEPSAUDIT01'; //APSTEPS[10-50]
            //
            Ext.keyData = 1;
            Ext.menu_i_alarm = 1;
            Ext.menu_i_day = 1;
            Ext.store_i_edit = true,
            Ext.menu_id = 1;
            Ext.store_enable = 1;
 

        </script>
        <!-- System ERP :: --> 
        <script type="text/javascript" src="app/spAudit/stores.js?_dc=<?= __VPRODUCT_; ?>"></script>        
        <script type="text/javascript" src="app/spAudit/FormGrid.js?_dc=<?= __VPRODUCT_; ?>"></script> 
        <script type="text/javascript" src="app/spAudit/FormAdd.js?_dc=<?= __VPRODUCT_; ?>"></script> 
    </head>

    <body>
    </body>

</html>