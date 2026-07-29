/*!
 * Ext JS Library 3.4.0
 * Copyright(c) 2006-2011 Sencha Inc.
 * licensing@sencha.com
 * http://www.sencha.com/license ห
 */
/* global Ext */


Ext.AppUx = function (app, menu) {
    Ext.HDR_ID = null;
    Ext.selectRow = [];
    Ext.menuEditGrid = true;
    Ext.menuRightEditgrid = true;
    Ext.storeDtl = new Ext.data.JsonStore(
        {
            autoDestroy: false,
            autoLoad: true,
            url: "alert/api/listStatus.php",
            baseParams: {
                type: "po_working_dtl",
            },
            root: "data",
            idProperty: "id",
            totalProperty: "totalCount",
            fields:
                [
                    {
                        name: "no"
                    }, {
                        name: "id"
                    }, {
                        name: "c_name"
                    }, {
                        name: "c_code"
                    }, {
                        name: "c_comment"
                    }, {
                        name: "i_is_type_tor"
                    }, {
                        name: "i_is_type_tor_name"
                    }, {
                        name: "i_enabled"
                    }, {
                        name: "i_delete"
                    }, {
                        name: "dc_user_create_id"
                    }, {
                        name: "dc_user_create_cost_id"
                    }, {
                        name: "d_create"
                    }, {
                        name: "dc_user_update_id"
                    }, {
                        name: "dc_user_update_cost_id"
                    }, {
                        name: "d_update"
                    }
                ]
        }
    );
    let years = [];
    let currentTime = new Date();
    let now = currentTime.getFullYear() + 1;
    let id = currentTime.getFullYear() - 3;
    while (id <= now) {
        let c_name = id + 543;
        years.push({
            id, c_name
        });
        id++;
    }
    Ext.bgYear = now - 1;
    Ext.store_year = new Ext.data.JsonStore(
        {
            fields: ["id", "c_name"],
            autoDestroy: false,
            autoLoad: false,
            data: years,
        });
    Ext.title = "ประเภทการนับ PA และการะแจ้งเตือน";
    Ext.poFormID = "grid-form-cheque";
    Ext.getDate = Ext.apply(
        {
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
                }
                else {
                    dd = "0" + dd.toString();
                    mm = "0" + mm.toString();
                }
                return dd.substr(- 2) + "-" + mm.substr(- 2) + "-" + yy.toString();
            },
        });
    // copy text in cell on select row no
    function CopyToClipboard(rec, arrDataCopy) {
        var input = rec;
        var textToClipboard = "";
        //text on
        var success = true;
        for (var i = 0; i < arrDataCopy.length; i++) {
            textToClipboard += ", " + input.get(arrDataCopy[i]);
        }

        if (window.clipboardData) {
            // Internet Explorer
            window.clipboardData.setData("Text", textToClipboard);
        }
        else {
            var forExecElement = CreateElementForExecCommand(textToClipboard);
            SelectContent(forExecElement);
            var supported = true;
            // UniversalXPConnect privilege is required for clipboard access in Firefox
            try {
                if (window.netscape && netscape.security) {
                    netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
                }
                success = document.execCommand("copy", false, null);
            }
            catch (e) {
                success = false;
            }
            document.body.removeChild(forExecElement);
        }

        if (success) {
            console.log("The text is on the clipboard, try to paste it!");
        }
        else {
            console.log("Your browser doesn't allow clipboard access!");
        }
    }
    function CreateElementForExecCommand(textToClipboard, arrDataCopy) {
        var forExecElement = document.createElement("div");
        forExecElement.style.position = "absolute";
        forExecElement.style.left = "-10000px";
        forExecElement.style.top = "-10000px";
        forExecElement.textContent = textToClipboard;
        document.body.appendChild(forExecElement);
        forExecElement.contentEditable = true;
        return forExecElement;
    }
    function SelectContent(element) {
        // first create a range
        var rangeToSelect = document.createRange();
        rangeToSelect.selectNodeContents(element);
        // select the contents
        var selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(rangeToSelect);
    }
    function cellClick(grid, rowIndex, columnIndex, e) {
        Ext.selectRow = this.selModel.selection.record;
        console.log('>>>>>>>' + Ext.selectRow);
    }
    //interlizing
    var AppPoStore = function (statusx) {
        var disp = false ? 'displayfield' : 'textfield';

        //หน้าต่างกรอกข้อมูล//
        return new Ext.Window(
            {
                collapsible: true,
                maximizable: true,
                title: "ประเภทการนับ PA",
                width: 500,
                id: "winChequeID",
                height: 230,
                minWidth: 850,
                minHeight: 450,
                layout: "fit",
                modal: true,
                plain: true,
                bodyStyle: "padding:1px;",
                buttonAlign: "center",
                items: new Ext.FormPanel(
                    {
                        id: Ext.poFormID,
                        columnWidth: 1,
                        url: "alert/api/mnAlertType.php",
                        frame: true,
                        labelAlign: "left",
                        bodyStyle: "padding:1px",
                        labelWidth: 120,
                        listeners: {
                            afterrender: function () {
                                if (statusx !== 'add') {
                                    //// console.log('>>>>>>>' + Ext.selectRow.get('i_enabled'));

                                    this.getForm().loadRecord(Ext.selectRow);
                                    Ext.HDR_ID = Ext.selectRow.data.id;
                                }


                            }
                        },
                        items: [{
                            xtype: disp,
                            fieldLabel: 'วิธีดำเนินงาน',
                            name: 'c_name'
                        }, {
                            xtype: "textarea",
                            fieldLabel: "หมายเหตุ",
                            name: "c_comment",
                            width: 300
                        }, {
                            fieldLabel: 'สถานะการใช้งาน',
                            xtype: 'radiogroup',
                            columns: [80, 100],
                            name: 'i_enabled',
                            items: [
                                { boxLabel: 'ใช้งาน', checked: true, name: 'i_enabled', inputValue: Ext.CONF_STATUS_ENABLE },
                                { boxLabel: 'ไม่ใช้งาน', name: 'i_enabled', inputValue: Ext.CONF_STATUS_DISABLE }
                            ]
                        }, {
                            ////fieldLabel: '',
                            xtype: 'radiogroup',
                            columns: [80, 100],
                            name: 'i_is_type_tor',
                            id: 'si_is_type_tor',
                            items: [
                                { boxLabel: 'สถานะร่วม', checked: true, name: 'i_is_type_tor', inputValue: 0 },
                                { boxLabel: 'สถานะแยก', name: 'i_is_type_tor', inputValue: 1 }
                            ]
                        }, {
                            xtype: 'hidden',
                            name: 'mode',
                            value: 'ADD',
                            id: 'modeID'
                        }, {
                            xtype: 'hidden',
                            name: 'id',
                            value: 0
                        }],
                        buttons: [
                            {
                                text: "บันทึกข้อมูล",
                                id: "buSaveSubID",
                                iconCls: "icon-save",
                                listeners: {
                                    afterrender: function () {
                                        if (statusx === "edit") {
                                            Ext.getCmp("modeID").setValue("EDIT");
                                        }
                                        // alert(Ext.getCmp('modeID').getValue());
                                    },
                                },
                                handler: function () {
                                    var formSubmit = function () {
                                        form.submit(
                                            {
                                                waitMsg: "Saving Data...",
                                                success: function (form, action) {
                                                    Ext.Msg.alert("Success", action.result.msg, function (form, action) {
                                                        Ext.getCmp("tabpanel1").getStore().reload();
                                                        Ext.selectRow = null;
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
                                                            Ext.Msg.alert("Failure", "พบข้อผิดพลาดในการเชื่อต่อเครือข่าย");
                                                            break;
                                                        case Ext.form.Action.SERVER_INVALID:
                                                            Ext.Msg.alert("Failure", action.result.msg);
                                                    }
                                                },
                                            });
                                    };
                                    var form = Ext.getCmp(Ext.poFormID).getForm();
                                    formSubmit(form);
                                },
                                //haddler
                            }, {
                                text: Ext.GLOBAL_BU_BACK_TH,
                                handler: function () {
                                    Ext.getCmp("winChequeID").hide();
                                    Ext.getCmp("winChequeID").destroy();
                                },
                            },],
                    }),
                listeners: {
                    afterrender: function () { },
                },
            });
    }; //AppPoStore


    //=========================== หน้าต่าง SEARCH =============================================
    var AppPoStoresearch = function (statusx) {
        var disp = fetch ? 'displayfield' : 'textfield';
        return new Ext.Window(
            {
                collapsible: true,
                maximizable: true,
                title: "ค้นหาประเภทของวิธีการดำเนินงาน",
                width: 340,
                id: "search",
                height: 200,
                minWidth: 100,
                minHeight: 100,
                layout: "fit",
                modal: true,
                plain: true,
                bodyStyle: "padding:1px;",
                buttonAlign: "center",
                items: new Ext.FormPanel(
                    {
                        id: Ext.search,
                        columnWidth: 1,
                        url: "alert/api/mnAlertType.php",
                        frame: true,
                        labelAlign: "left",
                        bodyStyle: "padding:1px",
                        labelWidth: 100,
                        listeners: {
                            afterrender: function () {
                                if (statusx !== 'search') {
                                    console.log('>>>>>>>' + Ext.selectRow.get('i_enabled'));
                                    console.log('>>>>>>>' + Ext.selectRow.get('c_name'));
                                    this.getForm().loadRecord(Ext.selectRow);
                                    Ext.HDR_ID = Ext.selectRow.data.id;
                                }
                            }
                        },
                        items: [
                            {
                                xtype: 'textfield',
                                fieldLabel: 'รหัส',
                                id: 'sc_code',
                                name: 'c_code'
                            }, {
                                xtype: 'textfield',
                                fieldLabel: 'วิธีดำเนินงาน',
                                id: 'sc_name',
                                name: 'c_name'
                            }, {
                                fieldLabel: 'สถานะการใช้งาน',
                                xtype: 'radiogroup',
                                id: 's_enabled',
                                columns: [80, 100],
                                name: 'i_enabled',
                                items: [
                                    { boxLabel: 'ใช้งาน', checked: true, name: 'i_enabled', inputValue: Ext.CONF_STATUS_ENABLE },
                                    { boxLabel: 'ไม่ใช้งาน', name: 'i_enabled', inputValue: Ext.CONF_STATUS_DISABLE }
                                ]
                            }, {
                                fieldLabel: '',
                                xtype: 'radiogroup',
                                id: 'si_is_type_tor',
                                columns: [80, 100],
                                name: 'i_is_type_tor',
                                items: [
                                    { boxLabel: 'สถานะร่วม', checked: true, name: 'i_is_type_tor', inputValue: 0 },
                                    { boxLabel: 'สถานะแยก', name: 'i_is_type_tor', inputValue: 1 }
                                ]
                            }],
                        buttons: [
                            {
                                text: "ค้นหาข้อมูล",
                                id: "buSaveSubID",
                                iconCls: "icon-save",
                                handler: function () {
                                    var msg = "";
                                    ////   console.log ( '>>>>>>' ) ;
                                    ////   console.log ( Ext.storeDtl ) ;
                                    ////   console.log ( Ext.getCmp ( "sc_code" ).getValue () ) ;
                                    ////   console.log ( Ext.getCmp ( "sc_name" ).getValue () ) ;
                                    ////   console.log ( Ext.getCmp ( "s_enabled" ).getValue ().inputValue ) ;
                                    console.log(Ext.getCmp("si_is_type_tor").getValue().inputValue);
                                    Ext.storeDtl.setBaseParam("c_code", Ext.getCmp("sc_code").getValue());
                                    Ext.storeDtl.setBaseParam("c_name", Ext.getCmp("sc_name").getValue());
                                    Ext.storeDtl.setBaseParam("i_enabled", Ext.getCmp("s_enabled").getValue().inputValue);
                                    Ext.storeDtl.setBaseParam("i_is_type_tor", Ext.getCmp("si_is_type_tor").getValue().inputValue);
                                    Ext.storeDtl.setBaseParam("mode", "SEARCH");
                                    Ext.storeDtl.load();
                                    Ext.getCmp("search").destroy();
                                    //// console.log ( Ext.getCmp ) ( Ext.store )
                                },
                                //haddler
                            }, {
                                text: Ext.GLOBAL_BU_BACK_TH,
                                handler: function () {
                                    Ext.getCmp("search").hide();
                                    Ext.getCmp("search").destroy();
                                },
                            },],
                    }),
                listeners: {
                    afterrender: function () { },
                },
            });
    };
    //=========================== สิ้นสุดหน้าต่าง SEARCH =============================================

    //=========================== หน้าต่าง DELETE =============================================
    //deletewindow
    var deletewindow = function (statusx) {
        return new Ext.Window({
            id: "win-msg-delete",
            title: "Remove",
            modal: true,
            width: 250,
            height: 130,
            html: "ท่านต้องการที่จะลบข้อมูล ?",
            buttons: [{
                text: "Confirm",
                handler: function () {
                    Ext.Ajax.request({
                        url: "alert/api/mnAlertType.php",
                        params: {
                            mode: 'DELETE',
                            id: Ext.selectRow.get('id')
                        },
                        method: 'GET', //POST
                        success: function (result, request) {
                            var jsonData = Ext.util.JSON.decode(result.responseText);	//decode json
                            if (jsonData.success == "Success") {
                                Ext.getCmp("win-msg-delete").destroy();						// clear memory :: garbage collection
                                Ext.getCmp("tabpanel1").getStore().reload();
                                Ext.selectRow = null;
                            }
                            else {
                                Ext.MessageBox.alert('Failed', jsonData.msg);			// alert massage error
                            }
                        },
                        failure: function (result, request) {
                            Ext.MessageBox.alert('Failed', result.responseText);		// connect error

                        }
                    });
                }
            }, {
                text: Ext.GLOBAL_BU_BACK_TH,
                handler: function () {
                    Ext.getCmp("win-msg-delete").hide();
                    Ext.getCmp("win-msg-delete").destroy();
                },
            }]
        });
    }; //deletewindow

    //=========================== สิ้นสุดหน้าต่าง DELETE =============================================


    Ext.loadStore = function (status, show) {
        //console.log(status);
        var statusx = status;
        var winx = show;
        if (status === "edit" && Ext.isEmpty(Ext.selectRow)) {
            Ext.Msg.alert("แจ้งเตือน", "กรุณา click เลือกข้อมูลที่จะแก้ไขใน data grid", function (form, action) {
                return false;
            });
        }
        else if (statusx === "load") {
        }
        else if (statusx === "search") {
            AppPoStoresearch(statusx).show();
        }
        else if (statusx === "add") {
            Ext.HDR_ID = null;
            AppPoStore(statusx).show();
        }
        else if (statusx === "edit") {
            console.log(Ext.selectRow);
            AppPoStore(statusx).show();
        }
        else if (statusx === "delete") {
            if (Ext.isEmpty(Ext.selectRow)) {
                Ext.Msg.alert("แจ้งเตือน", "กรุณา click เลือกข้อมูลที่จะลบใน data grid", function (form, action) {
                    return false;
                });
            }
            else {
                deletewindow(statusx).show();
            }


        }

    }; //Ext.loadStore

    //แถบเมนูดรอปดาว
    var MenuButton = function () {
        // show Menu Edit Grid
        var editm = Ext.menuEditGrid;
        var menu = new Ext.menu.Menu(
            {
                id: "mainMenu",
                border: false,
                style: {
                    overflow: "visible",
                }
            });
        var tb = new Ext.Toolbar(
            {
                text: " รายการเมนู ",
                border: false,
                icon: "../images/icons/text_list_bullets.png",
                iconCls: "menu",
                // <-- icon
                menu: menu,
                // assign menu by instance
            });
        //   รายการเมนู
        tb.add(
            {
                text: " รายการเมนู ",
                icon: "../images/icons/text_list_bullets.png",
                iconCls: "bmenu",
                // <-- icon
                border: false,
                bodyStyle: "padding:0px 0px 0px 0px !important;",
                menu: menu,
                // assign menu by instance
            });
        //   ค้นหาข้อมูล
        menu.add(
            {
                text: "ค้นหาข้อมูล",
                icon: "../images/icons/book_magnify.png",
            }).on("click", (click = function () {
                Ext.loadStore("search", false); // app,data.load
            }));
        //   เพิ่มข้อมูล
        menu.add(
            {
                text: "เพิ่มข้อมูล",
                icon: "../images/icons/add.png",
            }).on("click", (click = function () {
                Ext.loadStore("add", false); // app,data.load
            }));
        //   แก้ไขข้อมูล
        menu.add(
            {
                text: "จัดการข้อมูล Edit",
                icon: "../images/icons/application_edit.png",
            }).on("click", (click = function () {
                Ext.loadStore("edit", true); // app,data.load
            }));
        //   ลบข้อมูล
        menu.add(
            {
                text: "จัดการข้อมูล Delete",
                icon: "../images/icons/delete.png",
            }).on("click", (click = function () {
                Ext.loadStore("delete", true); // app,data.load
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
            var mnController = "reg/controller/mnAlertType.php";
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
                fn: function () { },
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
                    }, {
                        xtype: "hidden",
                        name: "gridMain",
                        id: "gridMainID",
                    },
                    menu ? MenuButton() : []],
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
                                form.submit(
                                    {
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
                                    jsonArr.push(
                                        {
                                            po_working_dtl_id: v.data.id,
                                            d_audit_date: Ext.isEmpty(v.data.d_audit_date) ? null : v.data.d_audit_date.add("Y", - 543).dateFormat("Y-m-d"),
                                            d_approve_date: v.data.d_approve_date.add("Y", - 543).dateFormat("Y-m-d"),
                                            d_doc_date: v.data.d_doc_date.add("Y", - 543).dateFormat("Y-m-d"),
                                            d_inv_date: v.data.d_inv_date.add("Y", - 543).dateFormat("Y-m-d"),
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
                                Ext.MessageBox.show(
                                    {
                                        title: "Icon Support",
                                        msg: "คุณต้องการที่จะบันทึกข้อมูลใน Data Grid ใช่ใหม ?",
                                        buttons: Ext.MessageBox.OKCANCEL,
                                        icon: Ext.MessageBox.WARNING,
                                        fn: function (btn) {
                                            if (btn === "ok") {
                                                //TODO @ setGridDirty to idCmp
                                                saveDtl();
                                            }
                                            else {
                                                return;
                                            }
                                        },
                                    });
                            }
                        },
                        //haddler
                    }, {
                        xtype: "tbfill",
                    }, {
                        text: "ค้นหา",
                        id: "buSearchID",
                        iconCls: "icon-magnifier",
                        handler: function () {
                            search();
                        },
                    }, {
                        text: "เริ่มใหม่",
                        iconCls: "icon-reset",
                        handler: function () {
                            Ext.getCmp("frm-grid-searchID").getForm().reset();
                        },
                    },],
            });
        }), Ext.FormPanel, {});
    /////////////////// gridMain
    Ext.extend(
        (gridMain = function () {
            var colmnn = [
                new Ext.grid.RowNumberer(
                    {
                        header: "ที่",
                        dataIndex: "no",
                        id: "idID",
                        width: 30,
                        renderer: function (value, metaData, record, row, col, store, gridView) {
                            metaData.attr = "style='cursor:pointer; text-align:center;';";
                            return record.get("no");
                        },
                    }), {
                    header: "ลำดับ",
                    sortable: false,
                    align: "left",
                    dataIndex: "id",
                    hidden: true,
                },
                {
                    header: "รหัส",
                    sortable: true,
                    align: "left",
                    dataIndex: 'c_code',
                }, {
                    header: "วิธีดำเนินงาน",
                    sortable: false,
                    align: "left",
                    dataIndex: "c_name",
                    width: 150,
                }, {
                    header: "หมายเหตุ",
                    sortable: false,
                    align: "left",
                    dataIndex: "c_comment",
                    width: 150,
                }, {
                    header: "สถานะ",
                    sortable: false,
                    align: "left",
                    dataIndex: "i_is_type_tor_name",
                    width: 150,
                }, {
                    header: "ชื่อผู้สร้างรายการ",
                    sortable: false,
                    align: "center",
                    dataIndex: "dc_user_create_id",
                    hidden: true,
                }, {
                    header: "หน่วยงานผู้สร้าง",
                    sortable: false,
                    align: "center",
                    dataIndex: "dc_user_create_cost_id",
                    hidden: true,
                }, {
                    header: "วันที่สร้างรายการ",
                    sortable: false,
                    align: "center",
                    dataIndex: "d_create",
                    hidden: true,
                    renderer: function (val, metaData, record, rowIndex, colIndex, store) {
                        return shortThaiDate(val);
                    },
                }, {
                    header: "ชื่อผู้แก้ไขรายการ",
                    sortable: false,
                    align: "center",
                    dataIndex: "dc_user_update_id",
                }, {
                    header: "หน่วยงานแก้ไขรายการ",
                    sortable: false,
                    align: "center",
                    dataIndex: "dc_user_update_cost_id",
                }, {
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
                title: Ext.title,
                xtype: "grid",
                id: "tabpanel1",
                border: true,
                stripeRows: true,
                loadMask: true,
                //------------------
                layout: "fit",
                clicksToEdit: 2,
                // clicksToEdit: 2,
                viewConfig: {
                    emptyText: "ไม่มีข้อมูล..",
                    deferEmptyText: true
                },
                listeners: {
                    viewready: function (g) {
                        //
                    },
                    // Allow rows to be rendered.
                    beforeedit: function (g,) {
                        if (g.rowIdx == 1)
                            return false;
                    },
                    // Allow rows to be rendered. console.log(value.format('d-m-Y'));
                    afteredit: function (g) {
                        // console.log(g.record.get('d_inv_date').format('d-m-Y'));
                    },
                    beforerender: function (g) {
                        //  ค้นหาข้อมูล
                        //menu.add (
                        //  {
                        //} ).on ( "click" , ( click = function ()
                        //{
                        //} ) ) ;


                        this.contextMenu = new Ext.menu.Menu(
                            {
                                items: [
                                    {
                                        text: "ค้นหาข้อมูล",
                                        icon: "../images/icons/book_magnify.png",
                                        handler: function (e) {
                                            Ext.loadStore("search", false); // app,data.load
                                        },
                                        scope: this,
                                    },
                                    {
                                        text: "เพิ่มข้อมูล",
                                        icon: "../images/icons/add.png",
                                        handler: function (e) {
                                            Ext.loadStore("add", true); // app,data.load
                                        },
                                        scope: this,
                                    }, {
                                        text: "จัดการข้อมูล Edit",
                                        icon: "../images/icons/application_edit.png",
                                        handler: function (e) {
                                            Ext.loadStore("edit", true); // app,data.load
                                        },
                                        scope: this,
                                    }, {
                                        text: "จัดการข้อมูล Delete",
                                        icon: "../images/icons/delete.png",
                                        handler: function (e) {
                                            Ext.loadStore("delete", true); // app,data.load
                                        },
                                        scope: this,
                                    },],
                            });
                    },
                    afterrender: function (g) {
                        //g.getStore().getAt(rowIndex);
                        //  console.log();
                        this.on("cellclick", cellClick, this); //cellClick
                        this.on("contextmenu", function (e, grid, rowIndex, columnIndex) {
                            e.stopEvent();
                            this.contextMenu.showAt(e.getXY());
                        }, this);
                    }
                },
                store: Ext.storeDtl,
                tbar: [menu ? MenuButton() : []],
                columns: colmnn,
                bbar: new Ext.PagingToolbar(
                    {
                        pageSize: 20,
                        store: Ext.storeDtl,
                        displayInfo: true,
                        displayMsg: "Displaying topics {0} - {1} of {2}",
                    }),
            });
            const search = function () {
                var msg = "";
                if (msg == "") {
                    if (Ext.getCmp("value-box").getValue() != "") {
                        Ext.storeDtl.setBaseParam("value", Ext.getCmp("value-box").getValue());
                        Ext.storeDtl.setBaseParam("filter", Ext.getCmp("filter").getValue());
                    }
                    else {
                        Ext.storeDtl.setBaseParam("value", "");
                        Ext.storeDtl.setBaseParam("filter", "");
                    }
                    Ext.storeDtl.setBaseParam("mode", "SEARCH");
                    Ext.storeDtl.load();
                }
                else {
                    Ext.Msg.alert("แจ้งเตือน", msg);
                }
            };
        }), Ext.grid.EditorGridPanel, {});
};
