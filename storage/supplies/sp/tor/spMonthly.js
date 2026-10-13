/* global Ext, user_right_add, user_right_edit, user_right_delete */
Ext.runStatus = function (row, rec) {
//    console.log(rec);
//    return false;
    Ext.row = rec;

    Ext.HDR_ID = parseInt(Ext.SelectStore.get('sp_tor_id'));
    Ext.sp_tor_contract_id = parseInt(Ext.SelectStore.get('sp_contract_po_id'));
    Ext.i_period = rec.get('i_period');
    Ext.sp_tor_hdr_period_id = rec.get('sp_tor_hdr_period_id');


    //
    checkID = function (RowCheck) {
        
        return false;
        var num = Ext.getCmp("gridEditor_sp_gl_monthly").store.data.items.length - 1;
        var row = 0;
        while (num >= row) {
            if (RowCheck != row) {
              // document.getElementById("dtl[" + row+"]").checked = false; //false
            }
            row++;
        }
    };
    text_dc_expense_budget = function () {
        console.log(Ext.row);

        Ext.getCmp('f_total_all_month').setValue(Ext.row.get('f_total_amt'));
        var dc_budget_NUM = Ext.dc_expense_budget_in_tor.data.length;
        var sum_f_total_dc_expense_budget_in_tor = 0;
        var text_dc_expense_budget = "<table width='100%' border='0' cellspacing='0' cellpadding='0'><thead valign='top'></thead>";
        var style = "";
        Ext.sum_minus = 0;

        for (table_loop = 1; dc_budget_NUM >= table_loop; table_loop++) {
            var f_sum_monthly_hdr = 0;
            var dc_expense_budget_in_tor_id = Ext.dc_expense_budget_in_tor.data.items[table_loop - 1].data.id;
            var sum_expense_budget = 0;
            for (i_sum_loop = 1; Ext.sp_gl_monthly_dtl.data.length >= i_sum_loop; i_sum_loop++) {
                if (Ext.sp_gl_monthly_dtl.data.items[i_sum_loop - 1].data.dc_expense_budget_type_id == dc_expense_budget_in_tor_id) {
                    var f_month_total = Ext.sp_gl_monthly_dtl.data.items[i_sum_loop - 1].data.f_month_total.replace(/,/g, "");
                    sum_expense_budget = sum_expense_budget + parseFloat(f_month_total);
                }
                f_sum_monthly_hdr = f_sum_monthly_hdr + parseFloat(Ext.sp_gl_monthly_dtl.data.items[i_sum_loop - 1].data.f_month_total.replace(/,/g, ""));
            }
            var c_name_dc_expense_budget_in_tor = Ext.dc_expense_budget_in_tor.data.items[table_loop - 1].data.c_name;
            var f_total_dc_expense_budget_in_tor = Ext.dc_expense_budget_in_tor.data.items[table_loop - 1].data.f_total - sum_expense_budget;
            // var style = f_total_dc_expense_budget_in_tor < 0 ? "color:red;" : "color:green;";
            if (f_total_dc_expense_budget_in_tor < 0) {
                style = "color:red;";
                Ext.sum_minus = 1;
            } else {
                style = "color:green;";
            }
            // Ext.sum_minus = f_total_dc_expense_budget_in_tor < 0 ? "color:red;" : "color:green;";
            text_dc_expense_budget += "<tr><td style='' align='right'>" + table_loop + ".&nbsp;</td>";
            text_dc_expense_budget += "<td style='' align='left'>" + c_name_dc_expense_budget_in_tor + "</td>";
            text_dc_expense_budget += "<td style='" + style + "' align='right'>" + Ext.util.Format.number(parseFloat(f_total_dc_expense_budget_in_tor), "0,000.00") + "</td></tr>";
            sum_f_total_dc_expense_budget_in_tor = sum_f_total_dc_expense_budget_in_tor + f_total_dc_expense_budget_in_tor;
        }
        var style = sum_f_total_dc_expense_budget_in_tor < 0 ? "color:red;" : "color:green;";
        text_dc_expense_budget += "<td style='' align='left'></td>";
        text_dc_expense_budget += "<td style='' align='left'><b><u>เงินรวม :</u></b></td>";
        text_dc_expense_budget += "<td style='" + style + "' align='right'><b><u>" + Ext.util.Format.number(parseFloat(sum_f_total_dc_expense_budget_in_tor), "0,000.00") + "</u></b></td></tr>";
        text_dc_expense_budget += "</thead></table>";
        Ext.getCmp("f_sum_monthly_hdr").setValue(Ext.util.Format.number(parseFloat(f_sum_monthly_hdr), "0,000.00"));
        if (parseFloat(f_sum_monthly_hdr) == Ext.row.get('f_total_amt').replace(/,/g, "")) {
            Ext.get("f_sum_monthly_hdr").setStyle("color", "green");
            Ext.not_equal = 0;
        } else {
            Ext.get("f_sum_monthly_hdr").setStyle("color", "red");
            Ext.not_equal = 1;
        }
        return text_dc_expense_budget;
        // Ext.getCmp("text_dc_expense_budget").update(text_dc_expense_budget);
    };
    var columnMini2 = [
        {header: "ID System", sortable: true, hidden: true, dataIndex: "id"},
        {header: "รหัสหมวดสินทรัพย์", sortable: true, dataIndex: "c_code"},
        {
            header: "ชื่อ",
            sortable: true,
            id: "c_name",
            dataIndex: "c_name",
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                metaData.attr = "style='cursor:pointer';";
                return value;
            },
        },
    ];
    Ext.dc_expense_budget_type = new Ext.data.JsonStore({
        autoDestroy: false,
        autoLoad: true,
        url: "api/All_PoWorkingImpHdr.php",
        baseParams: {
            type: "dc_expense_budget_type",
        },
        root: "data",
        idProperty: "id",
        fields: ["id", "c_name"],
    });
    Ext.dc_expense_budget_in_tor = new Ext.data.JsonStore({
        storeId: "myStore1",
        // autoLoad: true,
        url: "tor/api/mnGlController.php",
        root: "data",
        baseParams: {mode: "DC_EXPENSE_BUDGET_IN_TOR", sp_tor_id: Ext.HDR_ID, sp_tor_contract_id: Ext.sp_tor_contract_id}, //Permission i_read
        idProperty: "id",
        totalProperty: "totalCount",
        fields: ["id", "c_name", "f_total"],
    });
    Ext.sp_gl_monthly_hdr = new Ext.data.JsonStore({
        storeId: "myStore1",
        // autoLoad: true,
        url: "tor/api/mnGlController.php",
        root: "data",
        baseParams: {mode: "SP_GL_MONTHLY_HDR", sp_tor_id: Ext.HDR_ID, sp_tor_contract_id: Ext.sp_tor_contract_id}, //Permission i_read
        idProperty: "id",
        totalProperty: "totalCount",
        fields: ["sp_gl_monthly_hdr_id", "i_month_total", "f_total", "d_doc_date", "dc_acc_id", "c_dc_acc", "dc_cost_id", "c_comment"],
    });
    Ext.sp_gl_monthly_dtl = new Ext.data.JsonStore({
        // autoLoad: true,
        url: "tor/api/mnGlController.php",
        root: "data",
        baseParams: {mode: "LIST_SP_GL_MONTHLY_DTL", sp_gl_monthly_hdr_id: 0}, //Permission i_read
        idProperty: "id",
        totalProperty: "totalCount",
        fields: ["sp_gl_monthly_dtl_id", "sp_tor_hdr_period_id"
            , "i_month"
            , "i_period"
            , "dc_expense_budget_type_id"
            , "dc_acc_id"
            , "f_month_total"
            , "d_doc_date", "c_comment"],
    });
    Ext.dc_expense_budget_in_tor.reload({
        callback: function (recordx, operation, success) {
            if (success) {
                Ext.sp_gl_monthly_hdr.reload({
                    callback: function (recordx, operation, success) {
                        if (success) {
                            if (Ext.sp_gl_monthly_hdr.data.length > 0) {
                                Ext.sp_gl_monthly_dtl.reload({
                                    params: { mode: "LIST_SP_GL_MONTHLY_DTL", sp_gl_monthly_hdr_id: Ext.sp_gl_monthly_hdr.data.items[0].data.sp_gl_monthly_hdr_id},
                                    callback: function (recordx, operation, success) {
                                        if (success) {
                                           
                                            //    console.log(recordx);
                                           
                                        }
                                    } 
                                });
                            } else {
                                Ext.getCmp("sp_gl_monthly_hdr_id").setValue(0);
                            }
                        }
                    },
                });
            }
        },
    });
    Ext.storeAccExpense = new Ext.data.JsonStore({
        storeId: "myStore1",
        autoLoad: true,
        url: "../sp/api/All_DcExpense.php",
        root: "data",
        baseParams: {type: "storeAccExpense"}, //Permission i_read
        idProperty: "id",
        totalProperty: "totalCount",
        fields: ["id", "c_code", "c_name"],
    });
    Ext.NMU_dc_acc = new Ext.data.JsonStore({
        storeId: "myStore1",
        autoLoad: true,
        url: "../sp/api/All_DcExpense.php",
        root: "data",
        baseParams: {type: "NMU_dc_acc"}, //Permission i_read
        idProperty: "id",
        totalProperty: "totalCount",
        fields: ["id", "c_name"],
    });
    Ext.PopAccForm = new Ext.ux.Poplov({
        text: "กรุณาเลือกรายการบัญชี...",
        id: "dc_acc_idID", //go to relation
        iconCls: "page_magnify",
        valueHidden: "dc_acc_id", //go to hidden
        store: Ext.storeAccExpense,
        headerGrid: columnMini2,
        widthText: 400,
        fieldLabel: "กรุณาเลือกรายการบัญชี...",
    });
    let storeDtlRecord = Ext.data.Record.create([
        {name: "i_month"},
        {name: "dc_expense_budget_type_id"},
        {name: "dc_acc_id"},
        {name: "bg_budget_dtl_overlap_id"},
        {name: "f_total"},
        {name: "d_doc_date"},
        {name: "c_code_ref"},
        {name: "c_comment"},
    ]);
    new Ext.Window({
        title: "ตั้งหนี้ค่าใช่จ่าย",
        id: "win-sp_gl_monthly",
        width: 1000,
        height: 600,
        modal: true,
        plain: true,
        layout: "fit",
        maximizable: true,
        collapsible: true,
        closable: true,
        frame: true,
        layout: {
            type: 'vbox',
            align: 'stretch'
        },
        defaults: {
            xtype: 'panel',
            flex: 1
        },

        /**/
        items: [
            {
                xtype: "form",
                id: "form-monthlyID",
                url: "tor/api/mnGlController.php",
                frame: true,
                labelWidth: 100,
                height: 150,
                bodyStyle: {padding: "10px 20px", },
                defaults: {
                    anchor: "100%",
                    msgTarget: "side",
                }, 
                items: [
                    {
                        xtype: "hidden",
                        name:'sp_gl_monthly_hdr_id',
                        value: rec.get("sp_gl_monthly_hdr_id") 
                    }, {
                        xtype: "hidden",
                        name: "mode",
                        value:'UP_SP_GL_MONTHLY'
                    }, {
                        xtype: "displayfield",
                        fieldLabel: "รหัส",
                        value: rec.get('sp_tor_hdr_period_id'),
                    }, {
                        xtype: "displayfield",
                        fieldLabel: "งวด",
                        value: rec.get('i_period'),
                    }, {
                        xtype: "displayfield",
                        fieldLabel: "จำนวนเงิน",
                        value: rec.get('f_net_total_price'), 
                    },
                ],
            },

            new Ext.grid.EditorGridPanel({
                id: "gridEditor_sp_gl_monthly",
                region: "center",
                width: "100%",
                height: 500,
                layout: "fit",
                border: true,
                stripeRows: true,
                loadMask: true,
                clicksToEdit: 1,
                store: Ext.sp_gl_monthly_dtl, 
                listeners: {
                    afteredit: function () {
                        Ext.getCmp("text_dc_expense_budget").update(text_dc_expense_budget());
                    },
                    beforerender: function () {
                        this.thisCick = function (grid, rowIndex, columnIndex, e) {
                            if (columnIndex === grid.getColumnModel().getIndexById("delete_dtl_monthly")) {
                                Ext.sp_gl_monthly_dtl.removeAt(rowIndex);
                            }
                        };
                    },
                    afterrender: function () {
                        Ext.getCmp("gridEditor_sp_gl_monthly").on("cellclick", this.thisCick, this);
                    },
                }, 
                columns: [
                    {

                        header: "-",
                        sortable: false,
                        align: "center",
                        dataIndex: "sp_tor_hdr_period_id",
                        id: "sp_tor_hdr_period_idID",
                        width: 40,
                        renderer: function (value, metaData, record, row, col, store, gridView) {
//                            var checked = value ? "checked" : "";
                            var readonly = record.data.i_period > 0 ? "disabled" : ""; // disabled sp_tor_hdr_period_id
                            var checked = record.data.i_period > 0 ? "checked" : "";  
                            
                            return "<input style='margin-top:3px; margin-bottom:2px;' "+checked+" name='dtlMonthly' type='checkbox' onchange='checkID(" + row + ")' class='" + row + "' id='" + record.get('sp_gl_monthly_dtl_id') + "' value='" + value + "' " + readonly + "> ";
                        } 
                    }, 
                    {
                        header: "เดือน",
                        sortable: false,
                        align: "center",
                        dataIndex: "i_month",
                        width: 60,
                        editor: new Ext.form.TextField({
                            style: "text-align: center",
                            listeners: {
                                afterrender: function () {
                                    this.fn = function () {
                                        // this.setValue(floatRenderer(floatMinus(this.getValue().replace(/,/g, ""), 2)));
                                    };
                                },
                                Change: function (value) {
                                    this.fn();
                                },
                            },
                        }),
                    },{
                        header: "งวด",
                        sortable: false,
                        align: "center",
                        width: 60,
                        dataIndex: "i_period",
                    },
                    {
                        header: "แหล่งเงิน",
                        sortable: false,
                        align: "center",
                        dataIndex: "dc_expense_budget_type_id",
                        width: 250,
                        editor: new Ext.form.ComboBox({
                            mode: "local",
                            id: "editor_dc_cost_id",
                            store: Ext.dc_expense_budget_in_tor,
                            valueField: "id",
                            displayField: "c_name",
                            triggerAction: "all",
                            forceSelection: true,
                            selectOnFocus: true,
                            typeAhead: false,
                            emptyText: "กรุณาเลือก...",
                            listeners: {
                                afterrender: function () {
                                    this.fn = function () {};
                                },
                                Change: function () {
                                    this.fn();
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
                        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                            if (record.data.i_type == 1 || record.data.i_type == 2) {
                                metaData.attr = "style='text-align: right; font-weight: bold;'";
                                let name = record.data.i_type == 1 ? getStoreItems(Ext.dc_expense_budget_type, value, "c_name") : "รวมทั้งสิ้น";
                                name = name != "" ? name : "- ไม่ระบุหน่วยงาน -";
                                return name;
                            } else if (value != "" && value != undefined) {
                                metaData.attr = "style='text-align: left;'";
                                let name = getStoreItems(Ext.dc_expense_budget_type, value, "c_name");
                                return name;
                            } else {
                                metaData.attr = "style='text-align: center; color:red;'";
                                return "-";
                            }
                        },
                    },
                    {
                        header: "ผังบัญชี",
                        sortable: false,
                        hidden: true,
                        align: "center",
                        dataIndex: "dc_acc_id",
                        width: 250,
                        editor: new Ext.form.ComboBox({
                            mode: "local",
                            id: "editor_dc_acc_id",
                            store: Ext.NMU_dc_acc,
                            valueField: "id",
                            displayField: "c_name",
                            triggerAction: "all",
                            forceSelection: true,
                            selectOnFocus: true,
                            typeAhead: false,
                            emptyText: "กรุณาเลือก...",
                            listeners: {
                                afterrender: function () {
                                    this.fn = function () {};
                                },
                                Change: function () {
                                    this.fn();
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
                        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                            if (record.data.i_type == 1 || record.data.i_type == 2) {
                                metaData.attr = "style='text-align: right; font-weight: bold;'";
                                let name = record.data.i_type == 1 ? getStoreItems(Ext.NMU_dc_acc, value, "c_name") : "รวมทั้งสิ้น";
                                name = name != "" ? name : "- ไม่ระบุหน่วยงาน -";
                                return name;
                            } else if (value != "" && value != undefined) {
                                metaData.attr = "style='text-align: left;'";
                                let name = getStoreItems(Ext.NMU_dc_acc, value, "c_name");
                                return name;
                            } else {
                                metaData.attr = "style='text-align: center; color:red;'";
                                return "-";
                            }
                        },
                    },
                    {
                        header: "จำนวนเงิน",
                        sortable: false,
                        align: "center",
                        dataIndex: "f_month_total",
                        width: 110,
                        editor: new Ext.form.TextField({
                            style: "text-align: right",
                            // enableKeyEvents: true,
                            listeners: {
                                afterrender: function () {
                                    this.fn = function () {
                                        this.setValue(this.getValue() <= 0 ? 0 : this.getValue());
                                        this.setValue(floatRenderer(floatMinus(this.getValue().replace(/,/g, ""), 2)));
                                    };
                                },
                                Change: function (value) {
                                    // text_dc_expense_budget();
                                    this.fn();
                                },
                            },
                        }),
                        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                            if (record.data.i_type == 1 || record.data.i_type == 2) {
                                metaData.attr = "style='text-align: right; font-weight: bold;'";
                                return floatRenderer(floatMinus(value.replace(/,/g, ""), 2));
                            } else if (value) {
                                metaData.attr = "style='text-align: right;'";
                                return floatRenderer(floatMinus(value.replace(/,/g, ""), 2));
                            } else {
                                metaData.attr = "style='text-align: right; color:red;'";
                                return "-";
                            }
                        },
                    },
                    {
                        header: "วันที่",
                        sortable: false,
                        align: "center",
                        dataIndex: "d_doc_date",
                        editor: new Ext.form.DateField({}),
                        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                            return value != "" && value != null ? shortThaiDate(value) : "";
                        },
                    },
                    {
                        header: "ค่าใช้จ่าย",
                        sortable: false,
                        align: "center",
                        dataIndex: "c_comment",
                        width: 150,
                        editor: new Ext.form.TextField({
                            listeners: {
                                afterrender: function () {
                                    this.fn = function () {};
                                },
                                Change: function (value) {
                                    this.fn();
                                },
                            },
                        }),
                        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                            metaData.attr = "style='text-align: left;'";
                            return value;
                        } 
 
                    },
                    {width: 20, dataIndex: ""},
                ],
                tbar: [
                    {
                        text: "&nbsp;บันทึกการตั้งหนี้ค่าใช่จ่ายตามงวด&nbsp;" + rec.get('i_period'),
                        id: "saveExtendTime",
                        iconCls: "icon-save",
                        handler: function () {  
                            
                            var elements = document.getElementsByName('dtlMonthly');
                            Ext.arrDtl =[];
                            elements.forEach(function (val) { 
                                
                                    if(val.checked===true){
                                        var rowIndex = val.getAttribute('class');
                                        var record = Ext.sp_gl_monthly_dtl.getAt(rowIndex);
                                         if(record.get('sp_tor_hdr_period_id')===null){
                                             record.set("sp_tor_hdr_period_id",rec.get('sp_tor_hdr_period_id'));
                                             record.set("i_period",rec.get('i_period'));
                                         }
//                                          console.log(record.get('sp_gl_monthly_dtl_id'));
//                                          console.log(record.get('sp_tor_hdr_period_id'));
//                                          console.log(record.get('i_month'));
//                                          console.log(record);
                                       
                                            Ext.arrDtl.push({
                                                sp_gl_monthly_dtl_id:record.get('sp_gl_monthly_dtl_id'),
                                                sp_tor_hdr_period_id:record.get('sp_tor_hdr_period_id'),
                                                i_period:record.get('i_period'),
                                                i_month:record.get('i_month') 
                                            });
                                        } 
                                    });
                     
                            
                          
                            if(!Ext.isEmpty(Ext.arrDtl)){
                                console.log( JSON.stringify(Ext.arrDtl));
                            }
                        
                            Ext.Ajax.request({
                                    url: "tor/api/mnGlController.php",
                                    method: "POST",
                                    params: {
                                        mode: "UP_SP_GL_MONTHLY",
                                        sp_tor_id: Ext.HDR_ID,
                                        sp_tor_hdr_period_id: Ext.sp_tor_hdr_period_id,
                                        i_period: rec.get('i_period'),
                                        sp_tor_contract_id: Ext.sp_tor_contract_id, 
                                        data: JSON.stringify(Ext.arrDtl)
                                    },
                                    success: function (result, request) {

                                        let json = Ext.util.JSON.decode(result.responseText); //decode json 
                                        console.log(json);
                                        Ext.sp_gl_monthly_dtl.reload(); 
                                        Ext.Msg.alert("แจ้งเตือน", "บันทึกรายการเรียบร้อย"); 
                                        Ext.getCmp("win-sp_gl_monthly").destroy();
                                        Ext.getCmp("contenterCenter").getEl().unmask();
                                    },
                                    failure: function (result, request) {
                                        Ext.MessageBox.alert("Failed", result.responseText); // connect error
                                    } 
                            });
                          
                        } 
                    } 
                          
                ] 
            }) 
        ] 
    }).show();


};
Ext.AppMonthly = function (row, rec) {
    Ext.SelectStore = row;
    Ext.runStatus(row, rec);
};
