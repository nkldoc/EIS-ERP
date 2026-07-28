/* global Ext */
Ext.onReady(function () {
    Ext.QuickTips.init();
    Ext.idRep = "frm-repTor";
    //Spring Boot cross context
    Ext.urlReport = true ? "../../reports/repSpTorPAuser" : "../../reports/printr.php?get=true"; //DEBUG
// Ext.urlReport = false ? "../../reports/repSpTorPAuser" : "../../reports/printr.php?get=true"; //DEBUG
    // Spring Boot 
    Ext.titleReport = "รายงานสถิตการทำงานบุคลากร (PA)";

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
                if (Ext.session.i_level == 1 || Ext.session.sp_emp_id == 32  ) {
                    Ext.getCmp("sp_emp_idID").setValue("0");
                } else if (Ext.session.i_level == 3 ) {
                    Ext.getCmp("sp_emp_idID").setValue(Ext.session.sp_emp_id);
                } else if (Ext.session.i_level == 2) {
                    Ext.getCmp("sp_emp_idID").setValue("0");
                }
            },
        },
    });
    function getTitleReport(v) {

        Ext.getCmp("getReportTypeID").setValue(v);
        Ext.getCmp("d_contract_sID").setValue(Ext.getCmp("s_contract_dateID").getValue().format('Y-m-d'));
        Ext.getCmp("d_contract_eID").setValue(Ext.getCmp("e_contract_dateID").getValue().format('Y-m-d'));
        Ext.getCmp("dis_sp_emp_idID").setValue(getStoreItems(Ext.sp_user, Ext.getCmp("sp_emp_idID").getValue(), "c_name"));
    }

    function frmWithOutAjax(value) {
        //set display title report
        getTitleReport(value);
        //set submit post report with ajax
        var frm = Ext.getCmp(Ext.idRep).getForm().el.dom;
        frm.setAttribute("target", "_blank");
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
        id: 'pFrmID',
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
                                title: "รายงานสถิตการทำงานบุคลากร (PA)",
                                RemoveCls: "x-box-item",
                                defaults: {labelStyle: "width:200px;", allowBlank: true},
                                id:'panelIDx',
                                items: [
                                    {xtype: "hidden", id: "titleReportID", name: "titleReport", value: Ext.titleReport},
                                    {xtype: "hidden", id: "rptID", name: "rpt", value: 5},
                                    {xtype: "hidden", id: "getReportTypeID", name: "getReportType", value: "pdf"},
                                    {xtype: "hidden", name: "jasperName", value: "RepSpTorPAuser"},

                                    // { xtype: "hidden", id: "dis_i_yyyyID", name: "dis_i_yyyy", value: "ทั้งหมด" },
                                    {xtype: "hidden", id: "dis_sp_emp_idID", name: "dis_sp_emp_id", value: "ทั้งหมด"},
                                    {xtype: "hidden", id: "dc_department_idID", name: "dc_department_id", value: Ext.session.dc_department_id},
                                    {xtype: "hidden", id: "i_level_idID", name: "i_level", value: Ext.session.i_level},
                                    {xtype: "hidden", id: "d_contract_sID", name: "d_contract_s"},
                                    {xtype: "hidden", id: "d_contract_eID", name: "d_contract_e"},
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
                                        value: ((Ext.session.i_level == 3  ) ? "0" : Ext.session.sp_emp_id),
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
                                            },
                                        },
                                    }), {
                                        xtype: "datefield",
                                        fieldLabel: "วันที่ในสัญญา", //
                                        id: "s_contract_dateID",
                                        name: "s_contract_date",
                                        listeners: {
                                            afterrender: function () {
                                                var date = new Date();
                                                date.setDate(1);
                                                this.setValue(date);
                                            }
                                        }
                                    },
                                    {
                                        xtype: "datefield",
                                        fieldLabel: "ถึงวันที่",
                                        id: "e_contract_dateID",
                                        name: "e_contract_date",
                                        listeners: {
                                            afterrender: function () {
                                                this.setValue(new Date());
                                            }
                                        }
                                    },
                                    {
                                        xtype: "radiogroup",
                                        columns: [360],
                                        fieldLabel: "สถานะรายการ",
                                        id: "i_statusID",
                                        name: "i_status",
                                        items: [
                                            {
                                                name: "i_status",
                                                checked: true,
                                                inputValue: 11,
                                                boxLabel: "นับ PA หัวหน้ามอบหมายงานและจัดสรรเงิน",
                                            },
                                            {
                                                inputValue: 3,
                                                name: "i_status",
                                                //disabled: ((Ext.session.i_level!=1)? true:false),
                                                boxLabel: "รับของ/เบิก PA",
                                            },
                                        ], //radiogroup
                                        listeners: {
                                            change: function () {
                                                if (this.getValue().inputValue === 3) {
                                                    
                                                    Ext.getCmp('panelIDx').remove(Ext.getCmp('s_contract_dateID'));
                                                    Ext.getCmp('panelIDx').insert(10, new Ext.form.DateField({
                                                        xtype: "datefield",
                                                        fieldLabel: "วันที่รับของ", //
                                                        id: "s_contract_dateID",
                                                        name: "s_contract_date",
                                                        listeners: {
                                                            afterrender: function () {
                                                                var date = new Date();
                                                                date.setDate(1);
                                                                this.setValue(date);
                                                            }
                                                        }
                                                    }));
                                                    Ext.getCmp('panelIDx').doLayout();
                                                } else {
                                                    Ext.getCmp('panelIDx').remove(Ext.getCmp('s_contract_dateID'));
                                                    Ext.getCmp('panelIDx').insert(10, new Ext.form.DateField({
                                                        xtype: "datefield",
                                                        fieldLabel: "วันที่ในสัญญา", //
                                                        id: "s_contract_dateID",
                                                        name: "s_contract_date",
                                                        listeners: {
                                                            afterrender: function () {
                                                                var date = new Date();
                                                                date.setDate(1);
                                                                this.setValue(date);
                                                            }
                                                        }
                                                    }));
                                                    Ext.getCmp('panelIDx').doLayout();
                                                }
                                                
                                            }
                                        },
                                    },
                                ],
                            },
                        ],
                    },
                ],
                buttonAlign: "left",
                buttons: setButtonReport(),
            },
        ],
    });
    new Ext.Viewport({
        layout: "border",
        items: panelForm,
    });
});
