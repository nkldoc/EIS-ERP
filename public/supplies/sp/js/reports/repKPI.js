/* global Ext */
Ext.onReady(function () {
    Ext.QuickTips.init();
    Ext.idRep = "frm-RepKPI";
    //Spring Boot cross context
    Ext.urlReport = true ? "../../reports/RepKPI" : "../../reports/printr.php?get=true"; //DEBUG
    //
//    Ext.urlReport = false ? "../../reports/RepKPI" : "../../reports/printr.php?get=true"; //DEBUG
    // Spring Boot 
    Ext.titleReport = "รายงานสถิตการทำงานบุคลากร (KPI)";

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
   store_year = new Ext.data.JsonStore({
    fields: ["id", "c_name"],
    data: years,
    listeners: {
        load: function (t, records, options) {
            // Ext.getCmp("i_yyyyID").setValue("0");
        },
    },
    });
    //AutoLoad
    Ext.torType = new Ext.data.JsonStore({
        autoDestroy: false,
        autoLoad: true,
        url: "api/All_spAlert.php",
        baseParams: {type: "sp_type_status", i_is_type_tor: true, all: "all"},
        root: "data",
        idProperty: "id",
        fields: ["id", "c_name"],
        listeners: {
            load: function (t, records, options) {
                Ext.getCmp("tor_type_idID").setValue(0);
            }
        }
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
                if (Ext.session.i_level == 1 || [32,46].includes(Ext.session.sp_emp_id) ) {
                    Ext.getCmp("sp_emp_idID").setValue("0");
                } else if (Ext.session.i_level == 3) {
                    Ext.getCmp("sp_emp_idID").setValue(Ext.session.sp_emp_id);
                } else if (Ext.session.i_level == 2) {
                    Ext.getCmp("sp_emp_idID").setValue("0");
                }
            },
        },
    });
    function getTitleReport(v) {

        Ext.getCmp("getReportTypeID").setValue(v);
        // Ext.getCmp("dis_i_yyyyID").setValue(parseInt(Ext.getCmp("i_yyyyID").getValue()) + y543 > 0 ? parseInt(Ext.getCmp("i_yyyyID").getValue()) + y543 : "- เลือกทั้งหมด -");
        Ext.getCmp("dis_sp_emp_idID").setValue(getStoreItems(Ext.sp_user, Ext.getCmp("sp_emp_idID").getValue(), "c_name"));
        Ext.getCmp("d_contract_sID").setValue(Ext.getCmp("s_contract_dateID").getValue().format('Y-m-d'));
        Ext.getCmp("d_contract_eID").setValue(Ext.getCmp("e_contract_dateID").getValue().format('Y-m-d'));
        Ext.getCmp("d_egp_sID").setValue(Ext.getCmp("s_egp_dateID").getValue().format('Y-m-d'));
        Ext.getCmp("d_egp_eID").setValue(Ext.getCmp("e_egp_dateID").getValue().format('Y-m-d'));
        var y543 = Ext.getCmp("i_yyyyID").getValue() > 0 ? 543 : 0;
        Ext.getCmp("dis_i_yyyyID").setValue(parseInt(Ext.getCmp("i_yyyyID").getValue()) + y543 > 0 ? parseInt(Ext.getCmp("i_yyyyID").getValue()) + y543 : "- เลือกทั้งหมด -");
        Ext.getCmp("dis_tor_type_idID").setValue(getStoreItems(Ext.torType, Ext.getCmp("tor_type_idID").getValue(), "id"));
    }

    function frmWithOutAjax(value) {
        //set display title report
        getTitleReport(value);

        var str = ((Ext.getCmp('i_type_contract[1]').getValue()) ? "1," : "") + (Ext.getCmp('i_type_contract[2]').getValue() ? "2," : "") + (Ext.getCmp('i_type_contract[3]').getValue() ? "3," : "");
        Ext.getCmp('c_type_contractID').setValue(str.replace(/,\s*$/, ""));
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
    Ext.c_type_contrac = null;
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
                                title: "รายงานสถิตการทำงานบุคลากร (KPI)",
                                RemoveCls: "x-box-item",
                                defaults: {labelStyle: "width:200px;", allowBlank: true},
                                id: 'frm-item',
                                items: [
                                    {xtype: "hidden", id: "titleReportID", name: "titleReport", value: Ext.titleReport},
                                    {xtype: "hidden", id: "rptID", name: "rpt", value: 5},
                                    {xtype: "hidden", id: "getReportTypeID", name: "getReportType", value: "pdf"},
                                    {xtype: "hidden", name: "jasperName", value: "RepKPI"},
                                    {xtype: "hidden", id: "dis_sp_emp_idID", name: "dis_sp_emp_id", value: "ทั้งหมด"},
                                    {xtype: "hidden", id: "dc_department_idID", name: "dc_department_id", value: Ext.session.dc_department_id},
                                    {xtype: "hidden", id: "i_level_idID", name: "i_level", value: Ext.session.i_level},
                                    {xtype: "hidden", id: "d_contract_sID", name: "d_contract_s"},
                                    {xtype: "hidden", id: "d_contract_eID", name: "d_contract_e"},
                                    {xtype: "hidden", id: "d_egp_sID", name: "d_egp_s"},
                                    {xtype: "hidden", id: "d_egp_eID", name: "d_egp_e"},
                                    {xtype: "hidden", id: "dis_tor_type_idID", name: "c_type_id", value: "ทั้งหมด"},
                                    {xtype: "hidden", id: "c_tor_type_idID", name: "c_tor_type_id", value: null},
                                    {xtype: "hidden", id: "c_type_contractID", name: "c_type_contract", value: "1,2,3"},
                                    {xtype: "hidden", id: "dis_i_yyyyID", name: "dis_i_yyyy", value: "ทั้งหมด"},

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
                                        value: ((Ext.session.i_level == 3) ? "0" : Ext.session.sp_emp_id),
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
                                    new Ext.form.ComboBox({
                                        id: "i_yyyyID",
                                        fieldLabel: "ปีงบประมาณ",
                                        width: 163,
                                        mode: "local",
                                        store: store_year,
                                        hiddenName: "i_yyyy",
                                        valueField: "id",
                                        displayField: "c_name",
                                        mode: "local",
                                        triggerAction: "all",
                                        forceSelection: true,
                                        selectOnFocus: true,
                                        typeAhead: false,
                                        emptyText: "กรุณาเลือก...",
                                        value:  "0" , //new Date().getFullYear(),
                                        listeners: {
                                            select: function (combo) {
                                                // var newValue =  Ext.getCmp('i_yyyyID').getValue() 
                                                // if (newValue == "") {
                                                // combo.reset();
                                                // } else {
                                                // Ext.getCmp('d_date_startID').setValue( "01-10-" + (newValue-1));
                                                // Ext.getCmp('d_date_endID').setValue( "30-09-" + (newValue));
                                                // Ext.getCmp('dis_d_date_startID').setValue( "30-09-" + (newValue));
                                                // Ext.getCmp('dis_d_date_endID').setValue( "30-09-" + (newValue));
                                                // if (newValue.id == Ext.bgYear) {
                                                //     Ext.getCmp("d_date_startID").setValue(addY(543));
                                                //     Ext.getCmp("d_date_endID").setValue(addY(543));
                                                //     } else {
                                                //         Ext.getCmp("d_date_startID").setValue("30-09" + newValue.id);
                                                //         Ext.getCmp("d_date_endID").setValue("30-09" + newValue.id);
                                                //     }
                                                // }
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
                                        }),
                                    {
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
                                        xtype: "datefield",
                                        fieldLabel: "วันที่ประกาศแผนe-GP", //
                                        id: "s_egp_dateID",
                                        name: "s_egp_date",
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
                                        id: "e_egp_dateID",
                                        name: "e_egp_date",
                                        listeners: {
                                            afterrender: function () {
                                                this.setValue(new Date());
                                            }
                                        }
                                    }, new Ext.ux.form.LovCombo({
                                        id: "tor_type_idID",
                                        submitValue: true,
                                        hiddenName: "tor_type_id",
                                        name: "c_type_id",
                                        valueField: "id",
                                        displayField: "c_name",
                                        fieldLabel: "วิธีดำเนินงาน",
                                        width: 300,
                                        mode: "local",
                                        store: Ext.torType,
                                        triggerAction: "all",
                                        forceSelection: true,
                                        selectOnFocus: true,
                                        typeAhead: false,
                                        emptyText: "เลือกทั้งหมด..",
                                        listeners: {
                                            Change: function () {
                                                var myStr = this.value;
                                                Ext.replace_id = myStr.replaceAll(";", ",");
                                                Ext.newStr = Ext.replace_id;
                                                Ext.getCmp('c_tor_type_idID').setValue(Ext.newStr);
                                                console.log(Ext.getCmp('c_tor_type_idID').getValue());

                                            }
                                        }
                                    }), {
                                        xtype: "compositefield",
                                        fieldLabel: "ประเภทสัญญา",
                                        anchor: "100%",
                                        msgTarget: "under",
                                        items: [
                                            {
                                                xtype: "checkbox",
                                                id: "i_type_contract[1]",
                                                boxLabel: "สัญญา",
                                                inputValue: 1,
                                                checked: true,
                                                listeners: {
                                                    check: function (checkbox, isChecked) {
                                                        console.log(checkbox.inputValue);
                                                        console.log(isChecked);
                                                    }
                                                }
                                            },
                                            {xtype: "displayfield", value: "|"},
                                            {
                                                xtype: "checkbox",
                                                id: "i_type_contract[2]",
                                                boxLabel: "ใบสั่ง",
                                                inputValue: 2,
                                                checked: true, listeners: {
                                                    checked: function () {
                                                        console.log(this.getValue());
                                                    }
                                                }
                                            },
                                            {xtype: "displayfield", value: "|"},
                                            {
                                                xtype: "checkbox",
                                                id: "i_type_contract[3]",
                                                boxLabel: "จะซื้อจะขาย",
                                                inputValue: 3,
                                                checked: true, listeners: {
                                                    checked: function () {
                                                        console.log(this.getValue());
                                                    }
                                                }
                                            }
                                        ]
                                    }
                                    , {
                                        xtype: "radiogroup",
                                        columns: [230,230, 130],
                                        fieldLabel: "รายงาน",
                                        id: "i_type_repID",
                                        name: "i_type_rep",
                                        items: [
                                            {
                                                checked: true,
                                                inputValue: 1,
                                                name: "i_type_rep",
                                                boxLabel: "รายงานแบบสรุปรวม KPI (วันทำการ)"
                                            },
                                            {
                                                checked: true,
                                                inputValue: 2,
                                                name: "i_type_rep",
                                                boxLabel: "รายงานแบบสรุปรวม KPI(นับปฏิทิน)"
                                            },
                                            {
                                                inputValue: 0,
                                                name: "i_type_rep",
                                                boxLabel: "รายงาน KPI",
                                            },
                                            {
                                                inputValue: 4,
                                                name: "i_type_rep",
                                                boxLabel: "TEST",
                                            }
                                        ], //radiogroup
                                    }
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
