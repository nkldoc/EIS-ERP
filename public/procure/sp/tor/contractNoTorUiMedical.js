/* global Ext, user_right_add, user_right_edit, user_right_delete */
Ext.runStatus = function (menu) {
    return Ext.apply({
        name: menu,
        process: function (menuCode, record) {
            Ext.Ajax.request({
                url: "tor/api/mnContractNoTor.php",
                params: {
                    mode: "UPDATENEXTSTEP",
                    menuCode: 'ST0009',
                    tor_status_id: 21, //record.get('tor_status_id'),
                    tor_type_id: record.get('tor_status_id'),
                    i_is_more: 1,
                    i_contract_status : 1,
                    typeItems: 3,
                    i_entrance: 3,
                    id: record.get("id"),
                },
                /*	mode: UPDATENEXTSTEP
                 menuCode: ST0009
                 tor_status_id: 20
                 tor_type_id: 3
                 i_is_more: 1
                 typeItems: 3
                 i_entrance: 3
                 id: 20097
                 ==========================
                 mode: UPDATENEXTSTEP
                 menuCode: ST00099
                 tor_status_id: 
                 tor_type_id: 1
                 i_is_more: 1
                 typeItems: 3
                 i_entrance: 3
                 id: 20122*/
                method: "POST", //GETfieldLable
                success: function (result, request) {
                    var jsonData = Ext.util.JSON.decode(result.responseText); //decode json
                    if (jsonData.success) {
                        Ext.MessageBox.alert("Success", jsonData.msg, function () {
                            Ext.getCmp("tabpanel1").getStore().reload();
                            Ext.getCmp("win-processID").hide(); // hidden window-panel
                            Ext.getCmp("win-processID").destroy(); // clear memory :: garbage collection
                        });
                    } else {
                        Ext.MessageBox.alert("Failed", jsonData.msg); // alert massage error
                    }
                },
                failure: function (result, request) {
                    Ext.MessageBox.alert("Failed", result.responseText); // connect error
                },
            });
        },
    });
};
Ext.AppConfig = function () {
    Ext.user_right_add = user_right_add;
    Ext.user_right_edit = user_right_edit;
    Ext.user_right_delete = user_right_delete;
    Ext.title = Ext.menu_name + " " + Ext.menu_code;
    Ext.typeItems = Ext.menu_i_config;
    //Ext.menu_i_entrance;
    Ext.HDR_ID = null;
    Ext.selectRow = [];
    Ext.selectRowCopy = [];
    Ext.menuEditGrid = true;
    Ext.menuRightEditgrid = true;
    Ext.tor_type_id = 1; // default start เจาะจงน้อวกว่า 5 แสน
    Ext.i_is_more = 0;
    Ext.tor_type_idTxt = Ext.apply({
        tor_type_id1: {
            0: "แบบมี หัวงาน/ฝ่ายพิจารณาผล(ไม่เกิน 5 แสนบาท)",
            1: "แบบมีคณะกรรมการพิจารณาผล(เกิน 5 แสนบาท)",
        },
    });
    Ext.buAct = null;
    Ext.yearTh = function () {
        let years = [];
        let currentTime = new Date();
        let now = currentTime.getFullYear() + 1;
        let id = currentTime.getFullYear() - 3;
        while (id <= now) {
            let c_name = id + 543;
            years.push({
                id,
                c_name,
            });
            id++;
        }

        let Date_now = new Date();
        Date_now = Date_now.toISOString().split("T")[0].split("-");
        Ext.bgYear = Date_now[0] - 0 + ((Date_now[1] < 10 ? 0 : 1) - 0);
        return years;
    };
    DeleteNoTor_dtl = function (record) {

        if (record.get('c_code') === null) {
//            console.log(record.get('c_code'));
//        return false; 
        /*sp_tor_contract_id: 9
         sp_tor_id: 10*/

        new Ext.Window({
            id: "win-msg-delete",
            title: "Remove",
            modal: true,
            width: 250,
            height: 130,
            html: "ท่านต้องการที่จะลบข้อมูล แถวที่ " + record.get('no') + " ?",
            buttons: [
                {
                    text: "Confirm",
                    handler: function () {
                        Ext.Ajax.request({
                            url: "tor/api/mnContractNoTor.php",
                            params: {
                                mode: "DELETE_NOTOR_DTL",
                                sp_tor_contract_id: record.get("sp_tor_contract_id"),
                                sp_tor_id: record.get("sp_tor_id"),
                            },
                            method: "GET", //POST
                            success: function (result, request) {
                                Ext.storeDtl.load({
                                    params: {id: Ext.HDR_ID},
                                    callback: function (records, operation, success) {
                                        Ext.getCmp("win-msg-delete").destroy();
                                        Ext.storeDtl.reload();

                                    },
                                });
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
    };
    function winProcess(rec) {
        new Ext.Window({
            id: "win-processID",
            title: "บันทึกรายการสัญญา(ไม่มี TOR)",
            modal: true,
            resizable: false,
            width: 450,
            layout: "form",
            bodyStyle: "padding:3px;",
            items: [
                {
                    xtype: "displayfield",
                    fieldLabel: "ผ่านการสถานะของ",
                    value: "<b style='font-size:16px;'> " + rec.get("c_code") + " ?</b>",
                },
                {
                    xtype: "hidden",
                    name: "typeItems",
                    value: Ext.typeItems,
                },
                {
                    xtype: "radiogroup",
                    columns: [180, 180],
                    fieldLabel: "โหมดการบันทึก",
                    id: "modesubID",
                    style: {
                        "font-weight": "bold",
                    },
                    items: [
                        {
                            name: "mode",
                            checked: true,
                            inputValue: "GOTOSTEP",
                            boxLabel: "ผ่านรายการ <img src='../images/icons/accept.png'>",
                        },
                        // {
                        //     name: "mode",
                        //     inputValue: "BACKSTEP",
                        //     boxLabel: "ทักท้วง <img src='../images/icons/arrow_undo.png'>",
                        // },
                    ],
                    listeners: {
                        change: function (cb, nv, ov) {
                            if (nv)
                                Ext.getCmp("reasonID").show();
                            else
                                Ext.getCmp("reasonID").hide();
                        },
                    },
                },
                {
                    fieldLabel: "เรื่องที่ทักท้วง",
                    xtype: "textarea",
                    name: "reason",
                    width: 250,
                    id: "reasonID",
                    listeners: {
                        afterrender: function () {
                            this.hide();
                        },
                    },
                },
            ],
            buttons: [
                {
                    text: "อัพเดทผ่านสถานะรายการ",
                    iconCls: "icon-save",
                    handler: function () {
                        if (rec.get("i_is_more") == 0 && !Ext.isEmpty(Ext.menuCode1)) {
                            Ext.status.process(Ext.menuCode1, rec);
                        } else {
                            Ext.status.process(Ext.menuCode, rec);
                        }
                    },
                },
                {
                    text: Ext.GLOBAL_BU_BACK_TH,
                    iconCls: "icon-clear",
                    handler: function () {
                        Ext.getCmp("win-processID").destroy(); // clear memory :: garbage collection
                    },
                },
            ],
        }).show();
    }
    function controller(rec, status) {

        if (rec.get("c_code") == null) {
            console.log(rec);
            Ext.Msg.alert("แจ้งเตือน", "<span style='white-space: nowrap;'>กรุณาบันทึกรายการก่อนผ่านรายการ / ออกเลขสัญญา</span><br>", function (bu, action) {
                return false;
            });
        } else if (status == "processUpdate") {

            Ext.Msg.minWidth = 200;
            Ext.Msg.buttonText = {
                ok: "ตกลง",
                cancel: "ยกเลิก",
                yes: "ผ่านรายการ",
                no: "ไม่",
            };
//
//            if (rec.get("c_code") == '')
//                Ext.Msg.alert("แจ้งเตือน", "ต้องออกเลขสัญญก่อนผ่านรายการ", function (bu, action) {
//                    return false;
//                });
//            else
            winProcess(rec);
        }
    } // Controller
    function cellClick(grid, rowIndex, columnIndex, e) {
        var record = grid.getStore().getAt(rowIndex);
        Ext.selectRow = record;


        if (columnIndex === grid.getColumnModel().getIndexById("processDueID") && record.get('tor_status_id') != 21) {

            if ((Ext.selectRow.data.i_is_register == 0) || (Ext.selectRow.data.c_code == '')) {
          
                Ext.Msg.alert("แจ้งเตือน", "<span style='white-space: nowrap;'>กรุณาบันทึกรายการก่อนผ่านรายการ / ออกเลขสัญญา</span><br>", function (bu, action) {
                    return false;
                });
                return;
            }
            if (Ext.selectRow.data.tor_status_id == 11) {
                // ประกาศผลผู้ชนะ ST0007
                var count_data = new Ext.data.JsonStore({
                    autoLoad: true,
                    url: "tor/api/mnTorController.php",
                    baseParams: {mode: "TOR_VICTORY", sp_tor_id: Ext.selectRow.data.id},
                    fields: [{name: "sp_tor_contract_id"}],
                });
                if (count_data.fields.length < 1) {
                    Ext.Msg.alert("แจ้งเตือน", "รายการนี้ยังไม่ได้เพิ่มผู้ชนะ", function (bu, action) {
                        return false;
                    });
                    return;
                }
            } else if (Ext.selectRow.data.tor_status_id == 20) {
                // ร่างสัญญา ST0008
                var count_data = new Ext.data.JsonStore({
                    autoLoad: true,
                    url: "tor/api/mnTorController.php",
                    baseParams: {mode: "LISTCREDITOR", tor_id: Ext.selectRow.data.id},
                    fields: [{name: "sp_tor_contract_id"}],
                });
                if (count_data.fields.length < 1) {
                    Ext.Msg.alert("แจ้งเตือน", "รายการนี้ยังไม่ได้เพิ่มสัญญา", function (bu, action) {
                        return false;
                    });
                    return;
                }
            }
            // console.log(Ext.selectRow.data);
            controller(Ext.selectRow, "processUpdate"); //on
        }
    }
    var tab2 = new Ext.FormPanel({
        //labelAlign: 'top',
        title: "รายละเอียดของ TOR",
        bodyStyle: "padding:5px",
        layout: "fit",
        width: 600,
        items: [
            {
                height: 200,
                layout: "column",
                border: false,
                items: [
                    {
                        columnWidth: 0.5,
                        layout: "form",
                        border: true,
                        items: [
                            {
                                xtype: "textfield",
                                fieldLabel: "First Name",
                                name: "first",
                                anchor: "50%",
                            },
                            {
                                xtype: "textfield",
                                fieldLabel: "Company",
                                name: "company",
                                anchor: "50%",
                            },
                        ],
                    },
                    {
                        columnWidth: 0.5,
                        layout: "form",
                        border: true,
                        items: [
                            {
                                xtype: "textfield",
                                fieldLabel: "Last Name",
                                name: "last",
                                anchor: "50%",
                            },
                            {
                                xtype: "textfield",
                                fieldLabel: "Email",
                                name: "email",
                                vtype: "email",
                                anchor: "50%",
                            },
                        ],
                    },
                ],
                buttonAlign: "left",
                buttons: [
                    {
                        text: "Save",
                    },
                    {
                        text: "Cancel",
                    },
                ],
            },
            {
                xtype: "tabpanel",
                plain: true,
                activeTab: 0,
                height: 235,
                deferredRender: false,
                defaults: {bodyStyle: "padding:10px"},
                items: [
                    {
                        title: "Personal Details",
                        layout: "form",
                        defaults: {width: 230},
                        defaultType: "textfield",
                        items: [
                            {
                                fieldLabel: "First Name",
                                name: "first",
                                allowBlank: false,
                                value: "Jack",
                            },
                            {
                                fieldLabel: "Last Name",
                                name: "last",
                                value: "Slocum",
                            },
                            {
                                fieldLabel: "Company",
                                name: "company",
                                value: "Ext JS",
                            },
                            {
                                fieldLabel: "Email",
                                name: "email",
                                vtype: "email",
                            },
                        ],
                    },
                    {
                        title: "Phone Numbers",
                        layout: "form",
                        defaults: {width: 230},
                        defaultType: "textfield",
                        items: [
                            {
                                fieldLabel: "Home",
                                name: "home",
                                value: "(888) 555-1212",
                            },
                            {
                                fieldLabel: "Business",
                                name: "business",
                            },
                            {
                                fieldLabel: "Mobile",
                                name: "mobile",
                            },
                            {
                                fieldLabel: "Fax",
                                name: "fax",
                            },
                        ],
                    },
                    {
                        cls: "x-plain",
                        title: "Biography",
                        layout: "fit",
                        items: {
                            xtype: "htmleditor",
                            id: "bio2",
                            fieldLabel: "Biography",
                        },
                    },
                ],
            },
        ],
    });
    function SearchFrm() {
        return new Ext.Window({
            //                     collapsible: true,
            //                     maximizable: true,
            title: "ค้นหารายการสัญญา",
            width: 700,
            id: "winSearchFrm",
            height: 200,
            layout: "fit",
            //                     modal: true,
            plain: true,
            bodyStyle: "padding:5px;",
            buttonAlign: "center",
            items: [
                {
                    layout: "column",
                    border: false,
                    defauls: {background: "#eee"},
                    items: [
                        {
                            columnWidth: 0.5,
                            layout: "form",
                            border: false,
                            items: [
                                {
                                    xtype: "textfield",
                                    fieldLabel: "เลขที่สัญญา",
                                    id: "sc_codeID", // sd_tor_dateID sc_codeID sc_nameID searchEnabledID
                                    name: "c_code",
                                },
                                {
                                    xtype: "datefield",
                                    fieldLabel: "วันที่อายุสัญญา",
                                    id: "sd_due_date1ID",
                                    name: "d_due_date1",
                                },
                                {
                                    xtype: "datefield",
                                    fieldLabel: "ถึง วันที่อายุสัญญา",
                                    id: "sd_due_date2ID",
                                    name: "d_due_date2",
                                },
                            ],
                        },
                        {
                            columnWidth: 0.5,
                            layout: "form",
                            border: false,
                            items: [
                                {
                                    xtype: "textfield",
                                    fieldLabel: "เรื่อง/โครงการ",
                                    id: "sc_nameID",
                                    name: "c_name",
                                },
                                new Ext.form.ComboBox({
                                    mode: "local",
                                    store: new Ext.data.JsonStore({
                                        autoDestroy: false,
                                        autoLoad: false,
                                        url: "api/All_spAlert.php",
                                        baseParams: {
                                            type: "sp_type_status",
                                            i_is_type_tor: true,
                                            all: "all",
                                        },
                                        root: "data",
                                        idProperty: "id",
                                        fields: ["id", "c_name"],
                                    }),
                                    anchor: "100%",
                                    fieldLabel: "วิธีดำเนินงาน",
                                    submitValue: true,
                                    hiddenName: "stor_type_id",
                                    name: "sc_type_id",
                                    id: "stor_type_idID",
                                    valueField: "id",
                                    displayField: "c_name",
                                    triggerAction: "all",
                                    forceSelection: false,
                                    selectOnFocus: true,
                                    typeAhead: false,
                                    emptyText: "กรุณาเลือก",
                                    listeners: {
                                        afterrender: function () {
                                            //setLoad&&callback
                                            this.store.load({
                                                callback: function (record, operation, success) {
                                                    if (success) {
                                                        Ext.getCmp("stor_type_idID").setValue(this.data.items[0].get("c_name"));
                                                    }
                                                },
                                            });
                                        },
                                    },
                                }),
//                                {
//                                    xtype: "radiogroup",
//                                    columns: [80, 90],
//                                    fieldLabel: "สถานะการใช้งาน",
//                                    id: "searchEnabledID",
//                                    items: [
//                                        {
//                                            name: "i_enabled",
//                                            checked: true,
//                                            inputValue: 1,
//                                            boxLabel: "ใช้งาน",
//                                        },
//                                        {
//                                            name: "i_enabled",
//                                            inputValue: 2,
//                                            boxLabel: "ไม่ใช้งาน",
//                                        },
//                                    ], //radiogroup
//                                } 
                            ],
                        },
                    ],
                    buttonAlign: "left",
                    buttons: [
                        {
                            text: "ค้นหา",
                            handler: function () {
                                Ext.storeDtl.setBaseParam("mode", "LIST");
                                Ext.storeDtl.setBaseParam("act", "SEARCH");
                                // Ext.storeDtl.setBaseParam("d_tor_date", Ext.getCmp("sd_tor_dateID").getValue());
                                Ext.storeDtl.setBaseParam("tor_type_id", Ext.getCmp("stor_type_idID").getValue());
                                Ext.storeDtl.setBaseParam("c_code", Ext.getCmp("sc_codeID").getValue());
                                Ext.storeDtl.setBaseParam("c_name", Ext.getCmp("sc_nameID").getValue());
                                // Ext.storeDtl.setBaseParam("i_enabled", Ext.getCmp("searchEnabledID").getValue().inputValue);
                                // Ext.storeDtl.setBaseParam("i_post", Ext.getCmp("searchPostID").getValue().inputValue);

                                Ext.storeDtl.load();
                            },
                        },
                        {
                            text: "ปิด",
                            handler: function () {
                                Ext.getCmp("winSearchFrm").hide();
                            },
                        },
                    ],
                },
            ],
            listeners: {
                afterRender: function (thisForm, options) {
                    new Ext.KeyNav("winSearchFrm", {
                        enter: function (e) {
                            Ext.storeDtl.setBaseParam("mode", "LIST");
                            Ext.storeDtl.setBaseParam("act", "SEARCH");
                            Ext.storeDtl.setBaseParam("d_tor_date", Ext.getCmp("sd_tor_dateID").getValue());
                            Ext.storeDtl.setBaseParam("tor_type_id", Ext.getCmp("stor_type_idID").getValue());
                            Ext.storeDtl.setBaseParam("c_code", Ext.getCmp("sc_codeID").getValue());
                            Ext.storeDtl.setBaseParam("c_name", Ext.getCmp("sc_nameID").getValue());
                            Ext.storeDtl.setBaseParam("i_enabled", Ext.getCmp("searchEnabledID").getValue().inputValue);
                            Ext.storeDtl.setBaseParam("i_post", Ext.getCmp("searchPostID").getValue().inputValue);
                            Ext.storeDtl.load();
                        },
                        scope: this,
                    });
                },
            },
        });
    }
    var MenuButton = function () {
        var menu = new Ext.menu.Menu({
            id: "mainMenu",
            border: false,
            style: {
                overflow: "visible",
            },
            /*
             items: [{
             text: "ประเภทข้อมูล",
             icon: "../images/icons/application_form_magnify.png",
             menu: {
             items: [
             '<b class="menu-title">  เลือกประเภทข้อมูล </b>',
             {
             text: " เลือกประเภทข้อมูลบันทึกจากระบบเท่านั้น",
             checked: false,
             id: "keyDatat1",
             uri: 1,
             group: "theme",
             checkHandler: onLocationCheck
             },
             {
             text: " เลือกประเภทนำเข้าจากการ import Excel เท่านั้น",
             checked: false,
             uri: 0,
             id: "keyDatat2",
             group: "theme",
             checkHandler: onLocationCheck
             },
             {
             text: " เลือกประเภทข้อมูลที่ทั้งหมด",
             checked: true,
             id: "keyDatat3",
             uri: null,
             group: "theme",
             checkHandler: onLocationCheck
             }
             ]
             }
             }]*/
        });
        var tb = new Ext.Toolbar({
            text: " รายการเมนู ",
            border: false,
            icon: "../images/icons/text_list_bullets.png",
            iconCls: "menu",
            // <-- icon
            menu: menu,
            // assign menu by instance
        });
        tb.add({
            text: " รายการเมนู ",
            icon: "../images/icons/text_list_bullets.png",
            iconCls: "bmenu",
            // <-- icon
            border: false,
            bodyStyle: "padding:0px 0px 0px 0px !important;",
            menu: menu,
            // assign menu by instance
        });
        menu.addSeparator();
        menu.add({
            text: "ค้นหาข้อมูล",
            icon: "../images/icons/book_magnify.png",
        }).on(
                "click",
                (click = function () {
                    if (!Ext.isEmpty(Ext.getCmp("winSearchFrm")))
                        Ext.getCmp("winSearchFrm").destroy();
                    var s1 = SearchFrm();
                    s1.show();
                }));
        menu.add({
            text: "เพิ่มรายการ",
            icon: "../images/icons/add.png",
        }).on(
                "click",
                (click = function () {
                    Ext.buAct = "add";
                    Ext.loadStore("add", true); // app,data.load
                }));
        menu.add({
            text: "บันทึกและนำเข้าข้อมูลไฟล์ Excel",
            icon: "../images/icons/page_excel.png",
        }).on(
          "click",
          (click = function () {
              Ext.butt = "add";
              let frmAdd = new formAdd();
              Ext.getCmp("contenterCenter").add(frmAdd);
              Ext.getCmp("contenterCenter").setActiveTab(frmAdd);
              Ext.getCmp("role-form-mode").setValue("ADD");
          }));

        tb.doLayout();
        return tb;
    }; //MenuButton
    Ext.gridMainfn = function (editAbled) {
        if (!Ext.isEmpty(Ext.getCmp("tabpanel1")))
            Ext.getCmp("contenterCenter").remove(Ext.getCmp("tabpanel1"), true) || {};
        var gridMains = new gridMain();
        Ext.getCmp("contenterCenter").add(gridMains);
        Ext.getCmp("contenterCenter").setActiveTab(gridMains);
        Ext.getCmp("tabpanel1").on("beforeedit", function () {
            return editAbled;
        });
        if (editAbled)
            Ext.getCmp("buSaveGridID").show();
        else
            Ext.getCmp("buSaveGridID").hide();
        return gridMains;
    };
    /////////////////// searchGrid Extend
    Ext.extend(
            (searchGrid = function () {
                var mnController = "reg/controller/mnPoWorkingHdrBegin.php";
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
                    bodyStyle: "padding:1px",
                    autoHeight: true,
                    border: false,
                    width: 600,
                    url: mnController,
                    labelWidth: 180,
                    defaults: {
                        anchor: "0",
                    },
                    items: [
                        {
                            xtype: "hidden",
                            name: "mode",
                            value: "saveDataGrid",
                        },
                        {
                            xtype: "hidden",
                            name: "gridMain",
                            id: "gridMainID",
                        },
                        menu ? MenuButton() : [],
                    ],
                    buttonAlign: "left",
                    buttons: [
                        {
                            text: "บันทึกรายการ",
                            id: "buSaveGridID",
                            iconCls: "icon-save",
                            listeners: {
                                afterrender: function () {
                                    this.hide();
                                },
                            },
                            handler: function () {
                                var formSubmit = function () {
                                    form.submit({
                                        waitMsg: "Saving Data...",
                                        success: function (form, action) {
                                            Ext.Msg.alert("Success", action.result.msg, function (form, action) {
                                                Ext.getCmp("tabpanel1").getStore().reload();
                                                Ext.getCmp("winChequeID").hide();
                                                Ext.getCmp("winChequeID").destroy();
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
                                }; //func submit
                                var saveDtl = function (mode) {
                                    let msg = "";
                                    let jsonArr = [];
                                    let sto = Ext.getCmp("tabpanel1").store.data.items;
                                    sto.forEach(function (v) {
                                        //d_audit_date d_approve_date d_doc_date d_inv_date
                                        jsonArr.push({
                                            po_working_dtl_id: v.data.id,
                                            d_audit_date: Ext.isEmpty(v.data.d_audit_date) ? null : v.data.d_audit_date.add("Y", -543).dateFormat("Y-m-d"),
                                            d_approve_date: v.data.d_approve_date.add("Y", -543).dateFormat("Y-m-d"),
                                            d_doc_date: v.data.d_doc_date.add("Y", -543).dateFormat("Y-m-d"),
                                            d_inv_date: v.data.d_inv_date.add("Y", -543).dateFormat("Y-m-d"),
                                        });
                                    });
                                    //console.log(JSON.stringify(jsonArr));
                                    //console.log(jsonArr);
                                    //TODO @ setGridDirty to idCmp
                                    Ext.getCmp("gridMainID").setValue(JSON.stringify(jsonArr));
                                    formSubmit(form); //submit grid form
                                }; // saveDtl
                                var form = Ext.getCmp("frm-grid-searchID").getForm();
                                if (form.isValid()) {
                                    Ext.MessageBox.show({
                                        title: "Icon Support",
                                        msg: "คุณต้องการที่จะบันทึกข้อมูลใน Data Grid ใช่ใหม ?",
                                        buttons: Ext.MessageBox.OKCANCEL,
                                        icon: Ext.MessageBox.WARNING,
                                        fn: function (btn) {
                                            if (btn === "ok") {
                                                //TODO @ setGridDirty to idCmp
                                                saveDtl();
                                            } else {
                                                return;
                                            }
                                        },
                                    });
                                }
                            },
                            //haddler
                        },
                        {
                            xtype: "tbfill",
                        },
                        {
                            text: "ค้นหา",
                            id: "buSearchID",
                            iconCls: "icon-magnifier",
                            handler: function () {
                                search();
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
            }),
            Ext.FormPanel,
            {}
    );
    /////////////////// gridMain
    Ext.extend(
            (gridMain = function () {
                var colmnn = [
                    new Ext.grid.RowNumberer({
                        header: "ที่",
                        dataIndex: "no",
                        id: "idID",
                        width: 30,
                        renderer: function (value, metaData, record, row, col, store, gridView) {
                            metaData.attr = "style='cursor:pointer; text-align:center;';";
                            return record.get("no");
                        },
                    }),
                    {
                        header: "id",
                        sortable: false,
                        align: "left",
                        dataIndex: "id",
                        hidden: true, // icon: "../images/icons/application_view_tile.png"
                    },
                    {
                        header: "สถานะ",
                        sortable: false,
                        align: "left",
                        dataIndex: "c_code_status",
                        hidden: true,
                        renderer: function (value, metaData, record, row, col, store, gridView) {
                            return value == null ? "" : value + " " + record.get("c_name_status");
                        },
                    },
                    {
                        header: "อัพเดทสถานะ",
                        sortable: false,
                        align: "center",
                        dataIndex: "id",
                        id: "processDueID",
                        width: 90,
                        renderer: function (value, metaData, record, row, col, store, gridView) {

                            metaData.attr = "style='cursor:pointer; text-align:center;' ";
                            if (record.get('tor_status_id') == 21)
                                return '-';
                            else
                                return '<img src="../images/icons/cog_start.png"); style="cursor:pointer"/>';
                        }
//                    },
//                    {
//                        header: "เลขที่สัญญา",
//                        sortable: false,
//                        align: "left",
//                        dataIndex: "c_doc_ref",
//                        width: 120,
                    },
                    {
                        header: "รหัสเลขสัญญา",
                        sortable: false,
                        align: "left",
                        dataIndex: "c_code",
                        width: 120,
                    },
                    {
                        header: "คู่สัญญา",
                        sortable: true,
                        align: "left",
                        dataIndex: "dc_creditor_id_Name",
                        width: 150,
                    },
                    {
                        header: "เรื่อง/โครงการ",
                        sortable: true,
                        align: "left",
                        dataIndex: "c_name",
                        width: 150,
                    },
                    {
                        header: "วันที่",
                        sortable: false,
                        align: "center",
                        hidden: true,
                        dataIndex: "d_tor_date",
                    },
                    {
                        header: "วิธีดำเนินงาน",
                        width: 70,
                        sortable: false,
                        align: "left",
                        dataIndex: "c_tor_type",
                    },
                    {
                        header: "ขอดำเนินการ",
                        sortable: false,
                        align: "center",
                        width: 70,
                        dataIndex: "c_purchase",
                    },
                    {
                        header: "หน่วยงานเจ้าของเรื่อง",
                        align: "left",
                        dataIndex: "dc_cost2_idTxt",
                    },
                    {
                        header: "ชื่อผู้สร้างรายการ",
                        sortable: false,
                        align: "center",
                        dataIndex: "dc_user_create_id",
                        hidden: true,
                    },
                    {/*txtdc_department_idID: "จัดซื้อจัดจ้าง3"
                     txtsp_emp_idID: "สุธิตา ออกรรัมย์"*/
                        header: "สายงาน",
                        sortable: true,
                        align: "center",
                        dataIndex: "txtdc_department_idID",
                    },
                    {
                        header: "ผู้รับผิดชอบ",
                        sortable: true,
                        align: "center",
                        dataIndex: "txtsp_emp_idID",
                    },
                    {
                        header: "หน่วยงานผู้สร้าง",
                        sortable: false,
                        align: "center",
                        dataIndex: "dc_user_create_cost_id",
                        hidden: true,
                    },
                    {
                        header: "วันที่สร้างรายการ",
                        sortable: false,
                        align: "center",
                        dataIndex: "d_create",
                        hidden: true,
                        renderer: function (val, metaData, record, rowIndex, colIndex, store) {
                            return shortThaiDate(val);
                        },
                    },
                    {
                        header: "ชื่อผู้แก้ไขรายการ",
                        sortable: false,
                        align: "center",
                        dataIndex: "dc_user_update_id",
                    },
                    {
                        header: "หน่วยงานแก้ไขรายการ",
                        sortable: false,
                        align: "center",
                        dataIndex: "dc_user_update_cost_id",
                    },
                    {
                        header: "วันที่แก้ไขรายการ",
                        sortable: false,
                        align: "center",
                        dataIndex: "d_update",
                        renderer: function (val, metaData, record, rowIndex, colIndex, store) {
                            return shortThaiDate(val);
                        },
                    },
                ];
                gridMain.superclass.constructor.call(this, {
                    region: "center",
                    title: "นำเข้าสัญญา",
                    xtype: "grid",
                    id: "tabpanel1",
                    border: true,
                    stripeRows: true,
                    loadMask: true,
                    //------------------
                    layout: "fit",
//                    clicksToEdit: 2,
                    viewConfig: {
                        emptyText: "ไม่มีข้อมูล..",
                        deferEmptyText: true,
                    },
                    listeners: {
                        dblclick: function (dataview, index, item, e) {
                            Ext.buAct = "update";

                            Ext.loadStore("edit", true); // app,data.load
                            console.log(Ext.selectRow);
                        },
                        viewready: function (g) {
                            //
                        },
                        // Allow rows to be rendered.
                        beforeedit: function (g) {
                            if (g.rowIdx == 1)
                                return false;
                        },
                        // Allow rows to be rendered. console.log(value.format('d-m-Y'));
                        afteredit: function (g) {
                            // console.log(g.record.get('d_inv_date').format('d-m-Y'));
                        },
                        beforerender: function (g) {
                            this.contextMenu = new Ext.menu.Menu({
                                items: [
                                    {
                                        text: "รายละเอียดทั้งหมด",
                                        icon: "../images/icons/book_magnify.png",
                                        handler: function (e) {
                                            Ext.buAct = "getDetail";
                                            Ext.getCmp("contenterCenter").add(tab2);
                                            Ext.getCmp("contenterCenter").setActiveTab(tab2);
                                        },
                                        scope: this,
                                        //                                     }, {
                                        //                                         text: "เพิ่มข้อมูล",
                                        //                                         icon: "../images/icons/add.png",
                                        //                                         handler: function (e)
                                        //                                         {
                                        //                                             Ext.buAct = "add";
                                        //                                             Ext.loadStore("add", true); // app,data.load
                                        //                                         },
                                        //                                         scope: this
                                    },
                                    {
                                        text: "จัดการข้อมูล View/Copy/Edit/Delete",
                                        icon: "../images/icons/application_edit.png",
                                        handler: function (e) {
                                            Ext.buAct = "update";
                                            Ext.loadStore("edit", true); // app,data.load
                                        },
                                        scope: this,
                                    }, {
                                        text: "คัดลอกข้อมูลใน copy data in cell grid",
                                        icon: "../images/icons/page_copy.png",
                                        handler: function (e)
                                        {
                                            //field
                                            Ext.buAct = "copy";
                                            Ext.selectRowCopy = Ext.selectRow;
                                        },
                                        scope: this
                                    }, {
                                        text: "ลบข้อมูลที่เลือก",
                                        icon: "../images/icons/table_row_delete.png",
                                        handler: function (e)
                                        {
                                            //field
                                            Ext.buAct = "DEL";
                                            Ext.selectRowCopy = Ext.selectRow;
                                            DeleteNoTor_dtl(Ext.selectRow);
                                        },
                                        scope: this
                                    }
                                ],
                            });

                        },
                                                        /*cellmousedown( this, rowIndex, columnIndex, e )*/
                        afterrender: function () {
//                            this.on('rowmousedown', function (rowIndex, e) {
//                                console.log(this);
//                            }, this),
                            this.on("cellclick", cellClick, this); //cellClick 
                            this.on("contextmenu", function (e) {
//                                console.log(Ext.selectRow);
                                e.stopEvent();
                                this.contextMenu.showAt(e.getXY());
                            }, this);
                        },
                    },
                    store: Ext.storeDtl,
//                    tbar: [
//                        {
//                            xtype: "button",
//                            iconCls: "icon-add",
//                            text: "เพิ่มรายการ",
//                            handler: function () {
//                                Ext.buAct = "add";
//                                Ext.loadStore("add", true); // app,data.load
//                            },
//                        },
//                        {
//                            xtype: "button",
//                            text: " ค้นหา ",
//                            width: 80,
//                            iconCls: "icon-application-view-list",
//                            handler: function () {
//                                if (!Ext.isEmpty(Ext.getCmp("winSearchFrm")))
//                                    Ext.getCmp("winSearchFrm").destroy();
//                                var s1 = SearchFrm();
//                                s1.show();
//                                Ext.getCmp("sc_codeID").focus(false, 20);
//                            },
//                        },
//                    ],
                    tbar: MenuButton(),
                    columns: colmnn,
                    bbar: new Ext.PagingToolbar({
                        pageSize: 20,
                        store: Ext.storeDtl,
                        displayInfo: true,
                        displayMsg: "Displaying topics {0} - {1} of {2}",
                    }),
                });
            }),
            Ext.grid.GridPanel,
            {}
    );
    ///////////////// EditorGridPanel
    const search = function () {
        var msg = "";
        if (msg == "") {
            Ext.storeDtl.setBaseParam("mode", "SEARCH");
            Ext.storeDtl.setBaseParam("filter", Ext.getCmp("filter-ID").getValue());
            Ext.storeDtl.setBaseParam("value", Ext.getCmp("val-ID").getValue());
            Ext.storeDtl.setBaseParam("userid", Ext.getCmp("userid-ID").getValue());
            Ext.getCmp("tabpanel1").getStore().load();
        } else {
            Ext.Msg.alert("แจ้งเตือน", msg);
        }
    };
    //AutoLoad
    Ext.torType = new Ext.data.JsonStore({
        autoDestroy: false,
        autoLoad: true,
        url: "api/All_spAlert.php",
        baseParams: {type: "sp_type_status", i_is_type_tor: true},
        root: "data",
        idProperty: "id",
        fields: ["id", "c_name"],
    });
    Ext.po_user = new Ext.data.JsonStore({
        autoDestroy: false,
        autoLoad: true,
        url: "api/All_PoWorkingImpHdr.php",
        baseParams: {
            type: "po_user",
        },
        root: "data",
        idProperty: "id",
        fields: ["id", "c_name"],
    });
    // copy text in cell on select row no
    Ext.po_emp = new Ext.data.JsonStore({
        autoDestroy: false,
        autoLoad: true,
        url: "api/All_PoWorkingImpHdr.php",
        baseParams: {
            type: "po_emp",
        },
        root: "data",
        idProperty: "id",
        fields: ["id", "c_code", "c_name"],
    });
    Ext.bgProject = new Ext.data.JsonStore({
        autoDestroy: false,
        autoLoad: true,
        url: "api/All_PoWorkingImpHdr.php",
        baseParams: {
            type: "bg_project",
        },
        root: "data",
        idProperty: "id",
        fields: ["id", "c_name", "f_project"],
    });
    Ext.po_user_permission = new Ext.data.JsonStore({
        autoDestroy: false,
        autoLoad: false,
        url: "api/All_PoWorkingImpHdr.php",
        baseParams: {
            type: "po_user_permission",
        },
        root: "data",
        idProperty: "id",
        fields: ["id", "c_name"],
    });
    Ext.dc_cost = new Ext.data.JsonStore({
        autoDestroy: false,
        autoLoad: true,
        url: "api/All_PoWorkingImpHdr.php",
        baseParams: {
            type: "dc_cost",
        },
        root: "data",
        idProperty: "id",
        fields: ["id", "c_code", "c_name"],
    });
    Ext.po_creditor_transfer = new Ext.data.JsonStore({
        autoDestroy: false,
        autoLoad: true,
        url: "api/All_PoWorkingImpHdr.php",
        baseParams: {
            type: "po_creditor_transfer",
        },
        root: "data",
        idProperty: "id",
        fields: ["id", "c_code", "c_name"],
    });
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
    Ext.po_expense_group = new Ext.data.JsonStore({
        autoDestroy: false,
        autoLoad: true,
        url: "api/All_PoWorkingImpHdr.php",
        baseParams: {
            type: "po_expense_group",
        },
        root: "data",
        idProperty: "id",
        fields: ["id", "c_name"],
    });
    Ext.i_type_bg = new Ext.data.JsonStore({
        autoDestroy: false,
        autoLoad: true,
        url: "api/All_spAlert.php",
        baseParams: { type: "sp_type_bg", i_type_bg: true , i_type : true },
        root: "data",
        idProperty: "id",
        fields: ["id", "c_name"],
    });
    Ext.po_expense = new Ext.data.JsonStore({
        autoDestroy: false,
        autoLoad: true,
        url: "api/All_PoWorkingImpHdr.php",
        baseParams: {
            type: "po_expense",
        },
        root: "data",
        idProperty: "id",
        fields: ["id", "c_name"],
    });
    Ext.storeDtl = new Ext.data.JsonStore({
        autoDestroy: false,
        autoLoad: true,
        url: "tor/api/mnContractNoTor.php",
        baseParams: {
            mode: "LIST_CONTRACT_NO_TOR",
            keyData: Ext.keyData,
            i_alarm: Ext.menu_i_alarm,
            i_pa: Ext.menu_i_day,
            tor_status_id: Ext.menu_id,
            i_enabled : 1 , 
        },
        root: "data",
        idProperty: "id",
        totalProperty: "totalCount",
        fields: [
            {
                name: "no",
            },
            {
                name: "id",
            },
            {
                name: "sp_tor_id",
            },
            {
                name: "sp_contract_year",
            },
            {
                name: "sp_tor_contract_id",
            },
            {
                name: "i_step",
            },
            {
                name: "index_receive",
            },
            {
                name: "dc_emp_id",
            },
            {
                name: "i_receive",
            },
            {
                name: "txtsub_cost",
            },
            {
                name: "txtsp_emp_idID",
            },
            {
                name: "txtdc_department_idID",
            },
            {
                name: "dc_emp_name",
            },
            {
                name: "DateAdd1",
            },
            {
                name: "DateAdd2",
            },
            {
                name: "d_tor_date_alert",
            },
            {
                name: "d_tor_date_alert",
            },
            {
                name: "d_tor_date_pa",
            },
            {
                name: "c_contract_no",
            },
            {
                name: "i_forword",
            },
            {
                name: "i_backword",
            },
            {
                name: "c_codeStatus",
            },
            {
                name: "c_contract_code",
            },
            {
                name: "c_doc_ref",
            },
            {
                name: "c_code",
            },
            {
                name: "bg_budget_dtl_project_id",
            },
            {
                name: "c_budget_dtl_project",
            },
            {
                name: "c_name",
            },
            {
                name: "c_code_status",
            },
            {
                name: "d_tor_status_date", //
            },
            {
                name: "c_name_status", // d_tor_status_date
            },
            {
                name: "c_tor_type",
            },
            {
                name: "tor_status_id",
            },
            {
                name: "tor_type_id",
            },
            {
                name: "c_purchase",
            },
            {
                name: "i_purchase",
            },
            {
                name: "i_not_do",
            },
            {
                name: "d_contract_date",
            },
            {
                name: "d_due_date",
            },
            {
                name: "d_tor_date", //
            },
            {
                name: "i_parent", //d_tor_date
            },
            {
                name: "i_is_more",
            },
            {
                name: "i_is_rename",
            },
            {
                name: "i_is_register",
            },
            {
                name: "i_is_parent",
            },
            {
                name: "i_is_expense_monthly",
            },
            {
                name: "i_type_fix_rate",
            },
            {
                name: "f_total_amt",
            },
            {
                name: "f_total",
            },
            {
                name: "dc_cost2_id",
            },
            {
                name: "dc_cost_id",
            },
            {
                name: "dc_cost2_idTxt",
            },
            {
                name: "dc_cost_idTxt",
            },
            {
                name: "i_type_contract",
            },
            {
                name: "i_yyyy",
            },
            {
                name: "i_year",
            },
            {
                name: "c_year",
            },
            {
                name: "dc_department_id",
            },
            {
                name: "sp_emp_id",
            },
            {
                name: "c_department",
            },
            {
                name: "d_doc_ref",
            },
            {
                name: "dc_expense_budget_type_id",
            },
            {
                name: "po_expense_id",
            },
            {
                name: "dc_user_create_id",
            },
            {
                name: "dc_user_create_cost_id",
            },
            {
                name: "d_create",
            },
            {
                name: "dc_user_update_id",
            },
            {
                name: "dc_user_update_cost_id",
            },
            {
                name: "d_update",
            },
            {
                name: "i_enabled",
            },
            {
                name: "c_comment",
            },
            {
                name: "c_remake",
            },
            {
                name: "dc_creditor_id",
            },
            {
                name: "c_tax_number_imp",
            },
            {
                name: "dc_creditor_id_Name",
            },
            {
                name: "start_date",
            },
            {
                name: "end_date",
            },
            {
                name: "i_hire_type",
            },
            {
                name: "i_is_inv",
            },
            {
                name: "i_type_fix_rate",
            },
            {
                name: "i_product_type",
            },
            {name: "i_delivery_date"},
            {name: "i_is_warranty"},
            {name: "i_is_warranty_book"},
            {name: "c_books_receipt"},
            {name: "c_receipt_no"},
            {name: "d_doc_date"},
            {name: "f_warranty_amt"},
            {name: "c_comment"},
            {name: "c_doc_no"},
            {name: "d_doc_date1"},
            {name: "dc_bank_id"},
            {name: "dc_bank_idID_Name"},
            {name: "f_warranty_amt1"},
            {name: "d_expire_warranty"},
            {name: "c_comment1"},
            /*
                "c_books_cashiercheque" => $row["cashiercheque_on"],
                "c_receipt_cashiercheque" => $row["cashiercheque_seq"],
                "d_cashiercheque_date" => ((empty($row["d_cashiercheque_data"])) ? "" : $date->extDateBuddha($row["d_cashiercheque_data"])),// $row["d_cashiercheque_data"],
                "f_cashiercheque_warranty_amt2" => $row["f_warranty_cashiercheque"],
                "c_comment2" => $row["c_remark_cashiercheque"],      
             */
            {name: "c_books_cashiercheque"},
            {name: "c_receipt_cashiercheque"},
            {name: "d_cashiercheque_date"},
            {name: "f_cashiercheque_warranty_amt2"},
            {name: "c_comment2"},
            {name: "i_type_bg"},
            
            
        ],
    });
    Ext.store_year = new Ext.data.JsonStore({
        fields: ["id", "c_name"],
        autoDestroy: false,
        autoLoad: false,
        data: Ext.yearTh(),
    });
    Ext.keyData = 1; //type data key in
    Ext.poFormID = "grid-form-cheque";
    Ext.getDate = Ext.apply({
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
        day: new Date().getDay(),
        getNowCarlen: function () {
            var day = new Date();
            var dd = day.getDate();
            var mm = day.getMonth() + 1;
            var yy = day.getFullYear() + 543;
            mm = mm < 10 ? "0" + mm : mm;
            dd = dd < 10 ? "0" + dd : dd;
            return dd + "-" + mm + "-" + yy;
        },
        defaultDate: function (typeStartDate) {
            var day = new Date();
            var dd = day.getDate();
            var mm = day.getMonth() + 1;
            var yy = day.getFullYear() + 543;
            if (typeStartDate === 1) {
                // วันที่เริ่ม -1 เดือน
                dd = "01";
                mm = "0" + mm.toString();
            } else {
                dd = "0" + dd.toString();
                mm = "0" + mm.toString();
            }
            return dd.substr(-2) + "-" + mm.substr(-2) + "-" + yy.toString();
        },
    });
};
