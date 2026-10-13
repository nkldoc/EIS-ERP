//Function
function controllTab(record, butt) {
    
    Ext.getCmp("contenterCenter").remove(Ext.getCmp("frm-Add"), true) || {}; //null obj not errer

    if (butt == "add") {
         Ext.DC_COST_ID = 38;
        var frmAdd = new formAdd();
        Ext.getCmp("contenterCenter").add(frmAdd);
        Ext.getCmp("contenterCenter").setActiveTab(frmAdd);
        Ext.getCmp("dc_cost_idID_Name").setValue(Ext.util.Cookies.get("dc_cost_name"));
        Ext.getCmp("dc_cost_idID").setValue(Ext.util.Cookies.get("dc_cost_id"));
        DisbledButton(false);
    } else if (butt == "edit" || butt == "view") {
        
        Ext.DC_COST_ID = record.data.dc_cost_id ;
        var frmAdd = new formAdd();
        Ext.getCmp("contenterCenter").add(frmAdd);
        Ext.getCmp("contenterCenter").setActiveTab(frmAdd);
        frmAdd.getForm("form-widgets").loadRecord(record);
        Ext.getCmp("dc_title_idID").fn();

        Ext.getCmp("frm-mode").setValue("EDIT");

        if (butt == "view")
            DisbledButton(true);
        else
            DisbledButton(false);
    } else if (butt == "remove") {
        var win = new Ext.Window({
            id: "win-msg-delete",
            title: "Remove",
            modal: true,
            width: 250,
            height: 130,
            html: "ท่านต้องการที่จะลบข้อมูล ?",
            buttons: [
                {
                    text: "Confirm",
                    handler: function () {
                        Ext.Ajax.request({
                            url: "api/mnSpEmp.php",
                            params: {
                                mode: "DELETE",
                                id: record.get("id"),
                            },
                            method: "GET", //POST
                            success: function (result, request) {
                                var jsonData = Ext.util.JSON.decode(result.responseText); //decode json
                                if (jsonData.success) {
                                } else {
                                    Ext.MessageBox.alert("Failed", jsonData.msg); // alert massage error
                                }
                                Ext.getCmp("win-msg-delete").hide(); // hidden window-panel
                                Ext.getCmp("win-msg-delete").destroy(); // clear memory :: garbage collection
                                Ext.getCmp("tabpanel1").getStore().reload();
                            },
                            failure: function (result, request) {
                                Ext.MessageBox.alert("Failed", result.responseText); // connect error
                            },
                        });
                    },
                },
                {
                    text: "Cancel",
                    handler: function () {
                        Ext.getCmp("win-msg-delete").hide();
                        Ext.getCmp("win-msg-delete").destroy();
                        Ext.getCmp("tabpanel1").getStore().reload();
                    },
                },
            ],
        }).show();
    }
}

function cellClick(grid, rowIndex, columnIndex, e) {
    var record = grid.getStore().getAt(rowIndex);
    if (columnIndex == grid.getColumnModel().getIndexById("edit")) {
        controllTab(record, "edit");
    } else if (columnIndex == grid.getColumnModel().getIndexById("view")) {
        controllTab(record, "view");
    } else if (columnIndex == grid.getColumnModel().getIndexById("remove")) {
        controllTab(record, "remove");
    }
}

function DisbledButton(t) {
    //Disabled etc...
    if (t) {
        Ext.getCmp("buSaveID").hide();
    } else {
        Ext.getCmp("buSaveID").show();
    }
}

function getComboDisplay(combo) {
    var value = combo.getValue();
    var valueField = combo.valueField;
    var record;
    combo.getStore().each(function (r) {
        if (r.data[valueField] == value) {
            record = r;
            return false;
        }
    });
    return record ? record.get(combo.displayField) : null;
}

//Class Extend
formAdd = function () {
    formAdd.superclass.constructor.call(this, {
        id: "frm-Add",
        url: "api/mnSpEmp.php",
        frame: true,
        bodyStyle: "padding:0px",
        autoScroll: true,
        loadMask: true,
        width: 700,
        labelWidth: 180,
        defaults: {flex: 1},
        title: "ข้อมูลพนักงาน",
        listeners: {
            afterrender: function () {
                //    console.log(Ext.util.Cookies.get('dc_cost_id'));
            },
        },
        items: [
            {
                id: "frm-mode",
                xtype: "hidden",
                name: "mode",
                value: "ADD",
                readOnly: true,
            },
            {
                xtype: "hidden",
                name: "id",
            },
            {
                fieldLabel: "รหัสพนักงาน",
                xtype: "textfield",
                name: "c_code",
                width: 200,
                validator: function (val) {
                    if (!Ext.isEmpty(val)) {
                        return true;
                    } else {
                        return "กรุณาระบุ รหัสพนักงาน";
                    }
                },
            },
            {
                xtype: "combo",
                fieldLabel: "คำนำหน้า",
                id: "dc_title_idID",
                store: Ext.storeDcTitle,
                /* anchor: '40%', */
                width: 200,
                valueField: "id",
                displayField: "c_name",
                submitValue: true,
                hiddenName: "dc_title_id",
                mode: "local",
                triggerAction: "all",
                emptyText: "--- คำนำหน้า ---",
                forceSelection: true,
                selectOnFocus: true,
                validator: function (val) {
                    if (!Ext.isEmpty(val)) {
                        return true;
                    } else {
                        return "กรุณาเลือกคำนำหน้า";
                    }
                },
                listeners: {
                    afterrender: function () {
                        this.fn = function () {
                            var c_title_name = getComboDisplay(this);
                            Ext.getCmp("frm-c_title").setValue(c_title_name);
                        };
                        this.fn();
                    },
                    select: function (combo, record, index) {
                        this.fn();
                    },
                },
            },
            {
                xtype: "hidden",
                id: "frm-c_title",
                name: "c_title",
            },
            {
                xtype: "textfield",
                fieldLabel: "ชื่อ-นามสกุล",
                name: "c_name",
                width: 300,
                validator: function (val) {
                    if (!Ext.isEmpty(val)) {
                        return true;
                    } else {
                        return "กรุณาระบุ ชื่อ-นามสกุล";
                    }
                },
            },
            {
                fieldLabel: "เลขที่บัตรประจำตัวประชาชน",
                xtype: "radiogroup",
                columns: [300, 300],
                items: [
                    {
                        fieldLabel: "",
                        xtype: "textfield",
                        name: "c_ref_value",
                        /*validator: function (val) {
                         var regex = /^([0-9]+|[0-9]{1,3})?$/;
                         if (!regex.test(val)) {
                         return "กรุณากรอก เลขที่บัตรประจำตัวประชาชน เป็นตัวเลขจำนวนเต็มเท่านั้น";
                         } else if (val.length != 13) {
                         return "กรุณากรอก เลขที่บัตรประจำตัวประชาชน เป็นตัวเลข 13 หลัก";
                         } else {
                         return true;
                         }
                         }*/
                    },
                    {xtype: "displayfield", value: " บันทึกเป็นตัวเลข 13 หลักและไม่มีเครื่องหมาย -", cls: "txtBlue"},
                ],
            },
            {
                fieldLabel: "เลขประจำตัวผู้เสียภาษีอากร",
                xtype: "radiogroup",
                columns: [300, 300],
                items: [
                    {
                        fieldLabel: "",
                        xtype: "textfield",
                        name: "c_tax_value",
                    },
                    {xtype: "displayfield", value: " บันทึกเป็นตัวเลข 10 หลักและไม่มีเครื่องหมาย -", cls: "txtBlue"},
                ],
            },
            {
                xtype: "textfield",
                fieldLabel: "ที่อยู่",
                name: "c_address",
                width: 600,
                //                 validator: function (val) {
                //                     if (!Ext.isEmpty(val)) {
                //                         return true;
                //                     } else {
                //                         return "กรุณาระบุ ที่อยู่ ";
                //                     }
                //                 }
            },
            {
                xtype: "textfield",
                fieldLabel: "ที่อยู่ตามบัตรประชาชน",
                name: "c_address_card",
                width: 600,
                //                 validator: function (val) {
                //                     if (!Ext.isEmpty(val)) {
                //                         return true;
                //                     } else {
                //                         return "กรุณาระบุ ที่อยู่ตามบัตรประชาชน ";
                //                     }
                //                 }
            },
            {
                xtype: "textfield",
                fieldLabel: "หมายเลขโทรศัพท์",
                name: "c_tel_home",
                width: 200,
                validator: function (val) {
                    return true;
                },
            },
            {
                xtype: "textfield",
                fieldLabel: "เบอร์โทรศัพท์ office",
                name: "c_tel_office",
                width: 200,
                validator: function (val) {
                    return true;
                },
            },
            {
                xtype: "textfield",
                fieldLabel: "หมายเลขโทรศัพท์มือถือ",
                name: "c_mobile",
                width: 200,
                validator: function (val) {
                    return true;
                },
            },
            {
                xtype: "textfield",
                fieldLabel: "E-mail",
                name: "c_email",
                width: 600,
                validator: function (val) {
                    return true;
                },
            },
            {
                xtype: "datefield",
                name: "d_birth",
                fieldLabel: "เกิดวันที่",
                width: 150,
            },
            {
                xtype: "datefield",
                name: "d_begin",
                fieldLabel: "วัน/เดือน/ปี เข้างาน",
                width: 150,
            },
            {
                xtype: "datefield",
                name: "d_resign",
                fieldLabel: "วัน/เดือน/ปี ที่ออกงาน",
                width: 150,
            },
            Ext.PopCostForm.mini, //PopCntForm
            {
                bodyStyle: "padding-right:5px;",
                items: {
                    xtype: "fieldset",
                    title: "ระดับการของการทำงาน",
                    id: "leGroupID",
                    autoHeight: true,
                    items: [
                        {
                            xtype: "radiogroup",
                            columns: 1,
                            vertical: true,
                            id: "i_levelID",
                            items: [
                                {
                                    fieldLabel: "",
                                    boxLabel: "หัวหน้าหน่วยงาน",
                                    name: "i_level",
                                    inputValue: 1,
                                },
                                {
                                    fieldLabel: "",
                                    labelSeparator: "",
                                    boxLabel: "หัวหน้าฝ่าย/สายงาน",
                                    name: "i_level",
                                    inputValue: 2,
                                },
                                {
                                    fieldLabel: "",
                                    labelSeparator: "",
                                    checked: true,
                                    boxLabel: "ผู้ปฏิบัติงาน",
                                    name: "i_level",
                                    inputValue: 3,
                                },
                            ],
                            listeners: {
                                change: function () {
                                    if (Ext.getCmp("i_levelID").getValue().inputValue != 3) {
                                   //     Ext.getCmp("dePopID").hide();
                                    } else if (Ext.getCmp("i_levelID").getValue().inputValue == 1) {
                                  //      Ext.getCmp("dePopID").hide();
                                    } else {
                                   //     Ext.getCmp("dePopID").show();
                                    }
                                },
                                afterender: function () {
                                    Ext.getCmp("i_levelID").fnLevel = function (a) {
                                        if (a != 3) {
                                     //       Ext.getCmp("dePopID").hide();
                                        } else {
                                    //        Ext.getCmp("dePopID").show();
                                        }
                                        //let sto = Ext.getCmp("tabpanel1").store.data.items;
                                    };
                                },
                            },
                        },
                    ],
                    listeners: {
                        afterrender: function () {
                            // if (Ext.util.Cookies.get("dc_cost_id") == 38) this.show();
                            // else this.hide();
                            if (Ext.DC_COST_ID == 38)
                                this.show();
                            else
                                this.hide();
                            let sto = Ext.getCmp("tabpanel1").store.data.items;
                            //  console.log();
                        },
                    },
                },
            },
            {
                bodyStyle: "padding-right:5px;",
                id: "groupFieldDempartID",
                items: [
                    {
                        xtype: "fieldset",
                        title: "แผนก",
                        id: "deGroupID",
                        autoHeight: true,
                        items: {
                            xtype: "radiogroup",
                            columns: 1,
                            vertical: true,
                            id: "dc_department_idID",
                            items: [
                                {
                                    checked: true,
                                    fieldLabel: "",
                                    boxLabel: "หัวหน้าฝ่าย",
                                    name: "dc_department_id",
                                    inputValue: 1,
                                },
                                {
                                    fieldLabel: "",
                                    labelSeparator: "",
                                    boxLabel: "จัดซื้อจัดจ้าง1",
                                    name: "dc_department_id",
                                    inputValue: 2,
                                },
                                {
                                    fieldLabel: "",
                                    labelSeparator: "",
                                    boxLabel: "จัดซื้อจัดจ้าง2",
                                    name: "dc_department_id",
                                    inputValue: 3,
                                    
                                },
                                {
                                    fieldLabel: "",
                                    labelSeparator: "",
                                    boxLabel: "จัดซื้อจัดจ้าง3",
                                    name: "dc_department_id",
                                    inputValue: 8,
                                },
                                {
                                    fieldLabel: "",
                                    labelSeparator: "",
                                    boxLabel: "เบิกจ่าย",
                                    name: "dc_department_id",
                                    inputValue: 4,
                                },
                                {
                                    fieldLabel: "",
                                    labelSeparator: "",
                                    boxLabel: "ธุรการ",
                                    name: "dc_department_id",
                                    inputValue: 5,
                                },
                                {
                                    fieldLabel: "",
                                    labelSeparator: "",
                                    boxLabel: "ทรัพย์สิน",
                                    name: "dc_department_id",
                                    inputValue: 6,
                                },
                                {
                                    fieldLabel: "",
                                    labelSeparator: "",
                                    boxLabel: "คลังพัสดุ",
                                    name: "dc_department_id",
                                    inputValue: 7, 
         
                                },
                            ],
                           /* listeners: {
                                afterrender: function () {
                                    this.fn = function (a) {
                                        if (a == 8) {
                                          //  Ext.getCmp("dePopID").show();
                                            Ext.storeDepartment.setBaseParam("dc_department_type_id", a);
                                        } else {
                                         //   Ext.getCmp("dePopID").hide();
                                        }
                                    };
                                    this.fn(this.getValue().inputValue);
                                },
                                Change: function () {
                                    //                                     Ext.getCmp('dc_department_idID_Name').setValue(null);
                                    //                                     Ext.getCmp('dc_department_idID').setValue(null);
                                    this.fn(this.getValue().inputValue);
                                },
                            },*/
                        },
                        listeners: {
                            afterrender: function () {
                                if (Ext.DC_COST_ID == 38)
                                    this.show();
                                else
                                    this.hide();
                                // if (Ext.util.Cookies.get("dc_cost_id") == 38) this.show();
                                // else this.hide();
                            },
                        },
                    },
                ],
            },
            {
//                bodyStyle: "padding-right:5px;",
//                items: {
//                    xtype: "fieldset",
//                    title: "ฝ่าย/ส่วน งาน",
//                    id: "dePopID",
//                    autoHeight: true,
//                    defaultType: "radio", // each item will be a checkbox สายงานธุรการ  สายงานเบิกจ่าย  สายงานคลังพัสดุ dc_department_type_id
//                    items: Ext.PopDepartmentForm.mini,
//                    listeners: {
//                        afterrender: function () {
//                            this.fn = function () {
//                                if (Ext.getCmp("dc_cost_idID").getValue() == 38 && Ext.getCmp("i_levelID").getValue() == 3 && Ext.getCmp("dc_department_type_idID").getValue() == 8)
//                                    this.show();
//                                else
//                                    this.hide();
//                            };
//                            this.fn();
//                        },
//                    },
//                },
//            },
//            {
                xtype: "textarea",
                fieldLabel: "หมายเหตุ",
                name: "c_comment",
                width: 600,
            },
            {
                fieldLabel: "สถานะการใช้งาน",
                xtype: "radiogroup",
                columns: [120, 100],
                items: [
                    {boxLabel: "ใช้งาน", checked: true, name: "i_enable", inputValue: Ext.CONF_STATUS_ENABLE},
                    {boxLabel: "ไม่ใช้งาน", name: "i_enable", inputValue: Ext.CONF_STATUS_DISABLE},
                ],
            },
        ],

        buttonAlign: "left",
        buttons: [
            {
                text: "บันทึกรายการ",
                id: "buSaveID",
                iconCls: "icon-save",
                listeners: {
                    afterrender: function () {
                        /* if(Ext.getCmp('c_area_codeEditDisID').getValue()!='0'){
                         
                         Ext.getCmp('modeEditID').setValue('GENCODE2');
                         }else{
                         Ext.getCmp('modeEditID').setValue('GENCODE');
                         } */
                    },
                },
                handler: function () {
                    var form = Ext.getCmp("frm-Add").getForm();
                    if (form.isValid()) {
                        form.submit({
                            waitMsg: "Saving Data...",
                            success: function (form, action) {
                                Ext.Msg.alert("Success", action.result.msg, function () {
                                    Ext.getCmp("contenterCenter").remove(Ext.getCmp("frm-Add"), true) || {}; //null obj not errer
                                    Ext.store.reload();
                                });
                            },
                            failure: function (form, action) {
                                switch (action.failureType) {
                                    case Ext.form.Action.CLIENT_INVALID:
                                        Ext.Msg.alert("Failure", "Form fields may not be submitted with invalid values");
                                        break;
                                    case Ext.form.Action.CONNECT_FAILURE:
                                        Ext.Msg.alert("Failure", "พลข้อผิดพลาดในการเชื่อต่อเครือข่าย");
                                        break;
                                    case Ext.form.Action.SERVER_INVALID:
                                        Ext.Msg.alert("Failure", action.result.msg);
                                }
                            },
                        });
                    }
                },
            },
            {
                text: Ext.GLOBAL_BU_BACK_TH,
                handler: function () {
                    Ext.getCmp("contenterCenter").setActiveTab("tabpanel1");
                },
            },
        ],
    });
};
Ext.extend(formAdd, Ext.FormPanel, {});

searchGrid = function () {
    var cmbFilters = {
        xtype: "combo",
        id: "filter-ID",
        store: new Ext.data.SimpleStore({
            fields: ["id", "c_name"],
            data: [
                ["c_name", "ชื่อ-นามสกุล"],
                ["c_code", "รหัสพนักงาน"],
                ["emp_code", "เลขที่นำหน้าสัญญา"],
                ["dc_cost_name", "หน่วยงาน"],
            ],
        }),
        value: "c_name",
        valueField: "id",
        displayField: "c_name",
        submitValue: true,
        hiddenName: "filter",
        mode: "local",
        triggerAction: "all",
        forceSelection: true,
        selectOnFocus: true,
        editable: false,
        listeners: {
            select: function (combo, record, index) {
                var newValue = record.data.id;
            },
        },
    };
    Ext.fieldsetID = false;

    //classOverride
    searchGrid.superclass.constructor.call(this, {
        initComponent: function () {
            searchGrid.superclass.initComponent.call(this);

            this.fn(this);
            /*console.log('Loading...');*/
        },
        listeners: {
            afterrender: function (obj, eOpts) {
                /*console.log('Load Finish');*/
            },
        },
        fn: function () {},
        id: "frm-grid-searchID",
        frame: true,
        bodyStyle: "padding:2px",
        autoHeight: true,
        width: 730,
        labelWidth: 180,
        defaults: {
            anchor: "0",
        },
        items: [
            {
                xtype: "compositefield",
                fieldLabel: "คำที่ค้นหา",
                msgTarget: "side",
                anchor: "-10",
                defaults: {flex: 1},
                items: [
                    {
                        xtype: "textfield",
                        id: "val-ID",
                        name: "value",
                    },
                    cmbFilters,
                ],
            },
        ],
        buttonAlign: "left",
        buttons: [
            {
//                text: "เพิ่มข้อมูล",
//                id: "buAdd",
//                iconCls: "icon-add",
//                handler: function (grid, rowIndex, colIndex) {
//                    controllTab({}, "add");
//                },
//            },
//            {
                xtype: "tbfill",
            },
            {
                text: "ค้นหา",
                id: "buSearchID",
                iconCls: "icon-magnifier",
                handler: function () {
                    Ext.store.setBaseParam("mode", "SEARCH");
                    Ext.store.setBaseParam("filter", Ext.getCmp("filter-ID").getValue());
                    Ext.store.setBaseParam("value", Ext.getCmp("val-ID").getValue());
                    Ext.getCmp("tabpanel1").getStore().load();
                },
            },
            {
                text: "เริ่มใหม",
                iconCls: "icon-reset",
                handler: function () {
                    Ext.getCmp("frm-grid-searchID").getForm().reset();
                },
            },
        ],
    });
};
Ext.extend(searchGrid, Ext.FormPanel, {});

//store
Ext.store = new Ext.data.JsonStore({
    storeId: "myStore",
    autoDestroy: true,
    autoLoad: true,
    url: "api/ListSpEmp.php",
    root: "data",
    baseParams: {i_read: user_right_read}, //Permission i_read
    idProperty: "id",
    totalProperty: "totalCount",
    fields: [
        {name: "no"},
        {name: "id"},
        {name: "dc_cost_id"},
        {name: "txtdc_cost_idID"},
        {name: "txtdc_department_type_idID"},
        {name: "dc_department_type_id"},
        {name: "dc_department_id"},
        {name: "txtdc_department_idID"},
        {name: "txti_levelID"},
        {name: "i_level"},
        {name: "i_seq"},
        //  txtdc_department_type_idID txtdc_department_idID txti_levelID
        {name: "dc_title_id"},
        {name: "c_code"},
        {name: "c_title"},
        {name: "c_name"},
        {name: "c_full_name"},
        {name: "c_ref_value"},
        {name: "c_tax_value"},
        {name: "c_tel_home"},
        {name: "c_tel_office"},
        {name: "c_mobile"},
        {name: "c_email"},
        {name: "c_address"},
        {name: "c_address_card"},
        {name: "c_comment"},
        {name: "d_birth"},
        {name: "d_begin"},
        {name: "d_resign"},
        {name: "i_enable"},
        {name: "dc_user_create_id"},
        {name: "dc_user_create_cost_id"},
        {name: "d_create"},
        {name: "dc_user_update_id"},
        {name: "dc_user_update_cost_id"},
        {name: "d_update"},
        {name: "emp_code"},
    ],
});

Ext.storeDcTitle = new Ext.data.JsonStore({
    //autoDestroy: true,
    autoLoad: true,
    url: "api/All_DcCombo.php",
    baseParams: {type: "storeTitle"},
    root: "data",
    idProperty: "id",
    fields: ["id", "c_name"],
});
Ext.storeDepartment = new Ext.data.JsonStore({
    storeId: "storeDepartment",
    autoLoad: true,
    url: "api/All.php",
    root: "data",
    baseParams: {type: "storeSpEmp", start: 0, limit: 20, mode: null}, //Permission i_read
    idProperty: "id",
    totalProperty: "totalCount",
    fields: ["id", "c_code", "c_name"],
    //  fields: ['id', 'c_code', 'c_name', 'TextShow', 'dc_department_type_id', 'i_level', 'i_parent', 'c_department']
});

Ext.storeDcDepartmentType = new Ext.data.JsonStore({
    //autoDestroy: true,
    autoLoad: true,
    url: "api/All_DcCombo.php",
    baseParams: {type: "storeDepType"},
    root: "data",
    idProperty: "id",
    fields: ["id", "c_name"],
});
/*
 Ext.storeDepartment = new Ext.data.JsonStore({
 storeId: 'storeCost',
 autoLoad: true,
 url: 'api/All_DcCombo.php',
 root: 'data',
 baseParams: {type: 'storeDepartment', dc_department_type_id: 1}, //Permission i_read
 idProperty: 'id',
 totalProperty: 'totalCount',
 fields: ['id', 'c_code', 'c_name', 'dc_department_type_id', 'i_level', 'i_parent', 'c_department']
 });
 */
Ext.storeCost = new Ext.data.JsonStore({
    storeId: "storeCost",
    autoLoad: true,
    url: "api/All_DcCombo.php",
    root: "data",
    baseParams: {type: "storeCost"}, //Permission i_read
    idProperty: "id",
    totalProperty: "totalCount",
    fields: ["id", "c_code", "c_name"],
});
//PopLove
var columnMini = [
    {header: "ID System", sortable: true, hidden: true, dataIndex: "id"},
    {header: "รหัส", sortable: true, dataIndex: "c_code"},
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
Ext.PopCostForm = new Ext.ux.Poplov({
    text: "หน่วยงาน",
    id: "dc_cost_idID", //go to relation
    name: "txtdc_cost_idID", //go to relation
    iconCls: "page_magnify",
    valueHidden: "dc_cost_id", //go to hidden
    store: Ext.storeCost,
    headerGrid: columnMini,
    widthText: 330,
    fieldLabel: "หน่วยงาน",
    isCellClickGrid: true,
    cellClickGrid: function (grid, rowIndex, columnIndex, e) {
        var id = "dc_cost_idID";
        var nameID = id + "_Name";
        var record = grid.getStore().getAt(rowIndex);

        var TextShow = record.data.c_code + " " + record.data.c_name;

        Ext.getCmp(id).setValue(record.data.id);
        Ext.getCmp(nameID).setValue(TextShow);
        Ext.getCmp("win-pop-lov" + id).hide();
        Ext.getCmp("win-pop-lov" + id).destroy();
        if (record.data.id == 38) {
            //supplies พัสดุ
            Ext.getCmp("deGroupID").show();
           // Ext.getCmp("dePopID").show();
            Ext.getCmp("leGroupID").show();
            Ext.getCmp("dc_cost_idID").show();
        } else {
            Ext.getCmp("deGroupID").hide();
            Ext.getCmp("leGroupID").hide();
           // Ext.getCmp("dePopID").hide();
            Ext.getCmp("dc_cost_idID").hide();
        }
        Ext.util.Cookies.set("dc_cost_name", TextShow);
        Ext.util.Cookies.set("dc_cost_id", record.data.id);
    },
});
/*
Ext.PopDepartmentForm = new Ext.ux.Poplov({
    text: "ฝ่าย/ส่วน งาน",
    id: "dc_department_idID", //go to relation
    iconCls: "page_magnify",
    valueHidden: "dc_department_id", //go to hidden
    store: Ext.storeDepartment,
    headerGrid: columnMini,
    widthText: 280,
    fieldLabel: "หัวหน้า/สายงาน",
    isCellClickGrid: true,
    listeners: {
        afterrender: function () {
            //  console.log(this);
        },
    },
    cellClickGrid: function (grid, rowIndex, columnIndex, e) {
        var id = "dc_department_idID";
        var nameID = id + "_Name";
        var record = grid.getStore().getAt(rowIndex);

        var TextShow = record.data.c_code + " " + record.data.c_name;

        Ext.getCmp(id).setValue(record.data.id);
        Ext.getCmp(nameID).setValue(TextShow);
        Ext.getCmp("win-pop-lov" + id).hide();
        Ext.getCmp("win-pop-lov" + id).destroy();

        Ext.util.Cookies.set("dc_department_name", TextShow);
        Ext.util.Cookies.set("dc_department_id", record.data.id);
    },
});
*/
//OnLoad
Ext.onReady(function () {
    Ext.QuickTips.init();
    var gridMain = {
        region: "center",
        title: "แสดงข้อมูลพนักงาน",
        xtype: "grid",
        id: "tabpanel1",
        border: false,
        stripeRows: true,
        loadMask: true,
        store: Ext.store,
        tbar: [new searchGrid()],
        columns: [
            new Ext.grid.RowNumberer({
                width: 35,
                header: " No ",
                renderer: function (value, metaData, record, row, col, store, gridView) {
                    return record.get("no");
                },
            }),
            {header: "ID System", sortable: true, hidden: true, dataIndex: "id"},
            {
                header: "รหัสพนักงาน",
                sortable: true,
                dataIndex: "c_code",
                renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                    metaData.attr = "align='center'";
                    return value;
                },
            },
            {id: "c_name", header: "ชื่อ-นามสกุล", width: 210, sortable: true, dataIndex: "c_full_name"},
            {id: "emp_code", header: "เลขที่นำหน้าสัญญา", width: 120,align:"center", sortable: true, dataIndex: "emp_code"},
            /*{id: 'c_department_type', header: "แผนก", width: 210, sortable: true, dataIndex: 'txtdc_department_type_idID',
             renderer: function (value, metaData, record, row, col, store, gridView) {
             return value != null ? value : '';
             }
             },*/
            {id: "c_department", header: "สายงาน", width: 210, sortable: true, dataIndex: "txtdc_department_idID"},
            {id: "c_position", header: "ระดับการทำงาน", width: 210, sortable: true, dataIndex: "txti_levelID"},
            {
                header: "Status",
                sortable: false,
                align: "center",
                renderer: function (value, metaData, record, row, col, store, gridView) {
                    var i_enable = record.get("i_enable");
                    if (parseInt(i_enable) === parseInt(Ext.CONF_STATUS_ENABLE)) {
                        return '<img src="../images/icons/yes.gif");/>';
                    } else {
                        return '<img src="../images/icons/no.gif");/>';
                    }
                },
            },
        ],
        //		autoExpandColumn: 'c_name',
        bbar: new Ext.PagingToolbar({
            pageSize: 20,
            store: Ext.store,
            displayInfo: true,
            displayMsg: "Displaying topics {0} - {1} of {2}",
        }),
    };

    new Ext.Viewport({
        layout: "border",
        items: [
            new Ext.TabPanel({
                region: "center",
                border: false,
                id: "contenterCenter",
                defaults: {autoScroll: true},
                items: [gridMain],
            }),
        ],
    });
    Ext.getCmp("contenterCenter").setActiveTab("tabpanel1");
    Ext.getCmp("tabpanel1").on("cellclick", cellClick, this);
    InfoMainGrid("tabpanel1", true, true, true, true, true, true);
    //   console.log(Ext.util.Cookies.get('dc_cost_name'));
});
