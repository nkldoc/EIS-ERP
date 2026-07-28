/* global Ext */
Ext.onReady(function () {
    Ext.QuickTips.init();
    Ext.idRep = "frm-RepProtest";
    //Spring Boot cross context
    Ext.urlReport = true ? "../../reports/RepProtest" : "../../reports/printr.php?get=true"; //DEBUG
    // Ext.urlReport = false ? "../../reports/RepProtest" : "../../reports/printr.php?get=true"; //DEBUG
    // Spring Boot 
    Ext.titleReport = "รายงานรายการทักท้วง";

    // storeYear
    var years = [];
    var currentTime = new Date();
    var now = currentTime.getFullYear() + 1;
    var yy_en = Ext.START_YEAR_ACC;
    years.push({id: "0", c_name: "- เลือกทั้งหมด -"});
    while (yy_en <= now) {
        years.push({id: yy_en, c_name: yy_en + 543});
        yy_en++;
    }
    Ext.store_year_all = new Ext.data.JsonStore({
        fields: ["id", "c_name"],
        data: years,
    });   

    //AutoLoad

    
    Ext.sp_user = new Ext.data.JsonStore({
        autoDestroy: false,
        autoLoad: true,
        url: "api/All_RepSpTorPAuser.php",
        baseParams: {type: "sp_emp", all: "all"},
        root: "data",
        idProperty: "id",    
        fields: ["id", "c_name"],
        listeners: {
            load: function (t, records, options) {
                    Ext.getCmp("sp_emp_idID").setValue("0");
                // if (Ext.session.i_level == 1 || Ext.session.sp_emp_id == 32  || Ext.session.sp_emp_id == 40 ) {
                //     Ext.getCmp("sp_emp_idID").setValue("0");
                // } else if (Ext.session.i_level == 3) {
                //     Ext.getCmp("sp_emp_idID").setValue(Ext.session.sp_emp_id);
                // } else if (Ext.session.i_level == 2) {
                //     Ext.getCmp("sp_emp_idID").setValue("0");
                // } else if (Ext.session.i_level == 3 && Ext.session.sp_emp_id == 40  ){
                //     Ext.getCmp("sp_emp_idID").setValue("0");
                // }
            },
        },
    });
    function getTitleReport(v) {
        Ext.getCmp("getReportTypeID").setValue(v);
        // Ext.getCmp("dis_i_yyyyID").setValue(parseInt(Ext.getCmp("i_yyyyID").getValue()) + y543 > 0 ? parseInt(Ext.getCmp("i_yyyyID").getValue()) + y543 : "- เลือกทั้งหมด -");
        Ext.getCmp("dis_sp_emp_idID").setValue(getStoreItems(Ext.sp_user, Ext.getCmp("sp_emp_idID").getValue(), "c_name"));
        Ext.getCmp("s_withdraw_date_sID").setValue(Ext.getCmp("s_withdraw_dateID").getValue().format('Y-m-d'));
        Ext.getCmp("e_withdraw_date_eID").setValue(Ext.getCmp("e_withdraw_dateID").getValue().format('Y-m-d'));
    }   

    function frmWithOutAjax(value) {
        //set display title report
        getTitleReport(value);
        //set submit post report with ajax
        var frm = Ext.getCmp(Ext.idRep).getForm().el.dom;
        frm.setAttribute("target", Ext.idRep);
        frm.setAttribute("action", Ext.urlReport);
        frm.submit();
        frm.focus();
    }

    function setButtonReport() {
        var pdfReport = {
            text: Ext.GLOBAL_BU_REPORT_TH,
            scale: "small",
            iconCls: "icon-pdf",
            handler: function () {
                frmWithOutAjax("pdf");
            },
        };
        var excelReport = {
            text: Ext.GLOBAL_BU_EXCEL_TH,
            scale: "small",
            id: "rep-excel",
            iconCls: "icon-excel",
            handler: function () {
                frmWithOutAjax("excel");
            },
        };
        var exp2pdf = {
            text: "Export Pdf",
            scale: "small",
            id: "rep-exp2pdf",
            iconCls: "icon-export",
            handler: function () {
                frmWithOutAjax("exp2pdf");
            },
        };
        var exp2xlsx = {
            text: "Export Xlsx",
            scale: "small",
            id: "rep-exp2xlsx",
            iconCls: "icon-export",
            handler: function () {
                frmWithOutAjax("exp2xlsx");
            },
        };
        return [pdfReport, excelReport/**/, exp2pdf, exp2xlsx];
    }

    var panelForm = new Ext.Panel({
        region: "center",
        title: Ext.titleReport,
        border: false,
        stripeRows: true,
        loadMask: true,
        items: [
            {
                xtype: "form",
                id: Ext.idRep,
                frame: true,
                labelAlign: "right",
                labelWidth: 200,
                bodyStyle: {padding: "10px 20px"},
                defaults: {anchor: "100%", msgTarget: "side", allowBlank: false},
                items: [
                    {
                        xtype: "container",
                        layout: "hbox",
                        align: "stretch",
                        RemoveHeight: true,
                        defaults: {xtype: "fieldset", flex: 1, margins: "0px 3px", autoHeight: true},
                        items: [
                            {
                                title: "รายงานรายการทักท้วง",
                                RemoveCls: "x-box-item",
                                defaults: {labelStyle: "width:200px;", allowBlank: true},
                                id: 'frm-item',
                                items: [
                                    {xtype: "hidden", id: "titleReportID", name: "titleReport", value: Ext.titleReport},
                                    {xtype: "hidden", id: "rptID", name: "rpt", value: 5},
                                    {xtype: "hidden", id: "getReportTypeID", name: "getReportType", value: "pdf"},
                                    {xtype: "hidden", name: "jasperName", value: "RepProtest"},
                                    {xtype: "hidden", id: "dis_sp_emp_idID", name: "dis_sp_emp_id", value: "ทั้งหมด"},
                                    {xtype: "hidden", id: "dc_department_idID", name: "dc_department_id", value: Ext.session.dc_department_id},
                                    {xtype: "hidden", id: "i_level_idID", name: "i_level", value: Ext.session.i_level},
                                    {xtype: "hidden", id: "s_withdraw_date_sID", name: "s_withdraw_date_s"},
                                    {xtype: "hidden", id: "e_withdraw_date_eID", name: "d_withdraw_date_e"},
                                    

                                    new Ext.form.ComboBox({
                                        id: "sp_emp_idID",
                                        hiddenName: "sp_emp_id",
                                        fieldLabel: "ชื่อพนักงาน",
                                        store: Ext.sp_user,
                                        valueField: "id",
                                        displayField: "c_name",
                                        mode: "local",
                                        triggerAction: "all",
                                        emptyText: "กรุณาเลือก...",
                                        width: 200,
                                        forceSelection: true,
                                        selectOnFocus: true,
                                        typeAhead: false,
                                        // value: ((Ext.session.i_level == 3) ? "0" : Ext.session.sp_emp_id),
                                        value:0,
                                        listeners: {
                                            change: function (combo, newValue) {
                                                if (newValue == "") {
                                                    combo.reset();
                                                }
                                            },
                                            beforequery: function (q) {
                                                if (q.query) {
                                                    var length = q.query.length;
                                                    q.query = new RegExp(Ext.escapeRe(q.query));
                                                    q.query.length = length;
                                                }
                                            },
                                            blur: function () {
                                                this.getStore().clearFilter();
                                            }
                                        }
                                    }), 
                                    {
                                        xtype: "datefield",
                                        fieldLabel: "วันที่สร้างใบเบิก", //
                                        id: "s_withdraw_dateID",
                                        name: "s_withdraw_date",
                                        listeners:{
                                            afterrender:function(){ 
                                                var date = new Date();
                                                date.setDate(1);
                                                this.setValue(date);
                                            } 
                                        }

                                    },
                                    {
                                        xtype: "datefield",
                                        fieldLabel: "ถึงวันที่",
                                        id: "e_withdraw_dateID",
                                        name: "e_withdraw_date",
                                        listeners:{
                                            afterrender:function(){ 
                                                this.setValue(new Date());
                                            } 
                                        }
                                    },
                                    {
                                        xtype: "radiogroup",
                                        fieldLabel: "ประเภทรายงาน",
                                        anchor: "100%",
                                        id: "IRepProtest", 
                                        name: "ITAo", 
                                        msgTarget: "under",
                                        columns: [130,130],
                                        items: [
                                            {
                                                name: "IRepProtest",
                                                inputValue: 1,
                                                checked: true,
                                                boxLabel: "รายการท้วง",
                                            },
                                            {
                                                inputValue: 2,
                                                name: "IRepProtest",
                                                boxLabel: "รายการเบิกและท้วง",
                                            },
                                        ],
                                    },
                                ], listeners: {
                                    afterrender: function () {
                                        this.fn = function () {
                                        };
                                        Ext.getCmp('frm-item').fn();
                                    }
                                }
                            }
                        ]
                    }
                ],
                buttonAlign: "left",
                buttons: setButtonReport()
            }
        ]
    });
    new Ext.Viewport({
        layout: "border",
        items: panelForm,
    });
});
