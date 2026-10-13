/*****************************************************
 * Ext JS Library 3.4.0
 * Copyright(c) 2006-2011 Sencha Inc.
 * licensing@sencha.com
 * http://www.sencha.com/license
 */
/* global Ext */

Ext.AppUx = function (app, menu)
{
    Ext.HDR_ID = null;
    Ext.selectRow = [];
    Ext.selectRow2 = [];
    Ext.menuEditGrid = true;
    Ext.menuRightEditgrid = true;


    Ext.storeDtl = new Ext.data.JsonStore(
            {
                autoDestroy: false,
                autoLoad: true,
                url: "alert/api/alertStatusItems.php",
                baseParams: {
                    type: "list",
                    keyData: Ext.keyData,
                    list: 'all'
                },
                root: "data",
                idProperty: "id",
                totalProperty: "totalCount",
                fields: [{
                        name: "no"
                    }, {
                        name: "id"
                    }, {
                        name: "c_name"
                    }, {
                        name: "i_entrance"
                    }, {
                        name: "sp_type_status_id"
                    }, {
                        name: "sp_type_statusTxt"
                    }, {
                        name: "c_code"
                    }, {
                        name: "i_alarm"
                    }, {
                        name: "i_day"
                    }, {
                        name: "i_seq"
                    }, {
                        name: "i_config"
                    }, {
                        name: "c_comment"
                    }, {
                        name: "js"
                    }, {
                        name: "code_tomenu"
                    }, {
                        name: "i_enabled"
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
            });

    let years = [];
    let currentTime = new Date();
    let now = currentTime.getFullYear() + 1;
    let id = currentTime.getFullYear() - 3;
    while (id <= now)
    {
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
    Ext.keyData = 1; //type data key in
    Ext.title = "ข้อหลักการทำ PA และแจ้งเตือน";
    Ext.poFormID = "grid-form-cheque";
    Ext.poFormSubID = "grid-form-sub";
    Ext.getDate = Ext.apply(
            {
                year: new Date().getFullYear(),
                month: new Date().getMonth() + 1,
                day: new Date().getDay(),
                getNowCarlen: function ()
                {
                    var day = new Date();
                    var dd = day.getDate();
                    var mm = day.getMonth() + 1;
                    var yy = day.getFullYear() + 543;
                    mm = mm < 10 ? "0" + mm : mm;
                    dd = dd < 10 ? "0" + dd : dd;
                    return dd + "-" + mm + "-" + yy;
                },
                defaultDate: function (typeStartDate)
                {
                    var day = new Date();
                    var dd = day.getDate();
                    var mm = day.getMonth() + 1;
                    var yy = day.getFullYear() + 543;
                    if (typeStartDate === 1)
                    {
                        // วันที่เริ่ม -1 เดือน
                        dd = "01";
                        mm = "0" + mm.toString();
                    } else
                    {
                        dd = "0" + dd.toString();
                        mm = "0" + mm.toString();
                    }
                    return dd.substr(-2) + "-" + mm.substr(-2) + "-" + yy.toString();
                },
            });
    // copy text in cell on select row no
    function CopyToClipboard(rec, arrDataCopy)
    {
        var input = rec;
        var textToClipboard = "";
        //text on
        var success = true;
        for (var i = 0; i < arrDataCopy.length; i++)
        {
            textToClipboard += ", " + input.get(arrDataCopy[i]);
        }

        if (window.clipboardData)
        {
            // Internet Explorer
            window.clipboardData.setData("Text", textToClipboard);
        } else
        {
            var forExecElement = CreateElementForExecCommand(textToClipboard);
            SelectContent(forExecElement);
            var supported = true;
            // UniversalXPConnect privilege is required for clipboard access in Firefox
            try
            {
                if (window.netscape && netscape.security)
                {
                    netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
                }
                success = document.execCommand("copy", false, null);
            } catch (e)
            {
                success = false;
            }
            document.body.removeChild(forExecElement);
        }

        if (success)
        {
            console.log("The text is on the clipboard, try to paste it!");
        } else
        {
            console.log("Your browser doesn't allow clipboard access!");
        }
    }
    function CreateElementForExecCommand(textToClipboard, arrDataCopy)
    {
        var forExecElement = document.createElement("div");
        forExecElement.style.position = "absolute";
        forExecElement.style.left = "-10000px";
        forExecElement.style.top = "-10000px";
        forExecElement.textContent = textToClipboard;
        document.body.appendChild(forExecElement);
        forExecElement.contentEditable = true;
        return forExecElement;
    }
    function SelectContent(element)
    {
        // first create a range
        var rangeToSelect = document.createRange();
        rangeToSelect.selectNodeContents(element);
        // select the contents
        var selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(rangeToSelect);
    }
    function cellClick(grid, rowIndex, columnIndex, e)
    {
        Ext.selectRow = this.selModel.selection.record;
    }
    function cellClickSub(grid, rowIndex, columnIndex, e)
    {
        Ext.selectRow2 = this.selModel.selection.record;
        //alert('selectRow2 == cellClickSub');
    }

    Ext.storeType = new Ext.data.JsonStore(
            {
                autoDestroy: false,
                autoLoad: false,
                url: "api/All_spAlert.php",
                baseParams: {
                    type: "sp_type_status"
                },
                root: "data",
                idProperty: "id",
                fields: ["id", "c_name"],
            });
    var AppTemplatex = function () {

        Ext.storeAll = new Ext.data.JsonStore(
                {
                    autoDestroy: false,
                    autoLoad: false,
                    url: "alert/api/mnController.php",
                    baseParams: {
                        mode: "list",
                        type: "list",
                        keyData: Ext.keyData,
                        i_type: Ext.util.Cookies.get('templateConfig')
                    },
                    root: "data",
                    idProperty: "id",
                    totalProperty: "totalCount",
                    fields: [{
                            name: "no"
                        }, {
                            name: "id"
                        }, {
                            name: "c_name"
                        }, {
                            name: "sp_type_status_id"
                        }, {
                            name: "sp_type_statusTxt"
                        }, {
                            name: "c_code"
                        }, {
                            name: "js"
                        }, {
                            name: "code_tomenu"
                        }, {
                            name: "i_entrance"
                        }, {
                            name: "i_alarm"
                        }, {
                            name: "i_day"
                        }, {
                            name: "i_seq"
                        }, {
                            name: "i_config"
                        }, {
                            name: "c_comment"
                        }, {
                            name: "i_enabled"
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
                });
        var colmnn = [new Ext.grid.RowNumberer(
                    {
                        header: "ที่",
                        dataIndex: "no",
                        id: "idID",
                        width: 30,
                        renderer: function (value, metaData, record, row, col, store, gridView)
                        {
                            metaData.attr = "style='cursor:pointer; text-align:center;';";
                            return record.get("no");
                        }
                    }), {
                header: "sys id",
                sortable: false,
                align: "left",
                dataIndex: "id",
                hidden: true,

            }, {
                header: "รหัสกระบวนการ",
                sortable: false,
                align: "left",
                dataIndex: "c_code",
                width: 80,
                editor: new Ext.form.TextField({})
            }, {
                header: "Next Code Menu",
                sortable: false,
                align: "center",
                dataIndex: "code_tomenu",
                width: 80,
                editor: new Ext.form.TextField({})
            }, {
                header: "กระบวนการ",
                sortable: false,
                align: "left",
                dataIndex: "c_name",
                id: 'c_nameID',
                width: 200,
                editor: new Ext.form.TextField({})


            }, {
                header: "ประเภทของการแจ้งเตือนและPA",
                sortable: false,
                align: "left",
                dataIndex: "sp_type_status_id",
                width: 200,
                editor: new Ext.form.ComboBox({
                    mode: "local",
                    id: "editor_sp_type_status_id",
                    store: Ext.storeType,
                    valueField: "id",
                    displayField: "c_name",
                    triggerAction: "all",
                    forceSelection: true,
                    selectOnFocus: true,
                    typeAhead: false,
                    emptyText: "กรุณาเลือก...",
                    listeners: {
                        beforerender: function () {
                            //  alert('Start');
                        },
                        afterrender: function () {
                            // this.fn = function () {};
                            //  alert('End');
                        },
                        Change: function () {
                            //  this.fn(); 
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
                })
            }, {
                header: "ลำดับ",
                sortable: false,
                align: "center",
                dataIndex: "i_seq",
                width: 80,
                editor: new Ext.form.TextField({})
            }, {
                header: "ประเภทการทำงาน",
                sortable: false,
                align: "center",
                dataIndex: "i_config",
                width: 80,
                editor: new Ext.form.TextField({})
            }, {
                header: "วันแจ้งเตือน Alert",
                sortable: false,
                align: "center",
                dataIndex: "i_alarm",
                width: 80,
                editor: new Ext.form.TextField({})

            }, {
                header: "วันดำเนินการ PA",
                sortable: false,
                align: "center",
                dataIndex: "i_day",
                width: 80,
                editor: new Ext.form.TextField({})

            }, {
                header: "สถานะส่งเมนู เข้า/ออก",
                sortable: false,
                align: "center",
                dataIndex: "i_entrance",
                width: 120,
                editor: new Ext.form.TextField({})
            }, {
                header: "js front-end",
                sortable: false,
                align: "left",
                dataIndex: "js",
                width: 80,
                editor: new Ext.form.TextField({})

            }
        ];

        var typeTor = new Ext.form.ComboBox(
                {
                    mode: "local",
                    id: 'typeID',
                    store: Ext.storeType,
                    fieldLabel: "วิธีดำเนินงาน",
                    submitValue: true,
                    hiddenName: "tor_type_id",
                    name: "tor_type_idTxt",
                    valueField: "id",
                    displayField: "c_name",
                    triggerAction: "all",
                    forceSelection: true,
                    selectOnFocus: true,
                    modal: true,
                    typeAhead: true,
                    emptyText: "กรุณาเลือก",
                    listeners: {
                        afterrender: function ()
                        {
                            this.fn = function (i)
                            {

                                Ext.util.Cookies.set('templateConfig', i);
                                Ext.storeAll.setBaseParam("i_type", i);
                                Ext.storeAll.load({
                                    callback: function (record, operation, success)
                                    {
                                        if (success)
                                        {
                                            Ext.getCmp('typeID').setValue(i);

                                        }
                                    }
                                });

                            };
                            this.fn(Ext.util.Cookies.get('templateConfig'));
                        },

                        beforequery: function (q)
                        {
                            if (q.query)
                            {
                                var length = q.query.length;
                                q.query = new RegExp(Ext.escapeRe(q.query));
                                q.query.length = length;
                            }
                        },
                        change: function (combo, nV)
                        {
//                             this.getStore().clearFilter();
                            this.fn(this.getValue());
                        }
                    }
                });

        return new Ext.Window({
            listeners: {'close': function (win) {
                    Ext.util.Cookies.set('statusx', 'close');
                }
            },
            collapsible: true,
            maximizable: true,
            title: "ตั้งค่าวิธีการดำเนินงาน",
            id: "winAppTemplateID",
            modal: true,
            plain: true,
            buttonAlign: 'left',
            height: 500,
            width: 800,
            layout: "fit",
            items: [new Ext.FormPanel(
                        {
                            columnWidth: 1,
                            url: "alert/api/mnController.php",
                            id: 'subFromID',
                            layout: "form",
                            frame: true,
                            autoScroll: true,
                            labelAlign: "left",
                            bodyStyle: "padding:1px",
                            labelWidth: 120,
                            items: [{
                                    xtype: 'hidden',
                                    name: 'mode',
                                    id: 'modeID',
                                    value: 'EDIT'
                                }, {
                                    xtype: 'hidden',
                                    name: 'gridModifine',
                                    id: 'gridModifineID'
                                },
                                typeTor, new Ext.grid.EditorGridPanel({
                                    id: 'gridSubID',
                                    xtype: "grid",
                                    height: 500,
                                    border: true,
                                    stripeRows: true,
                                    loadMask: true,
                                    store: Ext.storeAll,
                                    clicksToEdit: 2,
                                    viewConfig: {
                                        emptyText: "ไม่มีข้อมูล..",
                                        deferEmptyText: true
                                    },
                                    listeners: {
                                        beforerender: function () {

                                        },
                                        afterrender: function () {

                                            Ext.getCmp('gridSubID').on("cellclick", cellClickSub, this);
                                        }
                                    },
                                    columns: colmnn
                                            // autoExpandColumn: 'c_nameID'
                                }), {
                                    xtype: 'panel',
                                    html: '<div style="font-weight:bold;color:red;padding:0px 0px 0px 10px;">'
                                            + '<p> * 1 ALERT แจ้งเตือนวันที่ที่บันทึกสถานะนับจากวันถัดไป</p>'
                                            + '<p> * 2 PA น้บจากวันถัดไปของการทึกสถานะ</p>'
                                            + '<p> * 3 BOTH ALERT && PA </p>'

                                            + '</div>'

                                }

                            ],
                            listeners: {
                                beforerender: function () {
                                    //console.log('constructor');
                                },
                                afterrender: function () {
                                    // console.log('startup');
                                }
                            }
                        })],
            buttons: [{
                    text: 'บันทึกเพื่อตั้งค่าใช้ในการคิด PA',
                    handler: function ()
                    {
                        Ext.Ajax.request({
                            url: "alert/api/mnController.php",
                            method: "POST",
                            params: {
                                mode: 'SAVETHEMPLATE',
                                bg_year: new Date().dateFormat("Y-m-d")
                            },
                            success: function (result, request) {
                                var jsonData = Ext.util.JSON.decode(result.responseText); // decode json
                                if (jsonData.success === "Success") {
                                    Ext.MessageBox.alert("Success", jsonData.msg); // alert massage success
                                }

                            },
                            failure: function (result, request) {
                                Ext.MessageBox.alert("Failed", result.responseText); // connect error
                            }
                        });
                    }
                },
                {
                    text: "ทำรายการ",
                    id: "buSaveSubID",
                    iconCls: "icon-save",
                    listeners: {
                        afterrender: function ()
                        {},
                    },
                    handler: function ()
                    {
                        var formSubmit = function ()
                        {
                            form.submit(
                                    {
                                        waitMsg: "Saving Data...",
                                        success: function (form, action)
                                        {
                                            Ext.Msg.alert("Success", action.result.msg, function (form, action)
                                            {
                                                Ext.getCmp("tabpanel1").getStore().reload();
                                                Ext.selectRow = null;
                                                Ext.getCmp("winAppTemplateID").hide();
                                                Ext.getCmp("winAppTemplateID").destroy();
                                            });
                                        },
                                        failure: function (form, action)
                                        {
                                            switch (action.failureType)
                                            {
                                                case Ext.form.Action.CLIENT_INVALID:
                                                    Ext.Msg.alert("Failure", "Form fields may not be submitted with invalid values");
                                                    break;
                                                case Ext.form.Action.CONNECT_FAILURE:
                                                    Ext.Msg.alert("Failure", "พลข้อผิดพลาดในการเชื่อต่อเครือข่าย");
                                                    break;
                                                case Ext.form.Action.SERVER_INVALID:
                                                    Ext.Msg.alert("Failure", action.result.msg);
                                            }
                                        }
                                    });
                        };

                        var form = Ext.getCmp('subFromID').getForm();
                        if (form.isValid())
                        {
                            var jsonArr = [];
                            Ext.getCmp('gridSubID').getStore().modified.forEach(function (v)
                            {
                                jsonArr.push(
                                        {
                                            id: v.get('id'),
                                            type_id: v.get('sp_type_status_id'),
                                            c_code: v.get('c_code'),
                                            c_name: v.get('c_name'),
                                            i_alarm: v.get('i_alarm'),
                                            code_tomenu: v.get('code_tomenu'),
                                            i_entrance: v.get('i_entrance'),
                                            i_day: v.get('i_day'),
                                            js: v.get('js'),
                                            i_seq: v.get('i_seq'),
                                            i_config: v.get('i_config')
                                        });
                            });
                            Ext.getCmp('modeID').setValue('EDITLOOP');
                            Ext.getCmp("gridModifineID").setValue(JSON.stringify(jsonArr));
                            formSubmit(form);
                        } //isValid
                    }
                    //haddler
                }, {
                    text: 'ลบข้อมูลรายการ',
                    handler: function ()
                    {
                        if (Ext.isEmpty(Ext.selectRow2))
                            alert('select row before romove record');
                        else
                            Ext.Msg.show({
                                title: 'แจ้งเตือน!',
                                msg: 'คุณต้องการลบสถานะการดำเนินงานใช่หรือไม่ ? ID => ' + Ext.selectRow2.get('id'),
                                width: 400,
                                buttons: Ext.MessageBox.YESNO,
                                fn: function (btn, text) {
                                    if (btn === 'yes') {
                                        //  alert('Removed ID => ' + Ext.selectRow2.get('id'));

                                        Ext.Ajax.request({
                                            url: "alert/api/mnController.php",
                                            method: "POST",
                                            params: {
                                                mode: 'DELETE',
                                                id: Ext.selectRow2.get('id')
                                            },
                                            success: function (result, request) {
                                                var jsonData = Ext.util.JSON.decode(result.responseText); // decode json
                                                if (jsonData.success === "Success") {
                                                    Ext.MessageBox.alert("Success", jsonData.msg); // alert massage success
                                                } else {
                                                    Ext.MessageBox.alert("Failed", jsonData.msg); // alert massage error
                                                }
                                                Ext.getCmp("winAppTemplateID").hide();
                                                Ext.getCmp("winAppTemplateID").destroy();
                                                Ext.util.Cookies.set('statusx', 'close');

                                            },
                                            failure: function (result, request) {
                                                Ext.MessageBox.alert("Failed", result.responseText); // connect error
                                            }
                                        });
                                    } else {
                                        null;
                                    }
                                },
                                icon: Ext.MessageBox.ERROR
                            });


                    }
                }, {
                    text: Ext.GLOBAL_BU_BACK_TH,
                    handler: function ()
                    {
                        Ext.getCmp("winAppTemplateID").hide();
                        Ext.getCmp("winAppTemplateID").destroy();
                        Ext.util.Cookies.set('statusx', 'close');
                    }
                }]
        });
    }//End if
    //interlizing
    var AppPoStore = function (statusx)
    {
        var disp = false ? 'displayfield' : 'textfield';


        return new Ext.Window(
                {
                    collapsible: true,
                    maximizable: true,
                    title: "บันทึก TOR",
                    frame: true,
                    width: 1000,
                    id: "winChequeID",
                    height: 800,
                    minWidth: 850,
                    minHeight: 450,
                    layout: "frame",
                    modal: true,
                    plain: true,
                    bodyStyle: "padding:1px;",
                    buttonAlign: "center",
                    items: new Ext.FormPanel(
                            {
                                id: Ext.poFormID,
                                columnWidth: 1,
                                url: "api/mnController.php",
                                frame: true,
                                labelAlign: "left",
                                bodyStyle: "padding:1px",
                                labelWidth: 150,
                                listeners: {
                                    afterrender: function () {
                                        if (statusx !== 'add') {
                                            this.getForm().loadRecord(Ext.selectRow);
                                            Ext.HDR_ID = Ext.selectRow.data.id;
                                        }

                                    }
                                },
                                items: [{
                                        xtype: disp,
                                        fieldLabel: 'รหัส',
                                        name: 'c_code',
                                        readOnly: true

                                    }, {
                                        xtype: disp, anchor: "50%  ",
                                        fieldLabel: 'สถานะประเภทการดำเนินงาน',
                                        name: 'sp_type_statusTxt',
                                        readOnly: true
                                    }, {
                                        xtype: disp, anchor: "50%  ",
                                        fieldLabel: 'สถานะการดำเนินงาน',
                                        name: 'c_name'
                                    }, {

                                        xtype: "buttongroup",
                                        fieldLabel: "จำนวนวันที่ดำเนินงาน",
                                        frame: false,
                                        border: false,
                                        items: [{
                                                xtype: "textfield",
                                                fieldLabel: "วันที่ดำเนินงาน",
                                                name: "i_day",
                                                id: "i_dayID",
                                                listeners: {
//                                                     blur: function ()
//                                                     {
//                                                         var f_total = parseFloat(this.getValue().replace(/,/g, "") / 1);
//                                                         this.setValue(Ext.floatRenderer(f_total));
//                                                     },
                                                },
                                                style: {
                                                    width: "100px",
                                                    labelAlign: "right",
                                                    "font-weight": "bold",
                                                    padding: "1px",
                                                    margin: "1px",
                                                    color: "blue",
                                                    "background-color": "#fff",
                                                    "text-align": "right",
                                                }
                                            }]

                                    }
                                ],
                                buttons: [
                                    {
                                        text: "ทำรายการ TOR",
                                        id: "buSaveSubID",
                                        iconCls: "icon-save",
                                        listeners: {
                                            afterrender: function ()
                                            {},
                                        },
                                        handler: function ()
                                        {
                                            var formSubmit = function ()
                                            {
                                                form.submit(
                                                        {
                                                            waitMsg: "Saving Data...",
                                                            success: function (form, action)
                                                            {
                                                                Ext.Msg.alert("Success", action.result.msg, function (form, action)
                                                                {
                                                                    //  Ext.getCmp("tabpanel1").getStore().reload();
                                                                    //  Ext.selectRow = null;
                                                                    //  Ext.getCmp("winChequeID").hide();
                                                                    //  Ext.getCmp("winChequeID").destroy();
                                                                });
                                                            },
                                                            failure: function (form, action)
                                                            {
                                                                switch (action.failureType)
                                                                {
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
                                            };
                                            var form = Ext.getCmp(Ext.poFormID).getForm();
                                            formSubmit(form);
//                                             if (form.isValid())
//                                             {
//                                                 if (Ext.getCmp("modesubID").getValue().inputValue === "VIEW")
//                                                 {
//                                                 } else if (Ext.getCmp("modesubID").getValue().inputValue === "DELETE")
//                                                 {
//                                                     Ext.MessageBox.show(
//                                                             {
//                                                                 title: "Icon Support",
//                                                                 msg: "คุณต้องการที่จะลบ รายการที่เลือกนี้ใช่ใหม ?",
//                                                                 buttons: Ext.MessageBox.OKCANCEL,
//                                                                 icon: Ext.MessageBox.WARNING,
//                                                                 fn: function (btn)
//                                                                 {
//                                                                     if (btn === "ok")
//                                                                     {
//                                                                         formSubmit(form);
//                                                                     } else
//                                                                     {
//                                                                         return;
//                                                                     }
//                                                                 },
//                                                             });
//                                                 } else
//                                                 {
//                                                     formSubmit(form);
//                                                 }
//                                             } //isValid
                                        },
                                        //haddler
                                    }, {
                                        text: Ext.GLOBAL_BU_BACK_TH,
                                        handler: function ()
                                        {
                                            Ext.getCmp("winChequeID").hide();
                                            Ext.getCmp("winChequeID").destroy();
                                        },
                                    }, ],
                            }),
                    listeners: {
                        afterrender: function ()
                        {},
                    },
                });
    };//AppPoStore
    Ext.storeMini = new Ext.data.JsonStore(
            {
                autoDestroy: false,
                autoLoad: true,
                url: "alert/api/listStatus.php",
                baseParams: {
                    type: "sp_themplate_config",
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
                                name: "sp_status_type_config_id"
                            }, {
                                name: "c_name"
                            }, {
                                name: "c_detail"
                            }, {
                                name: "bg_yyyy"
                            }, {
                                name: "start_date"
                            }, {
                                name: "end_date"

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
    Ext.extend(
            (gridMini = function () {
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

                    }, {
                        header: "ชื่อรายการ",
                        sortable: false,
                        align: "left",
                        dataIndex: "c_name",
                        width: 150,
                    }, {
                        header: "รายละเอียด",
                        sortable: false,
                        align: "left",
                        dataIndex: "c_detail",
                        width: 150,
                    }, {
                        header: "วันที่เริ่มใช้งาน",
                        sortable: false,
                        align: "center",
                        dataIndex: "start_date",

                        renderer: function (val, metaData, record, rowIndex, colIndex, store) {
                            return shortThaiDate(val);
                        }
                    }, {
                        header: "วันที่สิ้นสุด",
                        sortable: false,
                        align: "center",
                        dataIndex: "end_date",

                        renderer: function (val, metaData, record, rowIndex, colIndex, store) {
                            return shortThaiDate(val);
                        },
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
                gridMini.superclass.constructor.call(this, {
                    region: "center",
                    title: "ข้อมูลที่เคยบันทึก",
                    xtype: "grid",
                    id: "tabMini",
                    border: true,
                    stripeRows: true,
                    loadMask: true,
                    //------------------
                    layout: "fit",
                    defaults: {flex: 1}, //auto stretch
                    layoutConfig: {align: 'stretch'},

                    enableDragDrop: true,
                    viewConfig: {
                        emptyText: "ไม่มีข้อมูล..",
                        deferEmptyText: true
                    },
                    listeners: {
                        viewready: function (g) {
                            //
                        },
                        // Allow rows to be rendered.
                        beforeedit: function (g, ) {
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
                                                    // app,data.load

                                                },
                                                scope: this,
                                            }, {
                                                text: "จัดการข้อมูล Delete",
                                                icon: "../images/icons/delete.png",
                                                handler: function (e) {
                                                    Ext.loadStore("delete", true); // app,data.load
                                                },
                                                scope: this,
                                            }, ],
                                    });
                        },
                        afterrender: function (g) {
                            //g.getStore().getAt(rowIndex);
                            //  console.log();
                            this.on("cellclick", function cellClick(grid, rowIndex, columnIndex, e)
                            {
                                var record = grid.getStore().getAt(rowIndex);
                                Ext.getCmp('saveThemplateID').getForm().loadRecord(record);
                            }, this); //cellClick
                            this.on("contextmenu", function (e, grid, rowIndex, columnIndex) {
                                e.stopEvent();
                                this.contextMenu.showAt(e.getXY());
                            }, this);
                        }
                    },
                    store: Ext.storeMini,
                    columns: colmnn,
                    bbar: new Ext.PagingToolbar(
                            {
                                pageSize: 20,
                                store: Ext.storeMini,
                                displayInfo: true,
                                displayMsg: "Displaying topics {0} - {1} of {2}",
                            })
                });

            }), Ext.grid.GridPanel, {});
    Ext.loadStore = function (status, show)
    {
        var statusx = status;
        Ext.util.Cookies.set('statusx', (Ext.isEmpty(Ext.util.Cookies.get('statusx')) ? 'load' : Ext.util.Cookies.get('statusx')));
        if (status === "edit" && Ext.isEmpty(Ext.selectRow)) {
            Ext.Msg.alert("แจ้งเตือน", "กรุณา click เลือกข้อมูลที่จะแก้ไขใน data grid", function (form, action)
            {
                return false;
            });
        } else if (statusx === "load") {

        } else if (statusx === "add")
        {
            Ext.HDR_ID = null;
            alert(statusx);
            //AppPoStore(statusx).show();
        } else if (statusx === "edit")
        {
            // AppPoStore(statusx).show();
            Ext.getCmp('saveThemplateID').getForm().loadRecord(Ext.selectRowMini);

//             alert(statusx);
        } else if (statusx === "configThemplate") {
            Ext.storeType.load({
                callback: function (record, operation, success)
                {
                    if (success)
                    {
                        AppTemplatex().show();
                    }
                }
            });
        } else if (statusx === "saveconfigThemplate") {

            var frm = new Ext.FormPanel(
                    {
                    
                        url: "alert/api/mnControllerConfig.php",
                        id: 'saveThemplateID',
                        layout: "form",
                        frame: true,
                        autoScroll: true,
                        labelAlign: "left",
                        bodyStyle: "padding:1px",
                        labelWidth: 120,
                        height: 500,
                        items: [{
                                xtype: 'textfield', anchor: "80%  ",
                                fieldLabel: 'ชื่อการตั้งค่า',
                                name: 'c_name'
                            }, {
                                xtype: 'textarea', anchor: "80%  ",
                                fieldLabel: 'รายละเอียดการตั้งค่า',
                                name: 'c_detail'
                            }, new Ext.form.ComboBox({
                                mode: "local",
                                fieldLabel: "ใช้เงินปีงบประมาณ",
                                submitValue: true,
                                hiddenName: "i_yyyy",
                                name: "i_year",
                                width: 120,
                                store: Ext.store_year,
                                valueField: "id",
                                displayField: "c_name",
                                value: Ext.bgYear,
                                triggerAction: "all",
                                forceSelection: true,
                                selectOnFocus: true,
                                typeAhead: false,
                                emptyText: "กรุณาเลือกปีงบประมาณ...",
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
                            }), {
                                xtype: "compositefield",
                                fieldLabel: "วีนที่เริ่มใช้งาน",
                                msgTarget: "under",
                                items: [
                                    {
                                        xtype: "datefield",
                                        id: "d_date_start",
                                        width: 127,
                                        value: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                                    },
                                    {
                                        xtype: "displayfield",
                                        value: "ถึง",
                                        width: 36,
                                        align: "center",
                                    },
                                    {
                                        xtype: "datefield",
                                        id: "d_date_end",
                                        width: 127,
                                        value: addY(543),
                                    }
                                ]
                            }], buttonAlign: 'left',
                        buttons: [{
                                text: "ทำรายการ",
                                id: "buSaveThempSubID",
                                iconCls: "icon-save",

                                handler: function ()
                                {
                                    var formSubmit = function ()
                                    {
                                        form.submit(
                                                {
                                                    waitMsg: "Saving Data...",
                                                    success: function (form, action)
                                                    {
                                                        Ext.Msg.alert("Success", action.result.msg, function (form, action)
                                                        {
                                                            Ext.getCmp("tabpanel1").getStore().reload();
                                                            Ext.selectRow = null;
                                                            Ext.getCmp("winAppTemplateID").hide();
                                                            Ext.getCmp("winAppTemplateID").destroy();
                                                        });
                                                    },
                                                    failure: function (form, action)
                                                    {
                                                        switch (action.failureType)
                                                        {
                                                            case Ext.form.Action.CLIENT_INVALID:
                                                                Ext.Msg.alert("Failure", "Form fields may not be submitted with invalid values");
                                                                break;
                                                            case Ext.form.Action.CONNECT_FAILURE:
                                                                Ext.Msg.alert("Failure", "พลข้อผิดพลาดในการเชื่อต่อเครือข่าย");
                                                                break;
                                                            case Ext.form.Action.SERVER_INVALID:
                                                                Ext.Msg.alert("Failure", action.result.msg);
                                                        }
                                                    }
                                                });
                                    };
                                    var form = Ext.getCmp('saveThemplateID').getForm();
                                    if (form.isValid())
                                    {
                                        var jsonArr = [];
                                        Ext.getCmp('gridSubID').getStore().modified.forEach(function (v)
                                        {
                                            jsonArr.push(
                                                    {
                                                        id: v.get('id'),
                                                        type_id: v.get('sp_type_status_id'),
                                                        c_code: v.get('c_code'),
                                                        c_name: v.get('c_name'),
                                                        i_alarm: v.get('i_alarm'),
                                                        code_tomenu: v.get('code_tomenu'),
                                                        i_entrance: v.get('i_entrance'),
                                                        i_day: v.get('i_day'),
                                                        js: v.get('js'),
                                                        i_seq: v.get('i_seq'),
                                                        i_config: v.get('i_config')
                                                    });
                                        });
                                        Ext.getCmp('modeID').setValue('EDITLOOP');
                                        Ext.getCmp("gridModifineID").setValue(JSON.stringify(jsonArr));
                                        formSubmit(form);
                                    } //isValid
                                }
                                //haddler
                            }, {
                                text: Ext.GLOBAL_BU_BACK_TH,
                                handler: function ()
                                {
                                    Ext.getCmp("windsaveThemplateID").hide();
                                    Ext.getCmp("windsaveThemplateID").destroy();
                                    Ext.util.Cookies.set('statusx', 'close');
                                }
                            }]
                    });

            var win = new Ext.Window({
                listeners: {'close': function (win) {
                        Ext.util.Cookies.set('statusx', 'close');
                    }
                },
                collapsible: true,
                maximizable: true,
                title: "บันทีกค่าการทำงานประจำปีงบประมาณ",
                id: "windsaveThemplateID",
                modal: true,
                plain: true,
                buttonAlign: 'left',
                height: 500,
                width: 1200,
                // items: frm 
                items: [
                    {
                        layout: "column",
                        border: false,
                        items: [
                            {
                                columnWidth: 0.6,
                                layout: "form",
                                border: false,
                                items: [{
                                        xtype: 'panel',
                                        id: 'panelID',
                                        layout: 'fit', height: 500,
                                        items: new gridMini()
                                    }],
                            },
                            {
                                columnWidth: 0.4,
                                layout: "form", border: false,
                                id: 'frmID',
                                items: [frm],

                            }
                        ], listeners: {
                            //WindowResize
                            beforerender: function () {
                                this.onWindowResize = function () {
                                    console.log("ok");
                                    Ext.getCmp("panelID").setHeight(Ext.getCmp("windsaveThemplateID").getSize().height - 30);
                                    Ext.getCmp("saveThemplateID").setHeight(Ext.getCmp("windsaveThemplateID").getSize().height - 30);
                                };
                            },
                            afterrender: function () {
                                Ext.getCmp("panelID").setHeight(Ext.getCmp("windsaveThemplateID").getSize().height - 30);
                                Ext.getCmp("saveThemplateID").setHeight(Ext.getCmp("windsaveThemplateID").getSize().height - 30);
                                Ext.getCmp("windsaveThemplateID").on("resize", this.onWindowResize, this);
                            }
                        }
                    }]
            }).show();
        }
        Ext.util.Cookies.set('statusx', statusx);
    }; //Ext.loadStore

    var MenuButton = function ()
    {
        // show Menu Edit Grid
        var editm = Ext.menuEditGrid;
        var menu = new Ext.menu.Menu(
                {
                    id: "mainMenu",
                    border: false,
                    style: {
                        overflow: "visible"
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
        //    รายการเมนู
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
        menu.addSeparator();
        //  เพิ่มข้อมูล
        menu.add(
                {
                    text: "ค้นหาข้อมูล",
                    icon: "../images/icons/book_magnify.png",
                }).on("click", (click = function ()
        {
//             Ext.loadStore("search", false); // app,data.load
        }));
        //  config
        menu.add({
            text: "ตั้งค่ารายการดำเนินงาน View Themplate",
            icon: "../images/icons/application_view_tile.png"
        }).on("click", (click = function () {
            Ext.loadStore("configThemplate"); // app,data.load
        }));
        //  เพิ่มข้อมูล
        menu.add({
            text: "บันทึกค่า config ประจำปีงบประมาณ",
            icon: "../images/icons/add.png"
        }).on("click", (click = function () {
            Ext.loadStore("saveconfigThemplate"); // app,data.load
        }));


        tb.doLayout();
        return tb;
    }; //MenuButton
    Ext.gridMainfn = function (editAbled)
    {
        if (!Ext.isEmpty(Ext.getCmp("tabpanel1")))
            Ext.getCmp("contenterCenter").remove(Ext.getCmp("tabpanel1"), true) || {};

        var gridMains = new gridMain();
        Ext.getCmp("contenterCenter").add(gridMains);
        Ext.getCmp("contenterCenter").setActiveTab(gridMains);
        Ext.getCmp("tabpanel1").on("beforeedit", function ()
        {
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
            (searchGrid = function ()
            {
                var mnController = "reg/controller/mnPoWorkingHdrBegin.php";
                //classOverride
                searchGrid.superclass.constructor.call(this, {
                    initComponent: function ()
                    {
                        searchGrid.superclass.initComponent.call(this);
                        this.fn(this);
                        /*console.log('Loading...');*/
                    },
                    listeners: {
                        afterrender: function (obj, eOpts)
                        {
                            /*console.log('Load Finish');*/
                        },
                    }, // private

                    fn: function ()
                    {},
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
                                afterrender: function ()
                                {
                                    this.hide();
                                },
                            },
                            handler: function ()
                            {
                                var formSubmit = function ()
                                {
                                    form.submit(
                                            {
                                                waitMsg: "Saving Data...",
                                                success: function (form, action)
                                                {
                                                    Ext.Msg.alert("Success", action.result.msg, function (form, action)
                                                    {
                                                        Ext.getCmp("tabpanel1").getStore().reload();
                                                        Ext.getCmp("winChequeID").hide();
                                                        Ext.getCmp("winChequeID").destroy();
                                                    });
                                                },
                                                failure: function (form, action)
                                                {
                                                    switch (action.failureType)
                                                    {
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
                                var saveDtl = function (mode)
                                {
                                    let msg = "";
                                    let jsonArr = [];
                                    let sto = Ext.getCmp("tabpanel1").store.data.items;
                                    sto.forEach(function (v)
                                    {
                                        //d_audit_date d_approve_date d_doc_date d_inv_date
                                        jsonArr.push(
                                                {
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
                                if (form.isValid())
                                {
                                    Ext.MessageBox.show(
                                            {
                                                title: "Icon Support",
                                                msg: "คุณต้องการที่จะบันทึกข้อมูลใน Data Grid ใช่ใหม ?",
                                                buttons: Ext.MessageBox.OKCANCEL,
                                                icon: Ext.MessageBox.WARNING,
                                                fn: function (btn)
                                                {
                                                    if (btn === "ok")
                                                    {
                                                        //TODO @ setGridDirty to idCmp
                                                        saveDtl();
                                                    } else
                                                    {
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
                            handler: function ()
                            {
                                search();
                            },
                        }, {
                            text: "เริ่มใหม",
                            iconCls: "icon-reset",
                            handler: function ()
                            {
                                Ext.getCmp("frm-grid-searchID").getForm().reset();
                            },
                        }, ],
                });
            }), Ext.FormPanel, {});
    /////////////////// gridMain
    Ext.extend(
            (gridMain = function ()
            {
                var colmnn = [
                    new Ext.grid.RowNumberer(
                            {
                                header: "ที่",
                                dataIndex: "no",
                                id: "idID",
                                width: 30,
                                renderer: function (value, metaData, record, row, col, store, gridView)
                                {
                                    metaData.attr = "style='cursor:pointer; text-align:center;';";
                                    return record.get("no");
                                },
                            }), {
                        header: "sys id",
                        sortable: false,
                        align: "left",
                        dataIndex: "id",
                        hidden: true,

                    }, {
                        header: "รหัสกระบวนการ",
                        sortable: false,
                        align: "left",
                        dataIndex: "c_code",
                        width: 80,
                    }, {
                        header: "ประเภทของการแจ้งเตือนและPA",
                        sortable: false,
                        align: "left",
                        dataIndex: "sp_type_statusTxt",
                        width: 150,
                    }, {
                        header: "กระบวนการ",
                        sortable: false,
                        align: "left",
                        dataIndex: "c_name",
                        width: 150,
                    }, {
                        header: "วันดำเนินการ",
                        sortable: false,
                        align: "center",
                        dataIndex: "i_day",
                        width: 80,
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
                        renderer: function (val, metaData, record, rowIndex, colIndex, store)
                        {
                            return shortThaiDate(val);
                        },
                    }, {
                        header: "ชื่อผู้แก้ไขรายการ",
                        sortable: false,
                        align: "left",
                        width: 160,
                        dataIndex: "dc_user_update_id",
                    }, {
                        header: "หน่วยงานแก้ไขรายการ",
                        align: "left",
                        width: 160,
                        dataIndex: "dc_user_update_cost_id",
                    }, {
                        header: "วันที่แก้ไขรายการ",
                        sortable: false,
                        align: "center",
                        dataIndex: "d_update",
                        renderer: function (val, metaData, record, rowIndex, colIndex, store)
                        {
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
                        viewready: function (g)
                        {
                            //

                        },
                        // Allow rows to be rendered.
                        beforeedit: function (g, )
                        {

                            if (g.rowIdx == 1)
                                return false;
                        },
                        // Allow rows to be rendered. console.log(value.format('d-m-Y'));
                        afteredit: function (g)
                        {
                            // console.log(g.record.get('d_inv_date').format('d-m-Y'));
                        },
                        beforerender: function (g)
                        {

                            this.contextMenu = new Ext.menu.Menu(
                                    {
                                        items: [
                                            {
                                                text: "ค้นหาข้อมูล",
                                                icon: "../images/icons/book_magnify.png",
                                                handler: function (e)
                                                {
//                                                     Ext.loadStore("add", true); // app,data.load
                                                },
                                                scope: this,
                                            }, {
                                                text: "เพิ่มข้อมูล",
                                                icon: "../images/icons/add.png",
                                                handler: function (e)
                                                {
                                                    Ext.loadStore("add", true); // app,data.load
                                                },
                                                scope: this,
                                            }, {
                                                text: "จัดการข้อมูล View/Copy/Edit/Delete",
                                                icon: "../images/icons/application_edit.png",
                                                handler: function (e)
                                                {
                                                    Ext.loadStore("edit", true); // app,data.load
                                                },
                                                scope: this,
                                            }, {
                                                text: "คัดลอกข้อมูลใน copy data in cell grid",
                                                icon: "../images/icons/page_copy.png",
                                                handler: function (e)
                                                {
                                                    //field
                                                    var arrDataCopy = ["c_detail", "c_code_ref", "po_creditor_name"];
                                                    var rowx = Ext.selectRow;

                                                    if (!Ext.isEmpty(rowx) && !Ext.isEmpty(arrDataCopy))
                                                        //if Ctlr+c
                                                        CopyToClipboard(rowx, arrDataCopy);
                                                },
                                                scope: this,
                                            }, ],
                                    });
                        },
                        afterrender: function (g)
                        {
                            //g.getStore().getAt(rowIndex);
                            //  console.log();

                            this.on("cellclick", cellClick, this); //cellClick
                            this.on("contextmenu", function (e, grid, rowIndex, columnIndex)
                            {
                                e.stopEvent();
                                this.contextMenu.showAt(e.getXY());
                            }, this);

                        }
                    },
                    store: Ext.storeDtl,
                    tbar: [menu ? MenuButton() : [], '->',
                        new Ext.form.TwinTriggerField({
                            xtype: 'twintriggerfield',
                            trigger1Class: 'x-form-clear-trigger',
                            trigger2Class: 'x-form-search-trigger',
                            onTrigger1Click: function ( ) {
                                alert(1);
                                Ext.getCmp("gridID").getSelectionModel( ).selectRow(2);
                            }, onTrigger2Click: function ( ) {
                                alert(2);
                                Ext.getCmp("gridID").getSelectionModel( ).selectRow(0);
                            }
                        })],
                    columns: colmnn,
                    bbar: new Ext.PagingToolbar(
                            {
                                pageSize: 20,
                                store: Ext.storeDtl,
                                displayInfo: true,
                                displayMsg: "Displaying topics {0} - {1} of {2}",
                            })
                });
            }), Ext.grid.EditorGridPanel, {});

    ///////////////// EditorGridPanel

    const search = function ()
    {
        var msg = "";
        if (msg === "")
        {
            Ext.storeDtl.setBaseParam("mode", "SEARCH");
            Ext.storeDtl.setBaseParam("filter", Ext.getCmp("filter-ID").getValue());
            Ext.storeDtl.setBaseParam("value", Ext.getCmp("val-ID").getValue());
            Ext.storeDtl.setBaseParam("userid", Ext.getCmp("userid-ID").getValue());
            Ext.getCmp("tabpanel1").getStore().load();
        } else
        {
            Ext.Msg.alert("แจ้งเตือน", msg);
        }
    };
};
