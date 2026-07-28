Ext.HDR_ID = null;

const saveHdr = function (type) {
    let msg = "";
    if (Ext.getCmp("c_name").getValue() == "") {
        msg += "<span style='white-space: nowrap;'>- กรุณากรอก ผู้ดำเนินการ</span><br>";
    }

    if (msg == "") {
        Ext.getCmp("frm-Add")
                .getEl()
                .mask("Please wait...", "x-mask-loading");
        Ext.Ajax.request({
            url: "api/mn_poEmp.php",
            method: "POST",
            params: {
                mode: Ext.getCmp("role-form-mode").getValue(),
                id: Ext.getCmp("id").getValue(),
                c_name: Ext.getCmp("c_name").getValue(),
                c_comment: Ext.getCmp("c_comment").getValue()
            },
            success: function (result, request) {
                Ext.getCmp("frm-Add")
                        .getEl()
                        .unmask();
                let jsonData = Ext.util.JSON.decode(result.responseText); //decode json
                if (jsonData.success == true) {
                    Ext.store.load({params: {mode: ""}});
                    Ext.Msg.alert("แจ้งเตือน", "บันทึกเรียบร้อย");
                    Ext.getCmp("contenterCenter").remove(Ext.getCmp("frm-Add"), true) || {};
                } else {
                    Ext.MessageBox.alert("แจ้งเตือน", jsonData.msg);
                }
            },
            failure: function (result, request) {
                Ext.MessageBox.alert("Failed", result.responseText); // connect error
            }
        });
    } else {
        Ext.Msg.alert("แจ้งเตือน", msg);
    }
}; // saveHdr
const Obj_MutiSave = [
    {
        xtype: "buttongroup",
        frame: false,
        items: [
            {xtype: "label", text: "วันที่ทำรายการ : ", style: "font-size: 14px; "},
            {xtype: "tbspacer", width: 4},
            {
                xtype: "datefield",
                id: "d_doc_date",
                style: "font-size: 14px;",
                width: 100,
            },
            {xtype: "tbspacer", width: 100},
        ],
    },
    {
        xtype: "buttongroup",
        frame: false,
        items: [
            {xtype: "label", text: "รักษาการแทน : ", style: "font-size: 14px; "},
            {xtype: "tbspacer", width: 4},
            {
                xtype: "checkbox",
                id: "i_instead_cost_sign",
                // boxLabel: "รักษาการแทน",
                inputValue: 1,
                checked: false,
                listeners: {
                    check: function (combo, newValue) {
                        if (newValue) {
                            Ext.getCmp("c_instead_cost_sign").show();
                            Ext.getCmp("c_instead_cost_sign").setValue("รักษาการแทนหัวหน้าฝ่าย");
                        } else {
                            Ext.getCmp("c_instead_cost_sign").hide();
                        }
                    },
                },
            },
            {xtype: "tbspacer", width: 183},
        ],
    },
    {
        xtype: "buttongroup",
        frame: false,
        items: [
            // { xtype: "tbspacer", width: 4 },
            {
                xtype: "textfield",
                hidden: true,
                id: "c_instead_cost_sign",
                name: "c_instead_cost_sign",
                style: "color: blue;",
                width: 200,
                value: "รักษาการแทนหัวหน้าฝ่าย",
            },
            {xtype: "tbspacer", width: 201},
                    // { xtype: "tbspacer", width: 100 },
        ],
    },
    {
        xtype: "buttongroup",
        frame: false,
        items: [
            {xtype: "label", text: "หมายเหตุ : ", style: "font-size: 14px; "},
            {xtype: "tbspacer", width: 4},
            {
                xtype: "textarea",
                fieldLabel: "หมายเหตุ",
                id: "c_comment_status",
                height: 40, // Set the height here
                width: 200,
            },
        ],
    },
]; // Obj_MutiSave
// Class Extend

Ext.fnTrigger = (combo) => {
    combo.store.load({
        callback: function () {

            combo.onTriggerClick(); // Auto-open dropdown 
        }
    });
};

formAdd = function (args) {
    Ext.ns('Ext.ux.Button');
    Ext.ns('Ext.ux.Grid');
    Ext.ns('Ext.Window');
    Ext.rec = args;

    //create the data store
    /*
     var record = Ext.data.Record.create([
     {
     name: "dc_menu_id",
     type: "int",
     },
     {
     name: "menu",
     },
     {
     name: "i_show",
     type: "bool",
     },
     {
     name: "i_read_self",
     type: "bool",
     },
     {
     name: "i_read_cost",
     type: "bool",
     },
     {
     name: "i_read_all",
     
     type: "bool",
     },
     {
     name: "i_read_overall",
     type: "bool",
     },
     {
     name: "i_per_add",
     type: "bool",
     },
     {
     name: "i_per_update",
     type: "bool",
     },
     {
     name: "i_per_delete",
     type: "bool",
     },
     {
     name: "_id",
     type: "int",
     },
     {
     name: "_level",
     type: "int",
     },
     {
     name: "_lft",
     type: "int",
     },
     {
     name: "_rgt",
     type: "int",
     },
     {
     name: "_is_leaf",
     type: "bool",
     },
     ]);
     
     var storePermission = new Ext.ux.maximgb.tg.NestedSetStore({
     autoLoad: true,
     storeId: "storePermission",
     url: "api/mnDcUserDcGroupMenu.php?mode=right",
     
     reader: new Ext.data.JsonReader(
     {
     id: "_id",
     root: "data",
     totalProperty: "total",
     successProperty: "success",
     },
     record
     ),
     });*/

    var store = new Ext.data.JsonStore({
        storeId: "myStore",
        autoDestroy: false,
        autoLoad: true,
        url: "./../dc/api/ListDcUser.php",
        baseParams: {
            i_read: user_right_read,
        }, //Permission i_read
        root: "data",
        idProperty: "id",
        totalProperty: "totalCount",
        fields: [
            {name: "no", type: "int"},
            {name: "id"},
            {name: "menu_hdr_id"},
            {name: "dc_emp_id"},
            {name: "c_name"},
            {name: "c_full_name"},
            {name: "dc_cost_id"},
            {name: "c_user_name"},
            {name: "c_sub_name_eng"},
            {name: "c_email"},
            {name: "c_name"},
            {name: "c_password"},
            {name: "c_comment"},
            {name: "i_type_user"},
            {name: "i_enable"},
            {name: "i_delete"},
            {name: "dc_user_create_id"},
            {name: "dc_user_create_cost_id"},
            {name: "d_create"},
            {name: "dc_user_update_id"},
            {name: "dc_user_update_cost_id"},
            {name: "d_update"},
        ],
    });
    /*
     //กลุ่มการใช้งานเมนู
     var dc_group_menu = new Ext.data.JsonStore({
     autoDestroy: true,
     autoLoad: true,
     url: "api/ListDcCombo.php",
     root: "data",
     idProperty: "id",
     fields: [
     {
     name: "id",
     },
     {
     name: "c_name",
     type: "string",
     },
     ],
     listeners: {
     load: function (t, records, options) {},
     },
     baseParams: {
     mode: 2,
     fldID: "dc_menu_hdr_id",
     table: "dc_menu_hdr",
     filter: "i_delete",
     value: 2,
     },
     });
     
     // ศูนย์ต้นทุน
     var dc_cost = new Ext.data.JsonStore({
     autoDestroy: true,
     autoLoad: true,
     url: "api/ListDcCombo.php",
     root: "data",
     fields: [{ name: "id" }, { name: "c_name", type: "string" }, { name: "dc_cost_lv2_id" }, { name: "c_name_lv2" }],
     baseParams: { mode: "DC_COST", fldID: "dc_cost_id", table: "dc_cost" },
     }); 
     // store พนักงานผู้รับผิดชอบ
     var dc_emp = new Ext.data.JsonStore({
     autoDestroy: true,
     autoLoad: true,
     url: "api/ListDcCombo.php",
     root: "data",
     fields: [{ name: "id" }, { name: "c_name", type: "string" }],
     baseParams: { mode: 1, fldID: "dc_emp_id", table: "dc_emp" },
     }); 
     // ผู้ใช้งานต้นแบบ (โหลดเมนู)
     var dc_emp_load = new Ext.data.JsonStore({
     autoDestroy: true,
     autoLoad: true,
     url: "api/ListDcCombo.php",
     root: "data",
     fields: [{ name: "id" }, { name: "c_name", type: "string" }],
     baseParams: { mode: "DC_EMP_LOAD", fldID: "dc_emp_id", table: "dc_emp" },
     });
     */

    var customEditor = new Ext.form.TriggerField({
        triggerClass: 'x-form-search-trigger', // shows the search icon
        editable: false,
        onTriggerClick: function () {
            // Show your custom window here


            if (!Ext.getCmp('win-grid-empID')) {

                var ss = new Ext.Window({
                    title: 'บันทีกผู้ลงนาม',
                    id: 'win-grid-empID',
                    modal: true,
//                                 plain: true, 
                    maximizable: true,
//                                 constrainHeader: true,
                    closable: true,
//                                 layout:'fit',
                    listeners: {
                        afterrender: function (obj, eOpts)
                        {

                            this.fn = function (d, h) { //percentage
                                var width = Ext.getBody().getViewSize().width * d;
                                var height = Ext.getBody().getViewSize().height * h;
                                this.setSize(width, height);
                                this.setTitle(Ext.getCmp('tabpanelGridEmp').lastSelectionText);
                            };
                            this.fn(0.8, 0.8);
                        },
                        "maximize": function (window, opts) { //when property minimizable
                            window.setWidth(Ext.getBody().getViewSize().width * 0.99);
                            window.setHeight(Ext.getBody().getViewSize().height * 0.99);
                            window.expand('', false);
                            window.center();
                            Ext.getCmp('tabpanelGridEmp').setWidth(Ext.getBody().getViewSize().width * 0.98);
                            Ext.getCmp('tabpanelGridEmp').setHeight(Ext.getBody().getViewSize().height * 0.98);
                        }
                    },
                    items: [{

                            title: "แสดงข้อมูลผู้ใช้งานระบบ",
                            xtype: "grid",
                            id: "tabpanelGridEmp",
                            border: false,
                            stripeRows: true,
                            layout: {
                                type: 'vbox',
                                align: 'stretch'  // Child items are stretched to full width
                            },
                            defaults: {
                                xtype: 'textfield'
                            },
                            listeners: {
                                afterrender: function (obj, eOpts)
                                {
                                    cellClick_choose = (grid, rowIndex, columnIndex, e) => {

                                        var rec = Ext.getCmp('tabpanelGridEmp').getStore().getAt(rowIndex);

                                        if (rec) {
                                            var gridSub = Ext.getCmp('grid-step-sign-doc').getSelectionModel().getSelectedCell();
                                            var recs = Ext.getCmp('grid-step-sign-doc').getStore().getAt(gridSub[0]);
                                            recs.set("dc_user_id", rec.get('dc_user_id'));
                                            recs.set("c_name", rec.get('c_name'));
                                            recs.set("c_full_name", rec.get('c_full_name'));
                                            recs.set("c_sub_name_eng", rec.get("c_sub_name_eng"));
                                            recs.set("c_email", rec.get("c_email"));
                                            recs.commit();
                                            Ext.getCmp('win-grid-empID').destroy();
                                        } else {
                                            Ext.Msg.alert("แจ้งเตือน", "กรุณาเลือกรายการที่จะลบ");
                                        }

                                    };

                                    this.on('cellclick', cellClick_choose, this);
                                    this.fn = function (d, h) { //percentage
                                        var width = Ext.getBody().getViewSize().width * d;
                                        var height = Ext.getBody().getViewSize().height * h;
                                        this.setSize(width, height);
                                        this.setTitle(Ext.getCmp('tabpanelGridEmp').lastSelectionText);
                                    };
                                    this.fn(0.79, 0.8);
                                },

                            },
                            loadMask: true,
                            store: store,
                            tbar: [
                                {
                                    xtype: "tbfill",
                                },
                                "",
                                "",
                                "-",
                                {
                                    id: "filterEmpID",
                                    xtype: "combo",
                                    width: 130,
                                    mode: "local",
                                    store: new Ext.data.SimpleStore({
                                        fields: ["value", "text"],
                                        data: [
                                            ["c_full_name", "ชื่อพนักงาน"],
                                            ["c_user_name", "ชื่อผู้ใช้งานระบบ"],
                                        ],
                                    }),
                                    valueField: "value",
                                    displayField: "text",
                                    allowBlank: false,
                                    editable: false,
                                    triggerAction: "all",
                                    typeAhead: false,
                                    value: "c_full_name",
                                },
                                "-",
                                {
                                    id: "value-boxEmpID",
                                    xtype: "textfield",
                                    width: 130,
                                    fieldLabel: "fieldLabel",
                                    emptyText: "คำที่ต้องการค้นหา",
                                },
                                "",
                                "-",
                                {
                                    text: "ค้นหา",
                                    iconCls: "icon-magnifier",
                                    handler: function () {
                                        if (Ext.getCmp("value-boxEmpID").getValue() != "") {
                                            store.setBaseParam("mode", "SEARCH");
                                            store.setBaseParam("filter", Ext.getCmp("filterEmpID").getValue());
                                            store.setBaseParam("value", Ext.getCmp("value-boxEmpID").getValue());
                                            Ext.getCmp("tabpanelGridEmp").getStore().load();
                                        } else {
                                            store.setBaseParam("mode", "");
                                            Ext.getCmp("tabpanelGridEmp").getStore().load();
                                        }
                                    },
                                },
                                "",
                                "-",
                            ],
                            columns: [
                                new Ext.grid.RowNumberer({
                                    width: 35,
                                    header: " No ",
                                    renderer: function (value, metaData, record, row, col, store, gridView) {
                                        return record.get("no");
                                    },
                                }),
                                {
                                    header: "ID System",
                                    sortable: true,
                                    hidden: true,
                                    dataIndex: "id",
                                },
                                {
                                    header: "อัพเดทเมนู",
                                    sortable: true,
                                    dataIndex: "id",
                                    renderer: function (value, metaData, record, row, col, store, gridView) {
                                        return record.get("menu_hdr_id") > 0 ? '<button id="buUpdaeMenu" onclick="Ext.runx(' + record.get("menu_hdr_id") + "," + record.get("id") + ')">updateMenu</button>' : "";
                                    },
                                },
                                {
                                    header: "ชื่อผู้ใช้งานระบบ",
                                    sortable: true,
                                    dataIndex: "c_user_name",
                                },

                                {
                                    id: "c_full_name",
                                    header: "ชื่อพนักงาน",
                                    sortable: true,
                                    dataIndex: "c_full_name",
                                },
                                {
                                    header: "Status",
                                    sortable: false,
                                    width: 150,
                                    align: "center",
                                    renderer: function (value, metaData, record, row, col, store, gridView) {
                                        return record.get("i_enable") ? '<img src="../images/icons/yes.gif");/>' : '<img src="../images/icons/no.gif");/>';
                                    },
                                },
                            ],
                            clicksToEdit: 1,
                            autoExpandColumn: "c_full_name",
                            bbar: (pagingBar = new Ext.PagingToolbar({
                                pageSize: 20,
                                store: store,
                                displayInfo: true,
                                displayMsg: "Displaying topics {0} - {1} of {2}",
                            })),

                        }],
                    buttons: [{
                            text: 'บันทีกผู้ลงนาม',
                            handler: function () {
                                var gridSub = Ext.getCmp('grid-step-sign-doc').getSelectionModel().getSelectedCell();
                                var rec = Ext.getCmp('grid-step-sign-doc').getStore().getAt(gridSub[0]);
//                                rec.set("dc_user_id", 3);
//                                rec.set("c_name", "จักราวุธ มณีฤทธิ์");
//                                rec.set("dc_full_name", "ผู้ช่วยศาสตราจารย์จักราวุธ มณีฤทธิ์");
//                                rec.set("sign_eng", "juk.ma");
//                                rec.set("email", "new@example.com");
//                                rec.commit();
                                ss.destroy();

                            }
                        }],
                }).show();
            }
        }
    });

    var grid = new Ext.grid.EditorGridPanel({
//    title: 'Editable Grid',
        id: 'grid-step-sign-doc',
        layout: "fit",
        border: true,
        tbar: [{
                xtype: 'button', text: 'บันทึกตำแหน่ง', iconCls: "icon-save",
                hadler: function () {
                    Ext.example.msg("แจ้งเตือน", 'บันทึกตำแหน่ง', 3);
                }
            }],
        viewConfig: {
            emptyText: "ไม่มีข้อมูล..",
            deferEmptyText: false,
        },
        listeners: {
            afterrender: function () {
                cellClick_del = (grid, rowIndex, columnIndex, e) => {

                    var gridSub = Ext.getCmp('grid-step-sign-doc').getSelectionModel().getSelectedCell();
                    var rec = Ext.getCmp('grid-step-sign-doc').getStore().getAt(gridSub[0]);
                    if (gridSub[1] === Ext.getCmp('grid-step-sign-doc').getColumnModel().getIndexById("dc_user_del_idID")) {
                        if (rec) {
                            Ext.getCmp('grid-step-sign-doc').getStore().remove(rec);
                        } else {
                            Ext.Msg.alert("แจ้งเตือน", "กรุณาเลือกรายการที่จะลบ");
                        }
                    }
                };
                this.on('cellclick', cellClick_del, this);
            }
        },
        anchor: '100% 100%',
        autoScroll: true,
        store: new Ext.data.ArrayStore({
            fields: ["id", "postion_id", "c_postion", "c_name", "dc_user_id", "c_full_name", "c_sub_name_eng", 'c_email'],
            data: [
//        [2, 'จักราวุธ มณีฤทธิ์', 2, 'ผู้ช่วยศาสตราจารย์จักราวุธ มณีฤทธิ์', 'anu.sang', 'john@example.com'],
//        [3, 'จักราวุธ มณีฤทธิ์', 3, 'ผู้ช่วยศาสตราจารย์จักราวุธ มณีฤทธิ์', 'anu.sang', 'john@example.com']
            ]
        }),
        columns: [
            {
                header: '-',
//            hidden:true,
                menuDisabled: true,
                dataIndex: 'id', fixed: true,
                align: "center",
                width: 50,
            },
            {
                header: 'dc_user_id',
                hidden: true,
                dataIndex: 'dc_user_id',
            },
            {
                header: 'ลบ', hidden: true,
                dataIndex: 'dc_user_id', menuDisabled: true, fixed: true,
                id: 'dc_user_del_idID', width: 50,
                iconCls: "icon-vcard",
                renderer: function (value, metaData, record, row, col, store, gridView) {
                    if (!value || value == 0) {
                        metaData.css = 'grid-icon-cell';
                        return '<img src="../images/icons/user_cross.png" style="vertical-align:middle;margin-right:5px;" />' +
                                '<span style="color:red;">ลบ</span>';
                    } else {
                        return '<span style="color:blue;">...</span>';
                    }

                }
            },
            {
                header: 'เลือกผู้ปฎิบัติหน้าที่', width: 120,
                dataIndex: 'dc_user_id', menuDisabled: true, fixed: true,
                id: 'dc_user_idID',
                editor: customEditor,
                iconCls: "icon-vcard",
                renderer: function (value, metaData, record, row, col, store, gridView) {
                    if (!value || value == 0) {
                        metaData.css = 'grid-icon-cell';
                        return '<img src="../images/icons/user_add.png" style="vertical-align:middle;margin-right:5px;" />' +
                                '<span style="color:red;">ผู้ปฎิบัติหน้าที่</span>';
                    } else {
                        return '<img src="../images/icons/user_edit.png" style="vertical-align:middle;margin-right:5px;" />' +
                                '<span style="color:blue;">แก้ไข</span>';
                    }

                }
            },
            {

                header: 'เจ้าหน้าที่ดำเนินการลงนาม',
                dataIndex: 'c_postion', width: 250,
                editor: new Ext.form.TextField({
                    allowBlank: false
                })
            },
            {
                header: 'ชื่อ',
                dataIndex: 'c_name', width: 150,
                editor: new Ext.form.TextField({
                    allowBlank: false
                })
            },
            {
                header: 'ชื่อในการลงนาม',
                dataIndex: 'c_full_name', width: 150,
//            editor: new Ext.form.TextField({
//                allowBlank: false
//            })
            },
            {
                header: 'ลงนาม',
                dataIndex: 'c_sub_name_eng',
//            editor: new Ext.form.TextField({
//                allowBlank: false
//            })
            },
            {
                header: 'Email',
                dataIndex: 'c_email',
//            editor: new Ext.form.TextField({
//                vtype: 'email'
//            })
            }
        ],
        clicksToEdit: 1, // edit on single-click 
//    renderTo:'step_sign_doc'
    });
    Ext.sing_stemp_doc = [{
            xtype: "container",
            layout: "hbox",
            align: "stretch",
            RemoveHeight: true,
            defaults: {xtype: "fieldset", flex: 1, margins: "0px 3px", autoHeight: true},
            items: [
                {
                    title: "บันทึกข้อมูล " + Ext.title,
                    RemoveCls: "x-box-item",
                    collapsible: true,
                    collapsed: false,
                    defaults: {labelStyle: "width:200px;", allowBlank: true},
                    items: [
                        {
                            xtype: "hidden",
                            id: "role-form-mode",
                            name: "mode",
                            readOnly: true
                        },
                        {
                            xtype: "hidden",
                            id: " step_document_id", //  step_sign status_approve approve_by
                            name: "step_document_id",
                            readOnly: true

                        },
                        {
                            xtype: "hidden",
                            id: "id",
                            name: "id",
                            readOnly: true
                        },
                        {
                            xtype: "radiogroup",
                            columns: [150, 150],
                            fieldLabel: "รายการอ้างอิง",
                            id: "searchPostID",
                            name: "i_post",
                            items: [
                                {
                                    name: "i_post",
                                    checked: true,
                                    inputValue: 0,
                                    boxLabel: "PR ก่อนทำสัญญา",
                                },
                                {
                                    name: "i_post",
                                    inputValue: 1,
                                    boxLabel: "หลังออกเลขสัญญา พวช.",
                                },
                                {
                                    name: "i_post",
                                    inputValue: 2,
                                    boxLabel: "ซื้อ PO",
                                },
                                {
                                    name: "i_post",
                                    inputValue: 3,
                                    boxLabel: "เลขรับของ IR",
                                },
                            ], //radiogroup
                        },
//                    PopContForm,
                        new Ext.form.ComboBox({
//new Ext.ux.form.LovCombo({
//                        readOnly: false,
//                        editable: true,
                            fieldLabel: "เอกสารที่ดำเนินการ",
                            mode: "local",
                            store: Ext.sp_status_document_items,
                            id: "approved_document_val",
                            hiddenName: "approved_document_val",
                            name: "approved_document_val",
                            valueField: "id",
                            displayField: "c_name",
                            width: 400,
                            triggerAction: "all",
                            forceSelection: true,
                            selectOnFocus: true,
                            typeAhead: false,
                            emptyText: "กรุณาเลือก...",
                            resizable: true, // optional for manual resizing
                            listeners: {
                                afterrender: function (combo) {
                                    Ext.fnTrigger(combo);
                                    this.fn = function () {
                                        Ext.getCmp("frm-Add").getEl().mask("Please wait...", "x-mask-loading");
                                        Ext.storePrDoc.setBaseParam("type", "PRLISTSTEP02");
//                                        Ext.storeDepartments.setBaseParam("mode", "LIST");
                                        Ext.storePrDoc.setBaseParam("docType", this.getValue());
                                        Ext.storePrDoc.load({
                                            callback: function (record, operation, success) {
                                                console.log(record);
                                                Ext.getCmp("frm-Add").getEl().unmask();
                                            }
                                        });

                                    };

                                },
                                change: function () {
//                                    this.fn();
                                },
                                select: function () {
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
                                expand: function (cb) {
                                    // Automatically adjust list width based on longest option
                                    var max = 0;
                                    cb.store.each(function (rec) {
                                        var len = rec.get(cb.displayField).length;
                                        if (len > max) {
                                            max = len;
                                        }
                                    });

                                    var newWidth = (max * 7) + 30; // 7 is approx avg char width in px
                                    cb.list.setWidth(Math.max(cb.getWidth(), newWidth));
                                }
                            }
                        }),

                        {
                            xtype: "buttongroup",
                            frame: false,
                            fieldLabel: "รายการ PR อ้างอิง ",
                            items: [
//                            {xtype: "label", text: "รายการ PR อ้างอิง : ", style: "font-size: 14px; "},
//                            {xtype: "tbspacer", width: 4},
                                {
                                    xtype: "textfield",
                                    id: "d_doc_ref",
                                    name: "d_doc_ref",
                                    style: "font-size: 14px;",
                                    width: 100,
                                },
                                {xtype: "tbspacer", width: 4},
                                Ext.PopChoosePRForm.mini
                            ],
                        },

                        new Ext.ux.form.LovCombo({
                            readOnly: false,
                            editable: false,
                            fieldLabel: "เจ้าหน้าที่ดำเนินการลงนาม",
                            mode: "local",
                            store: Ext.sp_signin_document,
                            id: "sign_step_doc",
                            hiddenName: "sign_step_doc", //sp_signin_document
                            name: "sign_step_doc",
                            valueField: "id",
                            displayField: "c_name",
                            width: 400,
                            triggerAction: "all",
                            forceSelection: true,
                            selectOnFocus: true,
                            typeAhead: false,
                            emptyText: "กรุณาเลือก...",
                            listeners: {
                                beforerender: function () {
                                    Ext.arr1 = [];
                                },
                                beforeselect: function (t, records, options) {
//                                    if (Ext.arr1.length === 3 && records.get('checked') === false) {
//                                        Ext.example.msg("", 1); 
//                                        setTimeout(function () {
//                                            $(this).next().remove(); 
//                                        }, 6000);
//                                        return false;
//                                    }

                                },
                                realBlur: function (t, records, options) {
                                    
                                },
                                select: function (t, records, options) {
                                    var NewRecord = grid.store.recordType;  // this gets the Record constructor
                                    var newRec = new NewRecord({
                                        id: records.get('id'),
                                        postion_id: records.get('id'),
                                        c_postion: records.get('c_name'),
                                        c_name: null,
                                        dc_user_id: null,
                                        c_full_name: null,
                                        c_sub_name_eng: null,
                                        c_email: null
                                    });
                                    if (records.get('checked') === true) {
                                        grid.store.add(newRec);

                                    } else {
                                        var rec = Ext.getCmp('grid-step-sign-doc').getStore();
                                        var rs = Ext.getStoreRow(rec, records.get('id')); 
                                        if (rs) {
                                            Ext.getCmp('grid-step-sign-doc').getStore().remove(rs);
                                            grid.store.remove(records);
                                        } else { 
                                            Ext.example.msg("แจ้งเตือน", 'กรุณาเลือกรายการที่จะลบ', 1);
                                        }
                                       
                                    }
                                    Ext.rec
                                },
                                afterrender: function (combo) {
//                                    Ext.fnTrigger(combo);
                                }
                            }
                        }),
                        {
//                            xtype: "textfield",
//                            fieldLabel: "ผู้ดำเนินการ",
//                            id: "sp_emp_name",
//                            name: "sp_emp_name",
//                            width: 400,
//                        },
//                        {
                            xtype: "textarea",
                            fieldLabel: "หมายเหตุ",
                            id: "c_comment",
                            name: "c_comment",
                            emptyText: "กรุณาเลือก...",
                            width: 400,
//                        }, {
//                            xtype: "radiogroup",
//                            id: "text_pdf_up",
//                            columns: 1,
//                            hidden: false,
//                            items: [
//                                {
//                                    xtype: "label",
//                                    html: `
//                              <span style='color:blue; font-size: 15px;'>
//                              *กรุณาแนบเอกสารใบขอเบิกที่ผู้ขอเบิกลงนามแล้ว + เอกสารประกอบ
//                              <br>(ผู้ขอเบิกไม่ต้องเข้ามากดภายในระบบหลังจากขั้นตอนนี้)
//                              </span>
//                              `,
//                                },
//                            ],
                        } , {
                            xtype: "tabpanel",
                            plain: true,
                            activeTab: 0,
                            height: 335,
                            deferredRender: false,  
                            defaults: {bodyStyle: "padding:10px"},
                            items: [
                                {
                                    title: "เจ้าหน้าผู้ลงนามเอกสาร",
                                    iconCls: "icon-vcard",
                                    id: 'step_sign_doc',
                                    items: grid,
                                    layout: 'fit'
                                },
                                {
                                    title: "ตั้งค่าและนำเข้าเอกสาร",
                                    layout: "form", iconCls: "icon-download",
                                    defaults: {width: 230},
                                    defaultType: "textfield",
                                    autoScroll:true,
                                    html: '<iframe src="../upload/signature.php" frameborder="0" width="100%" height="100%"></iframe>',
                                    //Ext.getCmp("dis1ID").update('<iframe src="/reports/Rep_RepBgProType2_1.php" frameborder="0" width="100%" height="100%"></iframe>');
                                    items: [
                                        {
                                            fieldLabel: "filename",
                                            name: "filename",
                                            id: "filenameID",
                                            
                                        },
                                        {
                                            fieldLabel: "โฟลเดอร์จัดเก็บเอกสาร",
                                            name: "foldername",
                                            id: "foldernameID", 
                                            value:Ext.session.bg_year,
                                        },
                                        {
                                            fieldLabel: "ลงนามเอกสารหน้า",
                                            name: "showPages",
                                            emptyText:'1,2'
                                        },{
                                            
                                        }
                                    ],
                                },
                                {
//                        layout: "form",
                                    iconCls: "icon-pdf",
                                    title: "ข้อความในเอกสารที่จะลงนาม",
                                    layout: "fit",
                                    items: {
                                        xtype: "htmleditor",
                                        id: "bio2",
                                        fieldLabel: "Biography",
                                    },
                                },
                            ],
                        }]
                }]}];


    formAdd.superclass.constructor.call(this, {
        region: "center",
        title: "ข้อมูล " + Ext.title,
        iconCls: "icon-application-form-add",
        id: "frm-Add",
        border: false,
        stripeRows: true,
        loadMask: true,
        listeners: {
            afterrender: function (obj, eOpts) {

                Ext.getCmp("form-widgets").on('render', function () {

                    Ext.getCmp("form-widgets").getForm().items.each(function (field) {

                        field.on('blur', function (f) {
                            if (Ext.rec && f.name) {
                                Ext.rec.set(f.name, f.getValue());
                            }
                            Ext.example.msg("แจ้งเตือน", f.getValue(), 3);
                        });

                    });
                });



            }
        },
        items: [
            {
                xtype: "form",
                id: "form-widgets",
                frame: true,
                labelAlign: "right",
                labelWidth: 200,
                bodyStyle: {padding: "10px 20px"},
//        defaults: { anchor: "100%", msgTarget: "side", allowBlank: false, },
                defaults: {labelStyle: "width:200px;", allowBlank: true},

                items: Ext.sing_stemp_doc,
                buttonAlign: "left",
                buttons: [{
                        text: "&nbsp;บันทึกชั่วคราว&nbsp;",
                        id: "priviewHdr",
                        iconCls: "icon-script-save",
                        handler: function (f) { 
                            Ext.getCmp("form-widgets").getForm().items.each(function (field) {
                                if (Ext.rec && f.name) {
                                    Ext.rec.set(f.name, f.getValue()); 
                                }
                                Ext.getCmp("form-widgets").getForm().loadRecord(Ext.rec);
                            }); 
                            
 

                        },

                    },
                    {
                        text: "&nbsp;" + Ext.GLOBAL_BU_SAVE_TH + "&nbsp;",
                        id: "saveHdr",
                        iconCls: "icon-save",
                        disabled: Ext.butt == "ADD" || Ext.butt == "EDIT" ? false : true,
                        handler: function () {
                            Ext.getCmp("tabpanel1").getSelectionModel().clearSelections();
                            console.log(Ext.getCmp('frm-Add'));


                            //            Ext.getCmp("form-widgets").getForm().loadRecord(rec);
                            return false;
                            saveHdr(false);
                        }
                    },
                    {
                        text: Ext.GLOBAL_BU_BACK_TH, iconCls: "icon-back",
                        handler: function () {
                            Ext.getCmp("contenterCenter").remove(Ext.getCmp("frm-Add"), true) || {};
                        }
                    }
                ],

            }
        ]
    });
}; // formAdd
Ext.extend(formAdd, Ext.Panel, {});
