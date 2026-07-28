// save dtl ADD && EDIT //
const saveDtl = function () {
    let msg = "";
    let mode = Ext.getCmp("dtl_mode").getValue().inputValue;

    if (mode == "EDIT_DTL" || mode == "DELETE_DTL") {
        if (Ext.getCmp("dtl_id").getValue() == "") {
            msg += "<span style='white-space: nowrap;'>- กรุณาเลือก รายการอ้างอิง</span><br>";
        }
    }

    if (mode == "ADD_DTL" || mode == "EDIT_DTL") {
        if (Ext.getCmp("dtl_d_post_date").getValue() == "") {
            msg += "<span style='white-space: nowrap;'>- กรุณากรอก วันที่</span><br>";
        } else if (Ext.getCmp("dtl_d_start_date").getValue() == "") {
            msg += "<span style='white-space: nowrap;'>- กรุณากรอก วันที่</span><br>";
        } else if (Ext.getCmp("dtl_d_end_date").getValue() == "") {
            msg += "<span style='white-space: nowrap;'>- กรุณากรอก วันที่</span><br>";
        } else if (Ext.getCmp("dtl_d_billing_date").getValue() == "") {
            msg += "<span style='white-space: nowrap;'>- กรุณากรอก วันที่</span><br>";
        } else if (Ext.getCmp("dtl_i_time").getValue() == "") {
            msg += "<span style='white-space: nowrap;'>- กรุณากรอก รอบการวางบิล</span><br>";
        }
    }

    if (msg == "") {
        Ext.getCmp("contenterCenter")
                .getEl()
                .mask("Please wait...", "x-mask-loading");
        Ext.Ajax.request({
            url: "api/mn_spBgBilling.php",
            method: "POST",
            params: {
                mode: mode,
                id: mode == "ADD_DTL" ? "" : Ext.getCmp("dtl_id").getValue(),
                sp_bg_billing_id: Ext.HDR_ID,
                d_post_date: Ext.util.Format.date(Ext.getCmp("dtl_d_post_date").getValue(), "Y-m-d"),
                d_start_date: Ext.util.Format.date(Ext.getCmp("dtl_d_start_date").getValue(), "Y-m-d"),
                d_end_date: Ext.util.Format.date(Ext.getCmp("dtl_d_end_date").getValue(), "Y-m-d"),
                d_billing_date: Ext.util.Format.date(Ext.getCmp("dtl_d_billing_date").getValue(), "Y-m-d"),
                i_time: Ext.getCmp("dtl_i_time").getValue(),
                i_yyyy: Ext.getCmp("i_yyyyID").getValue(),
                i_enabled : Ext.getCmp("dtl_mode").getValue().inputValue == "DELETE_DTL" ? 2 : 1   //mode == "ADD_DTL" ? "" : Ext.getCmp("dtl_id").getValue(),
            },
            success: function (result, request) {
                Ext.getCmp("contenterCenter")
                        .getEl()
                        .unmask();
                let json = Ext.util.JSON.decode(result.responseText); //decode json
                Ext.storeDtl.load({params: {hdr_id: Ext.HDR_ID}});
                Ext.Msg.alert("แจ้งเตือน", json.msg);

                Ext.getCmp("dtl_id").setValue("");
                Ext.getCmp("dtl_refer").setValue("");
                Ext.getCmp("dtl_mode").setValue("ADD_DTL");
              
            },
            failure: function (result, request) {
                Ext.MessageBox.alert("Failed", result.responseText); // connect error
            }
        });
    } else {
        Ext.Msg.alert("แจ้งเตือน", msg);
    }
}; // saveDtl

// Class Extend
formPanelDtl = function (args) {
    formPanelDtl.superclass.constructor.call(this, {
        title: "วันหยุดประจำ",
        id: "PanelDtl",
        iconCls: "icon-application-view-list",
        region: "center",
        layout: "fit",
        border: false,
        stripeRows: true,
        loadMask: true,
        listeners: {
            afterrender: function (obj, eOpts) {
                Ext.getCmp("contenterCenter").getEl().mask("Please wait...", "x-mask-loading");
                Ext.storeDtl.load({
                    params: {hdr_id: Ext.HDR_ID},
                    callback: function (records, operation, success) {
                        Ext.getCmp("contenterCenter").getEl().unmask();
                    }
                });
            }
        },
        items: [
            new Ext.Panel({
                layout: "border",
                border: false,
                bodyPadding: 5,
                items: [
                    {
                        region: "center",
                        layout: "fit",
                        items: [
                            {
                                xtype: "grid",
                                id: "grid_dtl",
                                border: false,
                                stripeRows: true,
                                loadMask: true,
                                store: Ext.storeDtl,
                                viewConfig: {
                                    emptyText: "ไม่มีข้อมูล..",
                                    deferEmptyText: false
                                },
                                columns: [
                                    new Ext.grid.RowNumberer({
                                        header: "ที่",
                                        width: 30,
                                        renderer: function (value, metaData, record, row, col, store, gridView) {
                                            return record.get("no");
                                        }
                                    }), {
                                        header: "รายการ",
                                        sortable: true,
                                        dataIndex: "c_name",
                                        width: 120,
                                        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                                            metaData.attr = 'style="cursor:pointer; text-align:left;"';
                                            return value;
                                        }
                                    }, {
                                        header: "เดือนใบวางบิล",
                                        sortable: true,
                                        dataIndex: "i_mmyyyy",
                                        width: 100,
                                        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                                            metaData.attr = 'style="cursor:pointer; text-align:center;"';
                                            return value;
                                        }
                                    }, {
                                        header: "รอบการวางบิล",
                                        sortable: true,
                                        dataIndex: "i_time",
                                        width: 100,
                                        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                                            metaData.attr = 'style="cursor:pointer; text-align:center;"';
                                            return value; // return value !== "" ? longThaiDate(value) : "";
                                        }
                                    },
                                    {
                                        header: "วันที่เริ่มรับใบสรุปการวางบิล",
                                        sortable: true,
                                        dataIndex: "d_start_date",
                                        width: 100,
                                        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                                            metaData.attr = 'style="cursor:pointer; text-align:center;"';
                                            return value; //return value != "" ? longThaiDate(value) : "";
                                        }
                                    },
                                    {
                                        header: "วันที่เริ่มรับใบสรุปการวางบิล",
                                        sortable: true,
                                        dataIndex: "d_end_date",
                                        width: 100,
                                        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                                            metaData.attr = 'style="cursor:pointer; text-align:center;"';
                                            return value;//return value != "" ? longThaiDate(value) : "";
                                        }
                                    }, {
                                        header: "วันที่วางบิล",
                                        sortable: true,
                                        dataIndex: "d_billing_date",
                                        width: 100,
                                        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                                            metaData.attr = 'style="cursor:pointer; text-align:center;"';
                                            return value;
                                        }
                                    }, {
                                        header: "วันวางบิล",
                                        sortable: true,
                                        dataIndex: "c_day_name",
                                        width: 100,
                                        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                                            return Ext.daysInWeek[0][value];
                                        }
                                    },
                                    {
                                        header: "ยืนยันรอบวางบิล",
                                        sortable: true,
                                        dataIndex: "i_confirm",
                                        width: 100,
                                        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                                            metaData.attr = 'style="cursor:pointer; text-align:center;"';
                                            return (value / 1) === 0 ? "<span style='color:red'>ยังไม่ยืนยัน</span>" : "<span style='color:blue'>ยืนยันแล้ว</span>";
                                        }
                                    },
                                ],
                            }
                        ]
                    },
                    {
                        region: "east",
                        layout: "fit",
                        border: false,
                        width: 500,
                        items: [
                            new Ext.FormPanel({
                                labelWidth: 160,
                                labelAlign: "right",
                                frame: true,
                                items: [
                                    {
                                        xtype: "fieldset",
                                        title: "รายการที่เลือก",
                                        defaults: {width: "90%"},
                                        items: [
                                            {
                                                xtype: "hidden",
                                                id: "dtl_id"
                                            },
                                            {
                                                xtype: "hidden",
                                                id: "dtl_i_yyyyID",
//                                                fieldLabel: "test10101",
                                                name: "dtl_i_yyyy"
                                            },
                                            {
                                                xtype: "displayfield",
                                                fieldLabel: "รายการอ้างอิง",
                                                id: "dtl_refer"
                                            }, {
                                                xtype: "radiogroup",
                                                fieldLabel: "เลือก",
                                                id: "dtl_mode",
                                                columns: [55, 65, 50, 120],
                                                items: [
                                                    {boxLabel: "เพิ่ม", checked: true, name: "dtl_mode", inputValue: "ADD_DTL"},
                                                    {boxLabel: "แก้ไข", name: "dtl_mode", inputValue: "EDIT_DTL"},
                                                    {boxLabel: "ลบ", name: "dtl_mode", inputValue: "DELETE_DTL"},
//                                                    {boxLabel: "โหลดวันหยุดประจำปี", name: "dtl_mode", inputValue: "LOAD_HOLIDAY"}
                                                ],listeners:{
                                                    change:function(){
//                                                       Ext.getCmp('yesnoID').setText('TEsTTTTTTT');
console.log(Ext.getCmp('dtl_mode').getValue().boxLabel);
                                                    }
                                                }
                                            },
                                            {
                                                xtype: "datefield",
                                                fieldLabel: "วันที่",
                                                id: "dtl_d_post_date",
                                                value: addY(543),
                                                listeners: {
                                                    chagne: function () {

                                                    }
                                                }
                                            }, {
                                                xtype: "textfield",
                                                id: "dtl_i_time",
                                                width: 80,
                                                fieldLabel: "รอบวางบิล"
                                            },
                                            {
                                                xtype: "datefield",
                                                fieldLabel: "วันที่เริ่มรับใบสรุปการวางบิล",
                                                id: "dtl_d_start_date",
                                                value: addY(543)
                                            },
                                            {
                                                xtype: "datefield",
                                                fieldLabel: "วันที่สิ้นสุดรับใบสรุปการวางบิล",
                                                id: "dtl_d_end_date",
                                                value: addY(543)
                                            },
                                            {
                                                xtype: "datefield",
                                                fieldLabel: "วันที่วางบิล",
                                                id: "dtl_d_billing_date",
                                                value: addY(543),
                                                listeners: {
                                                    change: function () {
                                                        var dow = (new Date(Ext.util.Format.date(this.getValue(), "Y-m-d")).getDay() / 1) + 1; //javascropt
                                                        Ext.getCmp("dtl_day_in_week").setValue(Ext.daysInWeek[0][dow]);
                                                    },
                                                    afterrender: function () {

                                                        this.fnChage = function () {
                                                            var d_post = Ext.getCmp('dtl_d_post_date').getValue();
                                                            var d_start = Ext.getCmp('dtl_d_start_date').getValue();
                                                            var d_end = Ext.getCmp('dtl_d_end_date').getValue();
                                                            var d_billing = Ext.getCmp('dtl_d_billing_date').getValue();

                                                            var notif_warranty_day = new Date(d_post).add(Date.DAY, 10);
                                                        };
                                                    }
                                                }
                                            }, {
                                                xtype: 'displayfield',
                                                id: 'dtl_day_in_week',
                                                fieldLabel: "วันวางบิล",
                                                listeners: {
                                                    afterrender: function () {
                                                        var dow = (new Date(Ext.util.Format.date(Ext.getCmp('dtl_d_billing_date').getValue(), "Y-m-d")).getDay() / 1) + 1; //javascropt
                                                        Ext.getCmp("dtl_day_in_week").setValue(Ext.daysInWeek[0][dow]);
                                                    }
                                                }
                                            }

                                        ],
                                        buttonAlign: 'left',
                                        buttons: [
                                            {
                                                text: "&nbsp;" + Ext.GLOBAL_BU_SAVE_TH + "&nbsp;",
                                                iconCls: "icon-save",
                                                handler: function () {
                                                    Ext.MessageBox.minWidth = 300;
                                                    Ext.MessageBox.show({
                                                        title: 'ยืนยันการบันทึก '+Ext.getCmp('dtl_mode').getValue().boxLabel+" ข้อมูลรายการ",
                                                        id:'yesnoID',
                                                        message: 'Message',
                                                        text: 'Message',
                                                        buttons:Ext.MessageBox.OKCANCEL, 
                                                        buttonText: {
                                                            yes: 'ยืนยันการบันทึก', 
                                                            cancel: 'ยกเลิก'
                                                        },
                                                        icon: Ext.Msg.QUESTION,
                                                        fn: function (btn) {
                                                            if (btn === 'ok') {
                                                                saveDtl(); 
                                                            } else {
                                                                console.log(btn);
                                                            }
                                                        }
                                                    });

                                                }
                                            },
                                            {
                                                text: Ext.GLOBAL_BU_BACK_TH,
                                                handler: function () {
                                                    Ext.getCmp("contenterCenter").remove(Ext.getCmp("frm-Add"), true) || {};
                                                    Ext.getCmp("contenterCenter").remove(Ext.getCmp("PanelDtl"), true) || {};
                                                }
                                            }
                                        ]
                                    }
                                ]
                            })
                        ]
                    }
                ]
            })
        ]
    });

    Ext.getCmp("grid_dtl").on("cellclick", function (grid, rowIndex, columnIndex, e) {

        let record = grid.getStore().getAt(rowIndex);

        Ext.getCmp("dtl_id").setValue(record.data.id);
        Ext.getCmp("dtl_i_yyyyID").setValue(record.get("i_yyyy"));
        Ext.getCmp("dtl_refer").setValue(record.data.c_name);
        Ext.getCmp("dtl_mode").setValue("EDIT_DTL");
        Ext.getCmp("dtl_i_time").setValue(record.get('i_time'));
        Ext.getCmp("dtl_d_post_date").setValue(record.get('d_post_date'));
        Ext.getCmp("dtl_d_start_date").setValue(record.get('d_start_date'));
        Ext.getCmp("dtl_d_end_date").setValue(record.get('d_end_date'));
        Ext.getCmp("dtl_d_billing_date").setValue(record.get('d_billing_date'));
        Ext.getCmp("dtl_day_in_week").setValue(Ext.daysInWeek[0][record.get('c_day_name')]);

    }, this);
}; // formPanelDtl
Ext.extend(formPanelDtl, Ext.Panel, {});
