/* global Ext, user_right_add, user_right_edit, user_right_delete */
Ext.AppUx = function (app, menu) {
    GenCode_ = function () {

        var date_Ymd = parseInt(Ext.util.Format.date(Ext.getCmp("d_due_dateID").getValue(), "Y")) + 543;
        var date_Ym = Ext.util.Format.date(Ext.getCmp("d_due_dateID").getValue(), "m");
        var date_dd = Ext.util.Format.date(Ext.getCmp("d_due_dateID").getValue(), "d");

//        console.log(date_Ymd);
//        console.log(date_dd);
//        return false;

        var msg = "";
        if (msg == "") {
            Ext.Ajax.request({
                url: "tor/api/mnContractCode.php",
                method: "POST",
                params: {
                    mode: "GENCODESUB",
                    id: Ext.HDR_ID,
                    sp_po_id: Ext.SP_PO_ID,
                    i_type_0: Ext.selectRow.data.i_purchase,
                    ym_0: date_Ymd,
                    dd_0: date_dd,
                    sp_typ_id_0: Ext.selectRow.data.tor_type_id,
                    bg_type_id_0: Ext.selectRow.data.dc_expense_budget_type_id,
                    contract_type_0: Ext.selectRow.data.i_type_fix_rate == 0 ? 1 : 2,
                },
                success: function (result, request) {
//                Ext.storeDtl.setBaseParam("tor_id", Ext.HDR_ID);
                    Ext.storeDtl.load({
                        callback: function (recordx, operation, success) {
                            if (success) {
                                Ext.Msg.alert("แจ้งเตือน", "บันทึกเรียบร้อย");
                                Ext.store2.reload();
                                Ext.getCmp("win-frm-contractID").destroy();
                            }
                        },
                    });
                },
            });
        } else {
            Ext.Msg.alert("แจ้งเตือน", msg);
        }
        // console.log(Ext.selectRow.data);//สัญญาซื้อ
//        console.log(Ext.selectRow.data.i_purchase); //สัญญาซื้อ 1f_totalID
//        console.log(date_Ym); //สัญญาลงวันที่ 2
//        console.log(date_dd); //สัญญาลงวันที่ 3
//        console.log(Ext.selectRow.data.tor_type_id); //ประเภท 4
//        console.log(Ext.selectRow.data.dc_expense_budget_type_id); //แหล่งเงิน 5
//        console.log(Ext.selectRow.data.i_type_fix_rate == 0 ? 1 : 2); //สัญญาปกติ,สัญญาย่อย 6
        // return
//        var msg = "";
//        if (msg == "") {
//            Ext.Ajax.request({
//                url: "tor/api/mnContractCode.php",
//                method: "POST",
//                params: {
//                    mode: "GENCODECTSNO",
//                    id: Ext.HDR_ID,
//                    sp_po_id: Ext.SP_PO_ID,
//                    i_type_0: Ext.selectRow.data.i_purchase,
//                    ym_0: date_Ym,
//                    dd_0: date_dd,
//                    sp_typ_id_0: Ext.selectRow.data.tor_type_id,
//                    bg_type_id_0: Ext.selectRow.data.dc_expense_budget_type_id,
//                    contract_type_0: Ext.selectRow.data.i_type_fix_rate == 0 ? 1 : 2,
//                },
//                success: function (result, request) {
//                    // Ext.getCmp("win-frm-dtlID").destroy();
//                    Ext.store2.setBaseParam("tor_id", Ext.HDR_ID);
//                    Ext.store2.load({
//                        callback: function (recordx, operation, success) {
//                            if (success) {
//                                Ext.Msg.alert("แจ้งเตือน", "บันทึกเรียบร้อย");
//                                Ext.getCmp("win-frm-contractID").destroy();
//                                // if (type == "SAVE_DTL") {
//                                //   var inputEl = Ext.getCmp("gridSub5ID").getView().scroller.dom;
//                                //   inputEl.scrollTop = inputEl.scrollHeight;
//                                // }
//                            }
//                        },
//                    });
//                },
//            });
//        } else {
//            Ext.Msg.alert("แจ้งเตือน", msg);
//        }
    };

    Ext.status = Ext.apply({
        name: menu,
        process: function (menuCode, record) {
            Ext.Ajax.request({
                url: "tor/api/mnTorController.php",
                params: {
                    mode: "UPSTATUS_PO_HDR",
                    menuCode: menuCode,
                    // tor_status_id: record.get("tor_status_id"),
                    id: record.get("sp_tor_contract_id"),
                },
                method: "POST", //GET
                success: function (result, request) {
                    var jsonData = Ext.util.JSON.decode(result.responseText); //decode json
                    if (jsonData.success) {
                        Ext.MessageBox.alert("Success", jsonData.msg, function () {
                            Ext.getCmp("tabpanel1").getStore().reload();
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
    Ext.storeBank = new Ext.data.JsonStore({
        autoLoad: true,
        storeId: "myStoreCost",
        url: "api/All_ArCombo.php",
        baseParams: {type: "storeBank"},
        root: "data",
        idProperty: "id",
        totalProperty: "totalCount",
        fields: ["no", "id", "c_code", "c_name"],
    });
    Ext.storeVictories = new Ext.data.JsonStore({
        autoDestroy: false,
        autoLoad: false,
        url: "api/All_PoWorkingImpHdr.php",
        baseParams: {
            type: "sp_tor_victory",
        },
        root: "data",
        idProperty: "id",
        fields: ["id", "c_name"],
    });
    var colCnt = [
        new Ext.grid.RowNumberer({width: 35, header: " No ", dataIndex: "no"}),
        {header: "ID System", hidden: true, dataIndex: "sp_po_id"},
        {header: "เลขที่ PO", align: "left", dataIndex: "c_code", width: 50},
        {header: "เรื่อง ", align: "left", dataIndex: "c_name", width: 50},
        // {
        //   header: "เลขอ้างอิง",
        //   align: "left",
        //   dataIndex: "c_doc_ref",
        //   width: 30,
        // },
        {
            header: "วันที่บันทึก",
            dataIndex: "d_due_date",
            width: 20,
            align: "center",
            renderer: function (value, metaData, record, row, col, store, gridView) {
                if (value != "") {
                    return shortThaiDate(value);
                } else {
                    return "";
                }
            },
        },
        {header: "วงเงินใน PO", dataIndex: "f_total_amt", align: "right", width: 25},
        //  {header: "รวม VAT", dataIndex: 'f_unit_cost_vat', align: 'right', width: 25, },
        {
            header: "แก้ไขสัญญา",
            sortable: false,
            hideable: false,
            draggable: false,
            align: "center",
            id: "edit21",
            width: 25,
            dataIndex: "id",
            renderer: function (value, metaData, record, row, col, store, gridView) {
                if (record.get("id") == "grandtotal" || record.get("i_is_dtl")) {
                    return "";
                } else {
                    return '<img src="../images/icons/document_edit.gif"); style="cursor:pointer"/>';
                }
            },
        },
    ];

    Ext.user_right_add = user_right_add;
    Ext.user_right_edit = user_right_edit;
    Ext.user_right_delete = user_right_delete;
    Ext.title = Ext.menu_name + " " + Ext.menu_code;
    Ext.HDR_ID = null;
    Ext.selectRow = [];
    Ext.menuEditGrid = true;
    Ext.menuRightEditgrid = true;
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
    Ext.bgYear = now - 1;
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
        } else {
            var forExecElement = CreateElementForExecCommand(textToClipboard);
            SelectContent(forExecElement);
            var supported = true;
            // UniversalXPConnect privilege is required for clipboard access in Firefox
            try {
                if (window.netscape && netscape.security) {
                    netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
                }
                success = document.execCommand("copy", false, null);
            } catch (e) {
                success = false;
            }
            document.body.removeChild(forExecElement);
        }

        if (success) {
            console.log("The text is on the clipboard, try to paste it!");
        } else {
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
    function controller(rec, evt) {
        if (Ext.isEmpty(rec))
            Ext.Msg.alert("แจ้งเตือน", "กรุณา click เลือกข้อมูลที่จะแก้ไขใน data grid", function (bu, action) {
                return false;
            });
        else {
            Ext.Msg.show({
                title: "แจ้งเตือน!",
                msg: "Are you sure you want to process due PA & ALERT TOR?",
                width: 400,
                // buttons: Ext.MessageBox.YESNOCANCEL,
                buttons: Ext.MessageBox.YESNO,
                fn: function (btn, text) {
                    if (btn === "yes")
                        Ext.status.process("ST0099", rec);
                    else
                        null;
                },
                icon: Ext.MessageBox.ERROR,
            });
        }
    }
    function cellClick(grid, rowIndex, columnIndex, e) {
        Ext.selectRow = this.selModel.selection.record;
        // var record = grid.getStore().getAt(rowIndex);
        if (columnIndex === grid.getColumnModel().getIndexById("processDueID")) {
            //ttf

            controller(Ext.selectRow, "processDue"); //on
        }
    }
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
    Ext.po_creditor = new Ext.data.JsonStore({
        autoDestroy: false,
        autoLoad: true,
        url: "api/All_PoWorkingImpHdr.php",
        baseParams: {
            type: "po_creditor",
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
        url: "tor/api/List_poStep.php",
        baseParams: {
            type: "i_is_po",
            keyData: Ext.keyData,
            i_is_po: true,
            tor_status_id: Ext.menu_id,
        },
        root: "data",
        idProperty: "id",
        totalProperty: "totalCount",
        fields: [
            {
                name: "no",
            },
            {
                name: "id", //id sp_tor_id i_period c_doc_ref f_total_amt d_period_date
            },
            {
                name: "sp_tor_id",
            },
            {
                name: "sp_tor_contract_id",
            },
            {
                name: "d_due_date", //d_due_date f_total_amt
            },
            {
                name: "i_is_po", //d_due_date f_total_amt
            },
            {
                name: "c_doc_ref",
            },
            {
                name: "c_code",
            },
            {
                name: "dc_creditor_idTxt",
            },
            {
                name: "f_total_amt",
            },
            {
                name: "d_period_date",
            },
            {
                name: "c_code",
            },
            {
                name: "bg_budget_item_project_id",
            },
            {
                name: "c_budget_dtl_project",
            },
            {
                name: "c_name",
            },
            {
                name: "c_tor_type",
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
                name: "i_parent",
            },
            {
                name: "i_is_parent",
            },
            {
                name: "dc_cost_id",
            },
            {
                name: "dc_cost_idTxt",
            },
            {
                name: "c_discription",
            },
            {
                name: "i_delivery",
            },
            {
                name: "i_type_fine",
            },
            {
                name: "f_fine",
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
                name: "c_department",
            },
            {
                name: "d_tor_date",
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
                name: "c_comment",
            },
            {
                name: "c_remake",
            },
            {
                name: "po_creditor_id",
            },
            {
                name: "po_creditor_idTxt",
            },
            {
                name: "start_date",
            },
            {
                name: "end_date",
            },
            {
                name: "d_po_date",
            },
            {
                name: "c_po_no",
            },
            {
                name: "i_contract_status",
            },
        ],
    });

    Ext.store_year = new Ext.data.JsonStore({
        fields: ["id", "c_name"],
        autoDestroy: false,
        autoLoad: false,
        data: years,
    });

    //Ext
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
    //interlizing
    Ext.loadStore = function (status, show) {
        var statusx = status;
        var winx = show;
        if (statusx == "edit" && Ext.isEmpty(Ext.selectRow))
            Ext.Msg.alert("แจ้งเตือน", "กรุณา click เลือกข้อมูลที่จะแก้ไขใน data grid", function (form, action) {
                return false;
            });
        else
            Ext.po_creditor.reload({
                callback: function (recordx, operation, success) {
                    if (success) {
                        Ext.po_creditor_transfer.reload({
                            callback: function (recordx, operation, success) {
                                if (success) {
                                    Ext.dc_cost.reload({
                                        callback: function (recordx, operation, success) {
                                            if (success) {
                                                Ext.po_emp.reload({
                                                    callback: function (recordx, operation, success) {
                                                        if (success) {
                                                            Ext.po_user_permission.reload({
                                                                callback: function (recordx, operation, success) {
                                                                    if (success) {
                                                                        Ext.dc_expense_budget_type.reload({
                                                                            callback: function (recordx, operation, success) {
                                                                                if (success) {
                                                                                    Ext.po_expense_group.reload({
                                                                                        callback: function (recordx, operation, success) {
                                                                                            if (success) {
                                                                                                Ext.po_expense.reload({
                                                                                                    callback: function (recordx, operation, success) {
                                                                                                        if (success) {
                                                                                                            if (statusx === "load") {
                                                                                                            } else
                                                                                                                AppPoStore(statusx).show();

                                                                                                            if (statusx === "add") {
                                                                                                                Ext.HDR_ID = null;
                                                                                                            } else if (statusx === "edit") {
                                                                                                                Ext.getCmp("winChequeID").items.items[0].getForm().loadRecord(Ext.selectRow);
                                                                                                                Ext.HDR_ID = Ext.selectRow.data.sp_tor_id;
                                                                                                                Ext.SP_TOR_CONTRACT_ID = Ext.selectRow.data.sp_tor_contract_id;
                                                                                                                Ext.store2.setBaseParam("sp_tor_contract_id", Ext.SP_TOR_CONTRACT_ID);

                                                                                                                Ext.store2.load();
                                                                                                            }
                                                                                                            //
                                                                                                        }
                                                                                                    },
                                                                                                }); //po_expense
                                                                                            }
                                                                                        },
                                                                                    }); //po_expense_group
                                                                                }
                                                                            },
                                                                        }); //dc_expense_budget_type
                                                                    }
                                                                },
                                                            }); //po_user_permission
                                                        }
                                                    },
                                                }); //po_emp
                                            }
                                        },
                                    }); //dc_cost
                                }
                            },
                        }); //po_creditor
                    }
                },
            }); //po_creditor_transfer
    };

    var AppPoStore = function (statuss) {
        var comboCost = new Ext.form.ComboBox({
            mode: "local",
            readOnly: true,
            store: Ext.dc_cost,
            anchor: "100%",
            fieldLabel: "หน่วยงานที่รับผิดชอบ",
            valueField: "id",
            displayField: "c_name",
            hiddenName: "dc_cost_id",
            name: "c_cost_name",
            triggerAction: "all",
            forceSelection: true,
            selectOnFocus: true,
            typeAhead: false,
            emptyText: "กรุณาเลือก...",
            validator: function (val) {
                if (!Ext.isEmpty(val)) {
                    return true;
                } else {
                    return "กรุณาระบุ ข้อมูลให้ถูกต้อง";
                }
            },
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
        });
        var comboTypeBg = new Ext.form.ComboBox({
            mode: "local",
            readOnly: true,
            store: Ext.dc_expense_budget_type,
            fieldLabel: "แหล่งเงิน",
            anchor: "100%",
            submitValue: true,
            name: "dc_expense_budget_type_idTxt",
            hiddenName: "dc_expense_budget_type_id",
            //po_expense_group_id
            valueField: "id",
            displayField: "c_name",
            triggerAction: "all",
            forceSelection: true,
            selectOnFocus: true,
            typeAhead: false,
            emptyText: "กรุณาเลือกแหล่งเงิน...",
            validator: function (val) {
                if (!Ext.isEmpty(val)) {
                    return true;
                } else {
                    return "กรุณาระบุ ข้อมูลให้ถูกต้อง";
                }
            },
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
        });
        var comboUsedBgYear = new Ext.form.ComboBox({
            mode: "local",
            readOnly: true,
            fieldLabel: "ใช้เงินปีงบประมาณ",
            submitValue: true,
            hiddenName: "i_yyyy",
            name: "i_year",
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
        });
        var comboExpense = new Ext.form.ComboBox({
            mode: "local",
            readOnly: true,
            store: Ext.po_expense,
            valueField: "id",
            displayField: "c_name",
            anchor: "100%",
            submitValue: true,
            name: "c_detail",
            hiddenName: "po_expense_id",
            triggerAction: "all",
            allBlank: true,
            forceSelection: true,
            selectOnFocus: true,
            fieldLabel: "รายการย่อย",
            width: 200,
            typeAhead: false,
            emptyText: "กรุณาเลือกใช้จ่าย...",
            validator: function (val) {
                if (!Ext.isEmpty(val)) {
                    return true;
                } else {
                    return "กรุณาระบุ ข้อมูลให้ถูกต้อง";
                }
            },
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
                    console.log(this);
                },
            },
        });

        var statusx = statuss;

        if (statusx == "add") {
            Ext.getCmp("tabpanel1").getSelectionModel().clearSelections();
        }
        var col1 = [
            new Ext.grid.RowNumberer({width: 35, header: " No ", dataIndex: "no"}),
            {header: "ID System", hidden: true, dataIndex: "id"},
            {header: "งวดที่", align: "center", dataIndex: "i_seq", width: 10},
            {
                header: "วันที่ส่งมอบ",
                align: "center",
                dataIndex: "d_period_date",
                width: 25,
                renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                    if (value == "รวม") {
                        metaData.attr = "style='font-weight:bold;color:blue'; align='right'";
                        return Ext.floatRenderer(value);
                    } else {
                        metaData.attr = "";
                        if (record.get("i_is_dtl")) {
                            return "";
                        } else {
                            return DategetShortDateMonthName(value);
                        }
                    }
                },
            },
            {
                header: "รายละเอียด จัดซื้อ",
                dataIndex: "c_name",
                width: 35,
                renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                    if (value.substring(0, 3) == "รวม") {
                        metaData.attr = "style='font-weight:bold;color:blue'; align='right'";
                    } else {
                        metaData.attr = "";
                    }
                    return value; //DategetShortDateMonthName(value);
                },
            },
            {header: "จำนวน", dataIndex: "f_quan", width: 20, align: "right"},
            {header: "ก่อน VAT", dataIndex: "f_unit_cost", align: "right", width: 25},
            {header: "รวม VAT", dataIndex: "f_unit_cost_vat", align: "right", width: 25},
            {
                header: "บันทึกรายละเอียดในงวดงาน",
                sortable: false,
                hideable: false,
                draggable: false,
                align: "center",
                id: "edit21",
                width: 25,
                dataIndex: "id",
                renderer: function (value, metaData, record, row, col, store, gridView) {
                    if (record.get("id") == "grandtotal" || record.get("i_is_dtl")) {
                        return "";
                    } else {
                        if (record.get("buStatus") == true) {
                            return '<img src="../images/icons/document_edit.gif"); style="cursor:pointer"/>';
                        } else {
                            return record.get("buStatus");
                        }
                    }
                },
            },
        ];
        Ext.storeUnitType = new Ext.data.JsonStore({
            autoDestroy: false,
            autoLoad: true,
            url: "api/All_PoWorkingImpHdr.php",
            baseParams: {
                type: "dc_unit_type",
            },
            root: "data",
            idProperty: "id",
            fields: ["id", "c_code", "c_name"],
        });
        //คูสัญญา
        Ext.store1 = new Ext.data.JsonStore({
            storeId: "myStore2",
            autoLoad: false,
            url: "tor/api/mnTorController.php",
            root: "data",
            baseParams: {mode: "LISTCREDITOR", i_read: user_right_read}, //Permission i_read
            idProperty: "id",
            totalProperty: "totalCount",
            fields: [
                {name: "no"},
                {name: "id", type: "int"},
                {name: "sp_tor_id", type: "int"},
                {name: "dc_creditor_id", type: "int"},
                {name: "f_total_amt", type: "string"},
                {name: "c_name", type: "string"},
                {name: "i_enable", type: "int"},
                {name: "dc_user_create_id"},
                {name: "dc_user_create_cost_id"},
                {name: "d_create"},
                {name: "dc_user_update_id"},
                {name: "dc_user_update_cost_id"},
                {name: "d_update"},
            ],
        }); //dc_creditor
        //เลขสัญญา
        Ext.store2 = new Ext.data.JsonStore({
            storeId: "myStore2",
            autoLoad: false,
            url: "tor/api/mnTorController.php",
            root: "data",
            baseParams: {mode: "LIST_SP_PO_HDR", sp_tor_contract_id: user_right_read}, //Permission i_read
            idProperty: "id",
            totalProperty: "totalCount",
            fields: [
                {name: "no"},
                {name: "sp_po_id"},
                {name: "sp_tor_contract_id"},
                {name: "sp_tor_id"},
                {name: "dc_creditor_id"},
                {name: "c_name"},
                {name: "c_code"},
                {name: "c_doc_ref"},
                {name: "c_discription"},
                {name: "i_is_status"},
                {name: "i_is_po"},
                {name: "d_due_date"},
                {name: "f_total_amt"},
            ],
        });
        //งวด
        Ext.store3 = new Ext.data.JsonStore({
            storeId: "myStore3",
            autoLoad: false,
            url: "tor/api/mnTorController.php",
            root: "data",
            baseParams: {mode: "LISTHDRPERIOD", i_read: user_right_read}, //Permission i_read
            idProperty: "id",
            totalProperty: "totalCount",
            fields: [
                {name: "no"},
                {name: "id"},
                {name: "d_period_date", type: "string"},
                {name: "i_period", type: "int"},
                {name: "i_is_status", type: "int"},
                {name: "i_enable", type: "int"},
                {name: "f_total_amt", type: "string"},
                {name: "dc_user_create_id"},
                {name: "dc_user_create_cost_id"},
                {name: "d_create"},
                {name: "dc_user_update_id"},
                {name: "dc_user_update_cost_id"},
                {name: "d_update"},
            ],
        });
        //ของ

        Ext.store4 = new Ext.data.JsonStore({
            storeId: "myStore4",
            autoLoad: false,
            url: "tor/api/mnTorController.php",
            root: "data",
            baseParams: {mode: "LISTDTLPERIODUSED", i_read: user_right_read}, //Permission i_read
            idProperty: "id",
            totalProperty: "totalCount",
            fields: [
                {name: "no"},
                {name: "id"},
                {name: "i_period", type: "int"},
                {name: "c_code", type: "string"},
                {name: "c_name", type: "string"},
                {name: "dc_unit_name", type: "string"},
                {name: "i_qty"},
                {name: "f_net_unit_price"}, // f_net_unit_price f_net_total_price
                {name: "f_net_total_price"}, // f_net_unit_price f_net_total_price
                {name: "i_qty_amt"}, //sum
                {name: "f_total_amt"}, //summ
                {name: "c_comment_product", type: "string"},
                {name: "c_comment_asset", type: "string"},
                {name: "i_enable", type: "int"},
                {name: "dc_user_create_id"},
                {name: "dc_user_create_cost_id"},
                {name: "d_create"},
                {name: "dc_user_update_id"},
                {name: "dc_user_update_cost_id"},
                {name: "d_update"},
            ],
        });

        var col4 = [
            new Ext.grid.RowNumberer({width: 35, header: " No ", dataIndex: "no"}),
            {header: "ID System", hidden: true, dataIndex: "id"},
            {
                header: "รายละเอียด จัดซื้อ",
                dataIndex: "c_name",
                width: 35,
                renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                    if (value.substring(0, 3) == "รวม") {
                        metaData.attr = "style='font-weight:bold;color:blue'; align='right'";
                    } else {
                        metaData.attr = "";
                    }
                    return value; //DategetShortDateMonthName(value);
                },
            },
            {header: "หน่วยนับ", align: "left", dataIndex: "dc_unit_name", width: 20},
            {header: "จำนวน", dataIndex: "i_qty", width: 20, align: "right"},
            {header: "ราคา/หน่วย", dataIndex: "f_net_unit_price", align: "right", width: 25},
            {
                header: "รวม",
                dataIndex: "f_net_total_price",
                align: "right",
                width: 25,
                renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                    return value;
                },
            },
        ];
        var colPeriod = [
            new Ext.grid.RowNumberer({width: 35, header: " No ", dataIndex: "no"}),
            {header: "ID System", hidden: true, dataIndex: "id"},
            {
                header: "รายละเอียด",
                align: "left",
                dataIndex: "id",
                width: 50,
                id: "hdrPeriod",
                renderer: function (value, metaData, record, row, col, store, gridView) {
                    return "<button>รายละเอียดของในงวด </button>";
                },
            },
            {header: "งวดที่", align: "center", width: 35, dataIndex: "i_period"},
            {header: "วันที่ส่งมอบ", dataIndex: "d_period_date", align: "center"},
            {header: "จำนวนเงิน", dataIndex: "f_total_amt", align: "right"},
            {
                header: "สถานะ",
                dataIndex: "id",
                align: "center",
                renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                    if (record.get("i_is_status") == 1) {
                        return '<img src="../images/icons/accept.png"); style="cursor:pointer"/>';
                    } else if (record.get("i_is_status") == 2) {
                        return '<img src="../images/icons/arrow_redo.png"); style="cursor:pointer"/>';
                    } else {
                        return '<img src="../images/icons/add.png"); style="cursor:pointer"/>';
                    }
                },
            },
            {
                header: "แก้ไข",
                align: "center",
                width: 35,
                dataIndex: "i_period",
                id: "i_peridEdit",
                renderer: function (value, metaData, record, row, col, store, gridView) {
                    if (record.get("i_status") == 2) {
                        return "";
                    } else {
                        return '<img src="../images/icons/table_edit.png"); style="cursor:pointer"/>';
                    }
                },
            },
            {
                header: "ลบ",
                align: "center",
                width: 35,
                dataIndex: "i_period",
                id: "i_peridDel",
                renderer: function (value, metaData, record, row, col, store, gridView) {
                    if (record.get("i_status") == 2) {
                        return "";
                    } else {
                        return '<img src="../images/icons/table_delete.png"); style="cursor:pointer"/>';
                    }
                },
            },
        ];

        var disp = false ? "displayfield" : "textfield";
        if (!Ext.isEmpty(Ext.getCmp("winChequeID"))) {
            Ext.getCmp("winChequeID").destroy();
        }
        var ColumGridPop = [
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
        var storeBank = new Ext.data.JsonStore({
            autoLoad: true,
            storeId: "myStoreCost",
            url: "api/All_ArCombo.php",
            baseParams: {type: "storeBank"},
            root: "data",
            idProperty: "id",
            totalProperty: "totalCount",
            fields: ["no", "id", "c_code", "c_name"],
        });
        var PopBank = new Ext.ux.Poplov({
            text: "ชื่อธนาคาร",
            id: "dc_bank_idID", //go to relation
            iconCls: "page_magnify",
            valueHidden: "dc_bank_id", //go to hidden
            store: storeBank,
            headerGrid: ColumGridPop,
            widthText: 280,
            fieldLabel: "ชื่อธนาคาร ",
            //listeners   : {'render' : function(p){ this.hide(); } }
        });
        Ext.poFormID = "win-frm-xxx001";
        return new Ext.Window({
            collapsible: true,
            maximizable: true,
            title: Ext.title,
            id: Ext.poFormID,
            width: 1200,
            height: 500,
            layout: "fit",
            modal: true,
            plain: true,
            items: [
                {
                    xtype: "tabpanel",
                    activeTab: 0,
                    id: "winChequeID",
                    // defaults: {autoHeight: true, bodyStyle: 'padding:10px'},
                    items: [
                        new Ext.FormPanel({
                            title: "รายละเอียดการลงนามในสัญญา",
                            id: "tap_main",
                            iconCls: "icon-start",
                            columnWidth: 1,
                            url: "tor/api/mnTorController.php",
                            frame: true,
                            autoScroll: true,
                            labelAlign: "left",
                            bodyStyle: "padding:1px",
                            labelWidth: 200,
                            items: [
                                {
                                    layout: "column",
                                    border: false,
                                    items: [
                                        {
                                            columnWidth: 0.6,
                                            layout: "form",
                                            border: true,
                                            items: [
                                                {
                                                    xtype: "hidden",
                                                    name: "sp_tor_contract_id",
                                                    id: "sp_tor_contract_id",
                                                },
                                                {
                                                    xtype: disp,
                                                    readOnly: true,
                                                    fieldLabel: "เลขสัญญาหลัก",
                                                    id: "codeHdrID",
                                                    style: "text-align: center;font-weight:bold;background:#eee;",
                                                    name: "c_code",
                                                },
                                                {
                                                    xtype: disp,
                                                    readOnly: true,
                                                    fieldLabel: "เรื่อง",
                                                    name: "c_name",
                                                },
                                                {
                                                    xtype: "datefield",
                                                    readOnly: true,
                                                    fieldLabel: "วันที่ใบสั่ง ",
                                                    id: "d_po_dateID",
                                                    name: "d_po_date",
                                                    width: 150,
                                                },
                                                {
                                                    xtype: "datefield",
                                                    readOnly: true,
                                                    fieldLabel: "วันที่รับสนองราคา ",
                                                    id: "d_doc_resp_dateID",
                                                    name: "d_doc_resp_date",
                                                    width: 150,
                                                    listeners: {
                                                        render: function (p) {
                                                            this.hide();
                                                        },
                                                    },
                                                }, {
                                                    xtype: "displayfield",
                                                    fieldLabel: "จำนวนเงิน",
                                                    name: "f_total_amt",
                                                    id: "f_totalID",
                                                    listeners: {
                                                        blur: function () {
                                                            this.fn();
                                                        },
                                                        afterrender: function () {
                                                            this.fn = function () {
                                                                var val = 0;
                                                                val = this.getValue();
                                                                var f_total = parseFloat(val.replace(/,/g, "") / 1);
                                                                this.setValue(Ext.floatRenderer(f_total));
                                                            };
                                                            this.fn();
                                                        },
                                                    },
                                                },
//                                                {
//                                                    xtype: "buttongroup",
//                                                    fieldLabel: "จำนวนเงิน",
//                                                    frame: false,
//                                                    border: false,
//                                                    items: [
//                                                        {
//                                                            xtype: "displayfield",
//                                                            fieldLabel: "จำนวนเงิน",
//                                                            name: "f_total_amt",
//                                                            id: "f_totalID",
//                                                            listeners: {
//                                                                blur: function () {
//                                                                    this.fn();
//                                                                },
//                                                                afterrender: function () {
//                                                                    this.fn = function () {
//                                                                        var val = 0;
//                                                                        val = this.getValue();
//                                                                        var f_total = parseFloat(val.replace(/,/g, "") / 1);
//                                                                        this.setValue(Ext.floatRenderer(f_total));
//                                                                    };
//                                                                    this.fn();
//                                                                },
//                                                            },
//                                                        },
//                                                        {
//                                                            xtype: "button",
//                                                            fieldLabel: "-",
//                                                            text: "ตรวจสอบเงินตามงวด",
//                                                            handler: function () {
//                                                                alert("เหลือเงินงวด 10,000,000.00 บาท");
//                                                            },
//                                                        },
//                                                    ],
//                                                },
                                                {
                                                    fieldLabel: "เหตผล",
                                                    readOnly: true,
                                                    xtype: "textarea",
                                                    width: 400,
                                                    name: "c_discription",
                                                },
                                                {
                                                    xtype: "textfield",
                                                    readOnly: true,
                                                    fieldLabel: " เลขที่เอกสารรับสนองราคา ",
                                                    id: "c_doc_resp_noID",
                                                    name: "c_doc_resp_no",
                                                    width: 150,
                                                    listeners: {
                                                        render: function (p) {
                                                            this.hide();
                                                        },
                                                    },
                                                },
                                                {
                                                    xtype: "textfield",
                                                    readOnly: true,
                                                    fieldLabel: " เลขที่เอกสารใบสั่งซื้อ/สั่งจ้าง/สั่งเช่า",
                                                    id: "c_po_noID",
                                                    name: "c_po_no",
                                                    width: 150,
                                                },
                                                {
                                                    xtype: "displayfield",
                                                    fieldLabel: "คู่สัญญา/ผู้ขาย ",
                                                    name: "dc_creditor_idTxt",
                                                    cls: "my-label-style",
                                                },
                                                {
                                                    fieldLabel: "กำหนดส่งภายใน ",
                                                    readOnly: true,
                                                    xtype: "radiogroup",
                                                    columns: [50, 150],
                                                    items: [
                                                        {
                                                            xtype: "textfield",
                                                            name: "i_delivery",
                                                            id: "i_deliveryID",
                                                            value: 1,
                                                            validator: function (val) {
                                                                var regex = /^([0-9]+|[0-9]{1,3}(,[0-9]{3})*)(\.[0-9]{1,2})?$/;
                                                                var strMoney = val.replace(",", "");
                                                                if (!regex.test(val)) {
                                                                    return "กรุณากรอก จำนวนเงินเป็นจำนวนทศนิยม มูลค่ามากกว่า 0.00";
                                                                } else {
                                                                    return true;
                                                                }
                                                            },
                                                        },
                                                        {
                                                            xtype: "displayfield",
                                                            value: "วัน ",
                                                            cls: "my-label-style",
                                                        },
                                                    ],
                                                },
                                                {
                                                    xtype: "radiogroup",
                                                    columns: [250],
                                                    fieldLabel: "การคิดค่าปรับแบบ",
                                                    id: "type_fineID",
                                                    style: {
                                                        "font-weight": "bold",
                                                    },
                                                    items: [
                                                        {
                                                            name: "i_type_fine",
                                                            checked: true,
                                                            inputValue: 0,
                                                            boxLabel: "ปรับตามความสำเร็จของงานพร้อมกันทั้งหมด",
                                                        },
                                                        {
                                                            name: "i_type_fine",
                                                            inputValue: 1,
                                                            boxLabel: "ปรับแยกตามรายงวด",
                                                        },
                                                    ],
                                                    listeners: {
                                                        change: function (radiogrup, value) {
                                                            var index = Ext.selectRow.data.i_type_fine;
                                                            Ext.getCmp("type_fineID").items.items[index].setValue(true);
                                                        },
                                                    },
                                                },

                                                {
                                                    fieldLabel: "คิดจากวงเงินในสัญญาจำนวน ",
                                                    id: "i_is_fineID",
                                                    xtype: "radiogroup",
                                                    columns: [150, 150],
                                                    items: [
                                                        {
                                                            xtype: "textfield",
                                                            readOnly: true,
                                                            id: "i_is_fineTextID", //(i_fine_amt,i_fine_per) in i_is_fineTextID fn(cal)
                                                            name: "f_fine",
                                                            width: 430,
                                                            value: "0.00",
                                                            validator: function (val) {
                                                                var regex = /^([0-9]+|[0-9]{1,3}(,[0-9]{3})*)(\.[0-9]{1,2})?$/;

                                                                if (!regex.test(val)) {
                                                                    return "กรุณากรอก จำนวนเงินเป็นจำนวนทศนิยม มูลค่ามากกว่า 0.00";
                                                                } else {
                                                                    return true;
                                                                }
                                                            },
                                                        },
                                                        {
                                                            xtype: "displayfield",
                                                            id: "fpBt",
                                                            value: "(บาท)/วัน",
                                                            cls: "my-label-style",
                                                        },
                                                    ],
                                                },
                                                {
                                                    xtype: "radiogroup",
                                                    hidden: true,
                                                    columns: [180],
                                                    fieldLabel: "โหมดการบันทึก",
                                                    id: "modesubID",
                                                    style: {
                                                        "font-weight": "bold",
                                                    },
                                                    items: [
                                                        {
                                                            name: "mode",
                                                            checked: true,
                                                            inputValue: "UP_SP_TOR_CONTRACT_NEXT",
                                                            boxLabel: "อัพเดทรายการ",
                                                        },
                                                    ],
                                                },
                                            ],
                                            buttonAlign: "center",
                                            buttons: [
                                                {
                                                    hidden: true,
                                                    text: "บันทึกรายการ",
                                                    id: "buSaveSubID",
                                                    iconCls: "icon-save",
                                                    handler: function () {
                                                        var formSubmit = function () {
                                                            form.submit({
                                                                waitMsg: "Saving Data...",
                                                                success: function (form, action) {
                                                                    Ext.Msg.alert("Success", action.result.msg, function (form, action) {
                                                                        Ext.getCmp("tabpanel1").getStore().reload();
                                                                        Ext.selectRow = null;
                                                                        Ext.getCmp(Ext.poFormID).destroy();
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
                                                        }; //END

                                                        var form = Ext.getCmp("tap_main").getForm();
                                                        if (form.isValid()) {
                                                            if (Ext.getCmp("modesubID").getValue().inputValue === "VIEW") {
                                                            } else if (Ext.getCmp("modesubID").getValue().inputValue === "DELETE") {
                                                                Ext.MessageBox.show({
                                                                    title: "Icon Support",
                                                                    msg: "คุณต้องการที่จะลบ รายการที่เลือกนี้ใช่ใหม ?",
                                                                    buttons: Ext.MessageBox.OKCANCEL,
                                                                    icon: Ext.MessageBox.WARNING,
                                                                    fn: function (btn) {
                                                                        if (btn === "ok") {
                                                                            formSubmit(form);
                                                                        } else {
                                                                            return;
                                                                        }
                                                                    },
                                                                });
                                                            } else {
                                                                formSubmit(form);
                                                            }
                                                        }
                                                    },
                                                    //haddler
                                                },
                                                        // {
                                                        //   text: Ext.GLOBAL_BU_BACK_TH,
                                                        //   handler: function () {
                                                        //     Ext.getCmp(Ext.poFormID).hide();
                                                        //     Ext.getCmp(Ext.poFormID).destroy();
                                                        //   },
                                                        // },
                                            ],
                                        },
                                        {
                                            columnWidth: 0.4,
                                            layout: "table",
                                        },
                                    ],
                                },
                                {
                                    xtype: "grid",
                                    id: "gridSub1ID",
                                    border: true,
                                    stripeRows: true,
                                    loadMask: true,
                                    height: 500,
                                    store: Ext.store2,
                                    tbar: [
                                        {
                                            xtype: "button",
                                            iconCls: "icon-add",
                                            text: "เพิ่มรายการ PO (สัญญาย่อย)",
                                            handler: function () {
                                                Ext.SP_PO_ID = null;
                                                Ext.WinUp_sp_po_hdr();
                                                Ext.getCmp("buttons_code_gen").hide();
                                            },
                                        },
                                    ],
                                    listeners: {
                                        beforerender: function () {
                                            Ext.WinUp_sp_po_hdr = function (evt, rec) {
                                                var win = new Ext.Window({
                                                    labelWidth: 175,
                                                    collapsible: true,
                                                    maximizable: true,
                                                    modal: true,
                                                    title: "เพิ่มรายการ PO (สัญญาย่อย)",
                                                    id: "win-frm-contractID",
                                                    layout: "fit",
                                                    border: false,
                                                    width: 1000,
                                                    height: 500,
                                                    items: [
                                                        {
                                                            xtype: "form",
                                                            id: "form-widgets",
                                                            url: "tor/api/mnTorController.php",
                                                            frame: true,
                                                            labelAlign: "left",
                                                            autoScroll: true,
                                                            labelWidth: 200,
                                                            bodyStyle: {padding: "10px 20px"},
                                                            defaults: {msgTarget: "side"},
                                                            items: [
                                                                // {
                                                                //   id: "role-form-mode",
                                                                //   xtype: "hidden",
                                                                //   name: "mode",
                                                                //   value: "ADD",
                                                                //   readOnly: true,
                                                                // },
                                                                {
                                                                    xtype: "hidden",
                                                                    name: "id",
                                                                    // value: Ext.selectRow.data.id,
                                                                    id: "idID",
                                                                },
                                                                {
                                                                    xtype: "hidden",
                                                                    name: "sp_tor_id",
                                                                    value: Ext.HDR_ID,
                                                                },
                                                                {
                                                                    xtype: "hidden",
                                                                    name: "sp_tor_contract_id",
                                                                    value: Ext.SP_TOR_CONTRACT_ID,
                                                                },
                                                                {
                                                                    xtype: "hidden",
                                                                    name: "sp_po_id",
                                                                    value: Ext.SP_PO_ID,
                                                                },
                                                                {
                                                                    xtype: "hidden",
                                                                    name: "mode",
                                                                    value: "UP_SP_PO",
                                                                    readOnly: true,
                                                                },
                                                                {
                                                                    fieldLabel: "เลขที่",
                                                                    id: "c_codeID",
                                                                    name: "c_code",
                                                                    xtype: "textfield",
                                                                    width: 170,
                                                                    style: "text-align: center;font-weight:bold;background:#eee;",
                                                                    readOnly: true,
                                                                    // validator: function (val) {
                                                                    //   if (Ext.isEmpty(val)) {
                                                                    //     return "กรุณากรอก เลขที่";
                                                                    //   } else {
                                                                    //     return true;
                                                                    //   }
                                                                    // },
                                                                },
                                                                // {
                                                                //   fieldLabel: "เอกสารอ้างอิง",
                                                                //   id: "c_doc_refID",
                                                                //   name: "c_doc_ref",
                                                                //   xtype: "textfield",
                                                                //   width: 170,
                                                                //   validator: function (val) {
                                                                //     if (Ext.isEmpty(val)) {
                                                                //       return "กรุณากรอก เลขที่";
                                                                //     } else {
                                                                //       return true;
                                                                //     }
                                                                //   },
                                                                // },
                                                                {
                                                                    fieldLabel: "วันที่บันทึก ",
                                                                    id: "d_due_dateID",
                                                                    name: "d_due_date",
                                                                    xtype: "datefield",
                                                                    width: 160,
                                                                    validator: function (val) {
                                                                        if (Ext.isEmpty(val)) {
                                                                            return "วันที่อายุสัญญา";
                                                                        } else {
                                                                            return true;
                                                                        }
                                                                    },
                                                                },
                                                                {
                                                                    fieldLabel: "เรื่อง ",
                                                                    xtype: "textfield",
                                                                    name: "c_name",
                                                                    cls: "my-label-style",
                                                                },
                                                                {
                                                                    fieldLabel: "วงเงินในสัญญา PO ",
                                                                    xtype: "textfield",
                                                                    name: "f_total_amt",
                                                                    style: "color:blue; text-align: right;",
                                                                    listeners: {
                                                                        afterrender: function () {
                                                                            this.fn = function () {
                                                                                this.setValue(floatRenderer(floatMinus(this.getValue().replace(/,/g, ""), 2)));
                                                                            };
                                                                        },
                                                                        Change: function (value) {
                                                                            this.fn();
                                                                        },
                                                                    },
                                                                },
                                                                {
                                                                    fieldLabel: "หมายเหตุ",
                                                                    id: "c_discriptionID",
                                                                    name: "c_discription",
                                                                    xtype: "textarea",
                                                                    height: 60,
                                                                    width: 430,
                                                                    listeners: {
                                                                        render: function (p) {
                                                                            // this.hide();
                                                                        },
                                                                    },

                                                                    /*product*/
                                                                },
                                                            ], //items จำนวนเงินรวมภาษีมูลค่าเพิ่ม
                                                            viewConfig: {forceFit: true},
                                                        },
                                                    ],
                                                    liesteners: {
                                                        afterrender: function () {
                                                            this.fn = function () {
                                                                alert(this.getValue());
                                                            };
                                                            this.fn();
                                                        },
                                                    },
                                                    buttonAlign: "right",
                                                    buttons: [
                                                        {
                                                            id: "buttons_code_gen",
                                                            text: "ออกเลข",
                                                            labelAlign: "left",
                                                            handler: function () {
                                                                GenCode_();
                                                            },
                                                        },
                                                        {
                                                            id: "buttons_save",
                                                            text: "Save",
                                                            handler: function () {
                                                                msg = "";
                                                                // if (
                                                                //   Ext.getCmp("dc_creditor_idID").getValue() ==
                                                                //   ""
                                                                // ) {
                                                                //   msg +=
                                                                //     "<span style='white-space: nowrap;'>- กรุณาเลือก ผู้ชนะ</span><br>";
                                                                // }
                                                                // if (msg == "") {
                                                                var formSubmit = function () {
                                                                    form.submit({
                                                                        waitMsg: "Saving Data...",
                                                                        success: function (form, action) {
                                                                            Ext.Msg.alert("Success", action.result.msg, function (form, action) {
                                                                                Ext.getCmp("gridSub1ID").getStore().reload();
                                                                                // Ext.selectRow = null;
                                                                                Ext.getCmp("win-frm-contractID").destroy();
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
                                                                }; //END
                                                                // } else {
                                                                //   Ext.Msg.alert("แจ้งเตือน", msg);
                                                                // }

                                                                var form = Ext.getCmp("form-widgets").getForm();
                                                                if (form.isValid()) {
                                                                    if (Ext.getCmp("modesubID").getValue().inputValue === "VIEW") {
                                                                    } else if (Ext.getCmp("modesubID").getValue().inputValue === "DELETE") {
                                                                        Ext.MessageBox.show({
                                                                            title: "Icon Support",
                                                                            msg: "คุณต้องการที่จะลบ รายการที่เลือกนี้ใช่ใหม ?",
                                                                            buttons: Ext.MessageBox.OKCANCEL,
                                                                            icon: Ext.MessageBox.WARNING,
                                                                            fn: function (btn) {
                                                                                if (btn === "ok") {
                                                                                    formSubmit(form);
                                                                                } else {
                                                                                    return;
                                                                                }
                                                                            },
                                                                        });
                                                                    } else {
                                                                        if (msg == "") {
                                                                            formSubmit(form);
                                                                        }
                                                                    }
                                                                }
                                                            },
                                                        },
                                                        {
                                                            text: "Cancel",
                                                            handler: function () {
                                                                Ext.getCmp("win-frm-contractID").destroy();
                                                            },
                                                        },
                                                    ],
                                                });

                                                if (!Ext.isEmpty(rec))
                                                    win.items.items[0].getForm().loadRecord(rec);
                                                win.show();
                                            };
                                            function controller(rec, event) {
                                                if (event == "view") {
                                                    Ext.store3.setBaseParam("tor_id", Ext.HDR_ID);
                                                    Ext.store3.setBaseParam("dc_creditor_id", rec.get("id"));
                                                    Ext.store3.load({
                                                        callback: function (record, operation, success) {
                                                            if (success) {
                                                                Ext.getCmp("winChequeID").setActiveTab(1);
                                                                Ext.getCmp("tabpanelMain2ID").setTitle(rec.get("creditor_name") + "  สัญญา " + rec.get("c_name"));
                                                                console.log(Ext.store3); ////
                                                            }
                                                        },
                                                    });
                                                }
                                            }
                                            this.thisCick = function (grid, rowIndex, columnIndex, e) {
                                                var record = grid.getStore().getAt(rowIndex);
                                                Ext.SelectStore = Ext.store2.getAt(rowIndex);
                                                Ext.store2.setBaseParam("sp_tor_contract_id", Ext.SP_TOR_CONTRACT_ID);
                                                if (columnIndex === grid.getColumnModel().getIndexById("detailPeriod")) {
                                                    //ttf
                                                    controller(record, "view"); //on
                                                } else if (columnIndex === grid.getColumnModel().getIndexById("edit21")) {
                                                    Ext.SP_PO_ID = record.data.sp_po_id;
                                                    Ext.WinUp_sp_po_hdr("edit21", record);
                                                    if (record.data.c_code != null) {
                                                        Ext.getCmp("buttons_code_gen").hide();
                                                        Ext.getCmp("buttons_save").hide();
                                                    }
                                                    // Ext.getCmp("dc_bank_idID_Name").setValue(Ext.SelectStore.data.dc_bank_idID_Name);
                                                    // Ext.getCmp("dc_bank_idID").setValue(Ext.SelectStore.data.dc_bank_id);
                                                    // var i_edit_type = document.getElementsByName("i_edit_type");
                                                    // i_edit_type[1].checked = true;
                                                }
                                            };
                                        },
                                        afterrender: function () {
                                            Ext.getCmp("gridSub1ID").on("cellclick", this.thisCick, this);
                                        },
                                    },
                                    columns: colCnt, //colCnt
                                    viewConfig: {forceFit: true},
                                },
                            ],
                        }),
                                // new Ext.FormPanel({
                                //   title: "รายละเอียดการลงนามในสัญญา",
                                //   iconCls: "icon-start",
                                //   columnWidth: 1,
                                //   url: "tor/api/mnTorController.php",
                                //   frame: true,
                                //   autoScroll: true,
                                //   labelAlign: "left",
                                //   bodyStyle: "padding:1px",
                                //   labelWidth: 200,
                                //   items: [
                                //     {
                                //       layout: "column",
                                //       border: false,
                                //       items: [
                                //         {
                                //           columnWidth: 0.6,
                                //           layout: "form",
                                //           border: true,
                                //           items: [
                                //             {
                                //               xtype: "hidden",
                                //               name: "id",
                                //               id: "torHdrID", //i_is_more
                                //             },
                                //             {
                                //               xtype: disp,
                                //               readOnly: true,
                                //               fieldLabel: "รหัส TOR",
                                //               id: "codeHdrID",
                                //               style: "text-align: center;font-weight:bold;background:#eee;",
                                //               name: "c_code",
                                //             },
                                //             {
                                //               xtype: disp,
                                //               readOnly: true,
                                //               fieldLabel: "เรื่อง TOR",
                                //               name: "c_name",
                                //             },
                                //             {
                                //               xtype: "datefield",
                                //               fieldLabel: "วันที่ใบสั่ง ",
                                //               id: "d_doc_no_dateID",
                                //               name: "d_doc_no_date",
                                //               width: 150,
                                //             },
                                //             {
                                //               xtype: "datefield",
                                //               fieldLabel: "วันที่รับสนองราคา ",
                                //               id: "d_doc_resp_dateID",
                                //               name: "d_doc_resp_date",
                                //               width: 150,
                                //               listeners: {
                                //                 render: function (p) {
                                //                   this.hide();
                                //                 },
                                //               },
                                //             },
                                //             {
                                //               xtype: "buttongroup",
                                //               fieldLabel: "วันที่",
                                //               frame: false,
                                //               border: false,
                                //               items: [
                                //                 {
                                //                   xtype: "datefield",
                                //                   name: "d_tor_date",
                                //                   readOnly: true,
                                //                   validator: function (val) {
                                //                     if (!Ext.isEmpty(val)) {
                                //                       return true;
                                //                     } else {
                                //                       return "กรุณาระบุ ข้อมูลให้ถูกต้อง";
                                //                     }
                                //                   },
                                //                 },
                                //                 {
                                //                   xtype: "tbspacer",
                                //                   width: 18,
                                //                 },
                                //                 {
                                //                   xtype: "label",
                                //                   style: {
                                //                     color: "red",
                                //                     width: "100px",
                                //                   },
                                //                   text: "* วันที่ตามเอกสาร TOR",
                                //                 },
                                //               ],
                                //             },
                                //             {
                                //               xtype: "buttongroup",
                                //               fieldLabel: "จำนวนเงิน",
                                //               frame: false,
                                //               border: false,
                                //               items: [
                                //                 {
                                //                   xtype: "displayfield",
                                //                   fieldLabel: "จำนวนเงิน",
                                //                   name: "f_total_amt",
                                //                   id: "f_totalID",
                                //                   listeners: {
                                //                     blur: function () {
                                //                       this.fn();
                                //                     },
                                //                     afterrender: function () {
                                //                       this.fn = function () {
                                //                         var val = 0;
                                //                         val = this.getValue();
                                //                         var f_total = parseFloat(val.replace(/,/g, "") / 1);
                                //                         this.setValue(Ext.floatRenderer(f_total));
                                //                       };
                                //                       this.fn();
                                //                     },
                                //                   },
                                //                 },
                                //                 {
                                //                   xtype: "button",
                                //                   fieldLabel: "-",
                                //                   text: "ตรวจสอบเงินตามงวด",
                                //                   handler: function () {
                                //                     alert("เหลือเงินงวด 10,000,000.00 บาท");
                                //                   },
                                //                 },
                                //               ],
                                //             },
                                //             {
                                //               xtype: "displayfield",
                                //               fieldLabel: "รหัสเอกสารอ้างอิง",
                                //               name: "d_doc_ref",
                                //             },
                                //             {
                                //               xtype: "buttongroup",
                                //               fieldLabel: "วันที่บันทีกแจ้งเตือน",
                                //               frame: false,
                                //               border: false,
                                //               items: [
                                //                 {
                                //                   xtype: "datefield",
                                //                   name: "DateAdd1",
                                //                   validator: function (val) {
                                //                     if (!Ext.isEmpty(val)) {
                                //                       return true;
                                //                     } else {
                                //                       return "กรุณาระบุ ข้อมูลให้ถูกต้อง";
                                //                     }
                                //                   },
                                //                 },
                                //                 {
                                //                   xtype: "tbspacer",
                                //                   width: 18,
                                //                 },
                                //                 {
                                //                   xtype: "label",
                                //                   style: {
                                //                     color: "red",
                                //                     width: "100px",
                                //                   },
                                //                   text: "* แจ้งเตือน จากวันถัดไป " + Ext.menu_i_alarm + " วัน",
                                //                 },
                                //               ],
                                //             },
                                //             {
                                //               fieldLabel: "วันที่บันทึก",
                                //               xtype: "datefield",
                                //               name: "d_tor_status_date",
                                //               validator: function (val) {
                                //                 if (!Ext.isEmpty(val)) {
                                //                   return true;
                                //                 } else {
                                //                   return "กรุณาระบุ ข้อมูลให้ถูกต้อง";
                                //                 }
                                //               },
                                //             },
                                //             {
                                //               fieldLabel: "เหตผล",
                                //               xtype: "textarea",
                                //               width: 400,
                                //               name: "c_comment",
                                //             },
                                //             {
                                //               id: "i_is_docGroup",
                                //               fieldLabel: "เลือกประเภทเอกสาร",
                                //               xtype: "radiogroup",
                                //               columns: [200, 120],
                                //               items: [
                                //                 {
                                //                   boxLabel: "เลขที่เอกสารใบสั่งซื้อ/สั่งจ้าง/สั่งเช่า ",
                                //                   checked: true,
                                //                   name: "i_is_doc",
                                //                   inputValue: "1",
                                //                 },
                                //                 {
                                //                   boxLabel: "เอกสารรับสนองราคา",
                                //                   name: "i_is_doc",
                                //                   inputValue: "2",
                                //                 },
                                //               ],
                                //               listeners: {
                                //                 change: function (cb, rec, ind) {
                                //                   if (rec.inputValue == 1) this.fnValue(rec.inputValue);
                                //                   else this.fnValue(rec.inputValue);
                                //                 },
                                //                 afterrender: function (obj, eOpts) {
                                //                   this.fnValue = function (id) {
                                //                     if (id == "1") {
                                //                       Ext.getCmp("d_doc_resp_dateID").hide();
                                //                       Ext.getCmp("c_doc_resp_noID").hide();
                                //                       Ext.getCmp("d_doc_no_dateID").show();
                                //                       Ext.getCmp("c_doc_noID").show();
                                //                       //-- start from
                                //                       Ext.getCmp("groupDocRespNoID").hide();
                                //                       Ext.getCmp("groupDocNoID").show();
                                //                       Ext.getCmp("c_otherID1").show();
                                //                       Ext.getCmp("c_otherID2").hide();
                                //                     } else {
                                //                       Ext.getCmp("d_doc_resp_dateID").show();
                                //                       Ext.getCmp("c_doc_resp_noID").show();
                                //                       Ext.getCmp("d_doc_no_dateID").hide();
                                //                       Ext.getCmp("c_doc_noID").hide();
                                //                       //-- start from
                                //                       Ext.getCmp("groupDocRespNoID").show();
                                //                       Ext.getCmp("groupDocNoID").hide();
                                //                       Ext.getCmp("c_otherID2").show();
                                //                       Ext.getCmp("c_otherID1").hide();
                                //                     }
                                //                   };
                                //                 },
                                //               },
                                //             },
                                //             {
                                //               xtype: "textfield",
                                //               fieldLabel: " เลขที่เอกสารรับสนองราคา ",
                                //               id: "c_doc_resp_noID",
                                //               name: "c_doc_resp_no",
                                //               width: 150,
                                //               listeners: {
                                //                 render: function (p) {
                                //                   this.hide();
                                //                 },
                                //               },
                                //             },
                                //             {
                                //               xtype: "textfield",
                                //               fieldLabel: " เลขที่เอกสารใบสั่งซื้อ/สั่งจ้าง/สั่งเช่า",
                                //               id: "c_doc_noID",
                                //               name: "c_doc_no",
                                //               width: 150,
                                //             },
                                //             {
                                //               xtype: "displayfield",
                                //               fieldLabel: "คู่สัญญา/ผู้ขาย ",
                                //               name: "dc_creditor_idTxt",
                                //               cls: "my-label-style",
                                //             },
                                //             {
                                //               fieldLabel: "กำหนดส่งภายใน ",
                                //               xtype: "radiogroup",
                                //               columns: [50, 150],
                                //               items: [
                                //                 {
                                //                   xtype: "textfield",
                                //                   name: "i_delivery",
                                //                   id: "i_deliveryID",
                                //                   value: 1,
                                //                   validator: function (val) {
                                //                     var regex = /^([0-9]+|[0-9]{1,3}(,[0-9]{3})*)(\.[0-9]{1,2})?$/;
                                //                     var strMoney = val.replace(",", "");
                                //                     if (!regex.test(val)) {
                                //                       return "กรุณากรอก จำนวนเงินเป็นจำนวนทศนิยม มูลค่ามากกว่า 0.00";
                                //                     } else {
                                //                       return true;
                                //                     }
                                //                   },
                                //                 },
                                //                 {
                                //                   xtype: "displayfield",
                                //                   value: "วัน ",
                                //                   cls: "my-label-style",
                                //                 },
                                //               ],
                                //             },
                                //             {
                                //               fieldLabel: "นับถัดจาก/นับตั้งแต่ ",
                                //               id: "groupDocNoID", //i_is_doc = 1 groupDocRespNoID groupDocNoID
                                //               xtype: "radiogroup",
                                //               columns: [220, 100, 220],
                                //               items: [
                                //                 { boxLabel: "วันลงนามในใบสั่งซื้อ/สั่งจ้าง/สั่งเช่า ", checked: true, name: "i_is_start_from_contract1", inputValue: "2" },
                                //                 { boxLabel: "อื่นๆ ", name: "i_is_start_from_contract1", inputValue: "3" },
                                //                 { xtype: "textfield", id: "c_otherID1", name: "another_detail1", emptyText: "  ( เฉพาะกรณีการเลือกอื่นๆ) ", disabled: true, width: 430 },
                                //               ],
                                //               listeners: {
                                //                 change: function (cb, rec, ind) {
                                //                   this.fnValue(rec.inputValue);
                                //                 },
                                //                 afterrender: function (obj, eOpts) {
                                //                   this.fnValue = function (id) {
                                //                     if (id == "3") {
                                //                       Ext.getCmp("c_otherID1").setDisabled(false);
                                //                       Ext.getCmp("c_otherID1").focus();
                                //                     } else {
                                //                       Ext.getCmp("c_otherID1").setDisabled(true);
                                //                       Ext.getCmp("c_otherID1").setValue(null);
                                //                     }
                                //                   };
                                //                   if (Ext.getCmp("i_is_docGroup").getValue().inputValue == 1) this.show();
                                //                   else this.show();
                                //                 },
                                //               },
                                //             },
                                //             {
                                //               /*
                                //                                           $arr_con1			= array("0"=>"วันที่รับสนองราคา","1"=>"วันลงนามในสัญญา");
                                //                                           $arr_con2			= array("2"=>"วันลงนามในใบสั่งซื้อ/สั่งจ้าง/สั่งเช่า");
                                //                                           $arr_con3			= array("3"=>"อื่นๆ");
                                //                                           */
                                //               fieldLabel: "นับถัดจาก/นับตั้งแต่ ",
                                //               id: "groupDocRespNoID", //i_is_doc = 2
                                //               xtype: "radiogroup",
                                //               columns: [120, 120, 50, 220],
                                //               items: [
                                //                 { boxLabel: "วันที่รับสนองราคา", checked: true, name: "i_is_start_from_contract2", inputValue: "0" },
                                //                 { boxLabel: "วันลงนามในสัญญา  ", name: "i_is_start_from_contract2", inputValue: "1" },
                                //                 { boxLabel: "อื่นๆ ", name: "i_is_start_from_contract2", inputValue: "3" },
                                //                 { xtype: "textfield", id: "c_otherID2", name: "another_detail", emptyText: "  ( เฉพาะกรณีการเลือกอื่นๆ) ", width: 430, disabled: true },
                                //               ],
                                //               listeners: {
                                //                 change: function (cb, rec, ind) {
                                //                   this.fnValue(rec.inputValue);
                                //                 },
                                //                 afterrender: function (obj, eOpts) {
                                //                   this.fnValue = function (id) {
                                //                     if (id == "3") {
                                //                       Ext.getCmp("c_otherID2").setDisabled(false);
                                //                       Ext.getCmp("c_otherID2").focus();
                                //                     } else {
                                //                       Ext.getCmp("c_otherID2").setDisabled(true);
                                //                       Ext.getCmp("c_otherID2").setValue(null);
                                //                     }
                                //                   };

                                //                   if (Ext.getCmp("i_is_docGroup").getValue().inputValue == 1) {
                                //                     this.hide();
                                //                   } else {
                                //                     this.show();
                                //                   }
                                //                 },
                                //               },
                                //             },
                                //             {
                                //               fieldLabel: "รายการค่าปรับ  ",
                                //               id: "i_is_fineID",
                                //               xtype: "radiogroup",
                                //               columns: [150, 150, 220, 150, 150],
                                //               items: [
                                //                 { boxLabel: "ค่าปรับคิดเป็น (%) ", checked: true, name: "i_is_fine", inputValue: "1" }, //i_fine_per
                                //                 { boxLabel: "ค่าปรับ(บาท)/วัน ", name: "i_is_fine", inputValue: "2" }, //i_fine_amt
                                //                 {
                                //                   xtype: "textfield",
                                //                   id: "i_is_fineTextID", //(i_fine_amt,i_fine_per) in i_is_fineTextID fn(cal)
                                //                   name: "f_fine",
                                //                   width: 430,
                                //                   value: "0.00",
                                //                   validator: function (val) {
                                //                     var regex = /^([0-9]+|[0-9]{1,3}(,[0-9]{3})*)(\.[0-9]{1,2})?$/;
                                //                     var strMoney = val.replace(",", "");
                                //                     if (!regex.test(val)) {
                                //                       return "กรุณากรอก จำนวนเงินเป็นจำนวนทศนิยม มูลค่ามากกว่า 0.00";
                                //                     } else {
                                //                       return true;
                                //                     }
                                //                   },
                                //                 },
                                //                 { xtype: "displayfield", id: "fpPt", value: "%", cls: "my-label-style" },
                                //                 {
                                //                   xtype: "displayfield",
                                //                   id: "fpBt",
                                //                   value: "บาท ",
                                //                   cls: "my-label-style",
                                //                   listeners: {
                                //                     render: function (p) {
                                //                       this.hide();
                                //                     },
                                //                   },
                                //                 },
                                //               ],
                                //               listeners: {
                                //                 change: function (cb, rec, ind) {
                                //                   this.fnValue(rec.inputValue);
                                //                 },
                                //                 afterrender: function (obj, eOpts) {
                                //                   this.fnValue = function (id) {
                                //                     if (id == "2") {
                                //                       Ext.getCmp("fpPt").hide();
                                //                       Ext.getCmp("fpBt").show();
                                //                     } else {
                                //                       Ext.getCmp("fpPt").show();
                                //                       Ext.getCmp("fpBt").hide();
                                //                     }
                                //                   };
                                //                 },
                                //               },
                                //             },
                                //             {
                                //               xtype: "radiogroup",
                                //               columns: [180],
                                //               fieldLabel: "โหมดการบันทึก",
                                //               id: "modesubID",
                                //               style: {
                                //                 "font-weight": "bold",
                                //               },
                                //               items: [
                                //                 {
                                //                   name: "mode",
                                //                   checked: true,
                                //                   inputValue: "UPDATEFORMSTSATUS",
                                //                   boxLabel: "อัพเดทรายการ",
                                //                 },
                                //               ],
                                //             },
                                //           ],
                                //           buttonAlign: "center",
                                //           buttons: [
                                //             {
                                //               text: "บันทึกรายการ",
                                //               id: "buSaveSubID",
                                //               iconCls: "icon-save",
                                //               handler: function () {
                                //                 var formSubmit = function () {
                                //                   form.submit({
                                //                     waitMsg: "Saving Data...",
                                //                     success: function (form, action) {
                                //                       Ext.Msg.alert("Success", action.result.msg, function (form, action) {
                                //                         Ext.getCmp("tabpanel1").getStore().reload();
                                //                         Ext.selectRow = null;
                                //                         Ext.getCmp("winChequeID").destroy();
                                //                       });
                                //                     },
                                //                     failure: function (form, action) {
                                //                       switch (action.failureType) {
                                //                         case Ext.form.Action.CLIENT_INVALID:
                                //                           Ext.Msg.alert("Failure", "Form fields may not be submitted with invalid values");
                                //                           break;
                                //                         case Ext.form.Action.CONNECT_FAILURE:
                                //                           Ext.Msg.alert("Failure", "พลข้อผิดพลาดในการเชื่อต่อเครือข่าย");
                                //                           break;
                                //                         case Ext.form.Action.SERVER_INVALID:
                                //                           Ext.Msg.alert("Failure", action.result.msg);
                                //                       }
                                //                     },
                                //                   });
                                //                 }; //END

                                //                 var form = Ext.getCmp(Ext.poFormID).getForm();
                                //                 if (form.isValid()) {
                                //                   if (Ext.getCmp("modesubID").getValue().inputValue === "VIEW") {
                                //                   } else if (Ext.getCmp("modesubID").getValue().inputValue === "DELETE") {
                                //                     Ext.MessageBox.show({
                                //                       title: "Icon Support",
                                //                       msg: "คุณต้องการที่จะลบ รายการที่เลือกนี้ใช่ใหม ?",
                                //                       buttons: Ext.MessageBox.OKCANCEL,
                                //                       icon: Ext.MessageBox.WARNING,
                                //                       fn: function (btn) {
                                //                         if (btn === "ok") {
                                //                           formSubmit(form);
                                //                         } else {
                                //                           return;
                                //                         }
                                //                       },
                                //                     });
                                //                   } else {
                                //                     formSubmit(form);
                                //                   }
                                //                 }
                                //               },
                                //               //haddler
                                //             },
                                //             {
                                //               text: Ext.GLOBAL_BU_BACK_TH,
                                //               handler: function () {
                                //                 Ext.getCmp(Ext.poFormID).hide();
                                //                 Ext.getCmp(Ext.poFormID).destroy();
                                //               },
                                //             },
                                //           ],
                                //         },
                                //         {
                                //           columnWidth: 0.4,
                                //           layout: "table",
                                //         },
                                //       ],
                                //     },
                                //   ],
                                // }),
                    ],
                },
            ],
        });
    };
    var MenuButton = function () {
        // show Menu Edit Grid
        var editm = Ext.menuEditGrid;
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
        //    รายการเมนู
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
        //  เพิ่มข้อมูล
        menu
                .add({
                    text: "ค้นหาข้อมูล",
                    icon: "../images/icons/book_magnify.png",
                })
                .on(
                        "click",
                        (click = function () {
                            //             Ext.loadStore("add", false); // app,data.load
                        })
                        );
        //  เพิ่มข้อมูล
        menu
                .add({
                    text: "เพิ่มข้อมูล",
                    icon: "../images/icons/add.png",
                })
                .on(
                        "click",
                        (click = function () {
                            Ext.loadStore("add", false); // app,data.load
                        })
                        );

        // แก้ไขข้อมูล
        menu
                .add({
                    text: "จัดการข้อมูล View/Copy/Edit/Delete",
                    icon: "../images/icons/application_edit.png",
                })
                .on(
                        "click",
                        (click = function () {
                            Ext.loadStore("edit", true); // app,data.load
                        })
                        );
        //   แก้ไขข้อมูลผ่าน
        if (editm === true) {
            menu
                    .add({
                        text: "แก้ไขข้อมูลผ่าน Data Grid",
                        icon: "../images/icons/application_form_add.png",
                    })
                    .on(
                            "click",
                            (click = function () {
                                Ext.gridMainfn(true);
                            })
                            );
            // ยกเลิก
            menu
                    .add({
                        text: "ยกเลิกการแก้ไขฝ่าน Data Grid",
                        icon: "../images/icons/application_form_delete.png",
                    })
                    .on(
                            "click",
                            (click = function () {
                                Ext.gridMainfn(false);
                            })
                            );
        }
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
    function SearchFrm() {
        return new Ext.Window({
            //                     collapsible: true,
            //                     maximizable: true,
            title: "ค้นหารายการ",
            width: 700,
            id: "winSearchFrm",
            height: 125,
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
                                        // {
                                        //     xtype: "datefield",
                                        //     fieldLabel: "วันที่ TOR",
                                        //     id: "sd_tor_dateID",
                                        //     name: "d_tor_date",
                                        // },
                                        // {
                                        //     xtype: "radiogroup",
                                        //     columns: [120],
                                        //     fieldLabel: "ผ่านรายการ",
                                        //     id: "searchPostID",
                                        //     items: [
                                        //         {
                                        //             name: "i_post",
                                        //             checked: true,
                                        //             inputValue: 0,
                                        //             boxLabel: "ทั้งหมด",
                                        //         },
                                        //         {
                                        //             name: "i_post",
                                        //             inputValue: 1,
                                        //             boxLabel: "ผ่านรายการแล้ว",
                                        //         },
                                        //         {
                                        //             name: "i_post",
                                        //             inputValue: 2,
                                        //             boxLabel: "ยังไม่ผ่านรายการ",
                                        //         },
                                        //     ], //radiogroup
                                        // },
                            ],
                        },
                        {
                            columnWidth: 0.5,
                            layout: "form",
                            border: false,
                            items: [
                                {
                                    xtype: "textfield",
                                    fieldLabel: "ชื่อคู่สัญญา",
                                    id: "sc_nameID",
                                    name: "c_name",
                                },
                                        // new Ext.form.ComboBox({
                                        //     mode: "local",
                                        //     store: new Ext.data.JsonStore({
                                        //         autoDestroy: false,
                                        //         autoLoad: false,
                                        //         url: "api/All_spAlert.php",
                                        //         baseParams: {
                                        //             type: "sp_type_status",
                                        //             i_is_type_tor: true,
                                        //             all: "all",
                                        //         },
                                        //         root: "data",
                                        //         idProperty: "id",
                                        //         fields: ["id", "c_name"],
                                        //     }),
                                        //     anchor: "100%",
                                        //     fieldLabel: "วิธีดำเนินงาน",
                                        //     submitValue: true,
                                        //     hiddenName: "stor_type_id",
                                        //     name: "sc_type_id",
                                        //     id: "stor_type_idID",
                                        //     valueField: "id",
                                        //     displayField: "c_name",
                                        //     triggerAction: "all",
                                        //     forceSelection: false,
                                        //     selectOnFocus: true,
                                        //     typeAhead: false,
                                        //     emptyText: "กรุณาเลือก",
                                        //     listeners: {
                                        //         afterrender: function () {
                                        //             //setLoad&&callback
                                        //             this.store.load({
                                        //                 callback: function (record, operation, success) {
                                        //                     if (success) {
                                        //                         Ext.getCmp("stor_type_idID").setValue(this.data.items[0].get("c_name"));
                                        //                     }
                                        //                 },
                                        //             });
                                        //         },
                                        //     },
                                        // }),
                                        // {
                                        //     xtype: "radiogroup",
                                        //     columns: [80, 90],
                                        //     fieldLabel: "สถานะการใช้งาน",
                                        //     id: "searchEnabledID",
                                        //     items: [
                                        //         {
                                        //             name: "i_enabled",
                                        //             checked: true,
                                        //             inputValue: 1,
                                        //             boxLabel: "ใช้งาน",
                                        //         },
                                        //         {
                                        //             name: "i_enabled",
                                        //             inputValue: 2,
                                        //             boxLabel: "ไม่ใช้งาน",
                                        //         },
                                        //     ], //radiogroup
                                        // },
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
                                // Ext.storeDtl.setBaseParam("tor_type_id", Ext.getCmp("stor_type_idID").getValue());

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
        });
    }

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
                        header: "ลำดับ",
                        sortable: false,
                        align: "left",
                        dataIndex: "id",
                        hidden: true, // icon: "../images/icons/application_view_tile.png"
                    },
                    {
                        header: "ชื่อคู่สัญญา",
                        sortable: false,
                        align: "left",
                        dataIndex: "dc_creditor_idTxt",
                        width: 150,
                    },
                    {
                        header: "เลขที่สัญญา",
                        sortable: false,
                        align: "left",
                        dataIndex: "c_doc_ref",
                        width: 120,
//                    },
//                    {
//                        header: "สัญญาแบบ",
//                        sortable: false,
//                        align: "left",
//                        dataIndex: "i_is_po",
//                        width: 90,
//                        renderer: function (val, metaData, record, rowIndex, colIndex, store) {
//                            var i = val == 1 ? "&nbsp;&nbsp;สัญญาย่อย" : "สัญญาปกติ";
//                            return i;
//                        },
                    },
                    {
                        header: "สถานะ",
                        sortable: false,
                        align: "center",
                        dataIndex: "d_period_date",
                        id: "processDueID",
                        width: 90,
                        renderer: function (value, metaData, record, row, col, store, gridView) {
                            metaData.attr = "style='cursor:pointer; text-align:center;';";
                            //...
                            if (record.data.i_contract_status > 2) {
                                return '<img src="../images/icons/application_go.png" style="cursor:pointer"/>';
                            } else {
                                return '<img src="../images/icons/application_view_tile.png"); style="cursor:pointer"/>';
                            }
                        },
                    },
                    {
                        header: "วันที่สิ้นสุดสัญญา",
                        sortable: false,
                        align: "center",
                        dataIndex: "d_due_date",
                        width: 100,
                    },
                    {
                        header: "เรื่อง",
                        align: "left",
                        dataIndex: "c_name",
                        width: 150,
                    },
                    {
                        header: "วิธีดำเนินงาน",
                        sortable: false,
                        align: "left",
                        dataIndex: "c_tor_type",
                    },
                    {
                        header: "ขอดำเนินการ",
                        sortable: false,
                        align: "left",
                        dataIndex: "c_purchase",
                    },
                    {
                        header: "รหัสเอกสารอ้างอิง",
                        sortable: false,
                        align: "center",
                        dataIndex: "d_doc_ref",
                    },
                    {
                        header: "หน่วยงานเจ้าของเรื่อง",
                        align: "left",
                        dataIndex: "dc_cost_idTxt",
                    },
                    {
                        header: "ชื่อผู้สร้างรายการ",
                        sortable: false,
                        align: "center",
                        dataIndex: "dc_user_create_id",
                        hidden: true,
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
                    title: Ext.title + "",
                    xtype: "grid",
                    id: "tabpanel1",
                    border: true,
                    stripeRows: true,
                    loadMask: true,
                    //------------------
                    tbar: [
                        {
                            xtype: "button",
                            text: " ค้นหา ",
                            width: 80,
                            iconCls: "icon-application-view-list",
                            handler: function () {
                                if (!Ext.isEmpty(Ext.getCmp("winSearchFrm")))
                                    Ext.getCmp("winSearchFrm").destroy();
                                var s1 = SearchFrm();
                                s1.show();
                            },
                        },
                    ],
                    layout: "fit",
                    clicksToEdit: 2,
                    viewConfig: {
                        emptyText: "ไม่มีข้อมูล..",
                        deferEmptyText: true,
                    },
                    listeners: {
                        dblclick: function (dataview, index, item, e) {
                            Ext.buAct = "update";
                            Ext.loadStore("edit", true); // app,data.load
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
                                        text: "ค้นหาข้อมูล",
                                        icon: "../images/icons/book_magnify.png",
                                        handler: function (e) {
                                            //                                                     Ext.loadStore("add", true); // app,data.load
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
                                    },
                                    {
                                        text: "จัดการข้อมูล View/Copy/Edit/Delete",
                                        icon: "../images/icons/application_edit.png",
                                        handler: function (e) {
                                            Ext.loadStore("edit", true); // app,data.load
                                        },
                                        scope: this,
                                    },
                                    {
                                        text: "คัดลอกข้อมูลใน copy data in cell grid",
                                        icon: "../images/icons/page_copy.png",
                                        handler: function (e) {
                                            //field
                                            var arrDataCopy = ["c_detail", "c_code_ref", "po_creditor_name"];
                                            var rowx = Ext.selectRow;

                                            if (!Ext.isEmpty(rowx) && !Ext.isEmpty(arrDataCopy))
                                                //if Ctlr+c
                                                CopyToClipboard(rowx, arrDataCopy);
                                        },
                                        scope: this,
                                    },
                                ],
                            });
                        },
                        afterrender: function (g) {
                            //g.getStore().getAt(rowIndex);
                            //  console.log();

                            this.on("cellclick", cellClick, this); //cellClick
                            this.on(
                                    "contextmenu",
                                    function (e, grid, rowIndex, columnIndex) {
                                        e.stopEvent();
                                        this.contextMenu.showAt(e.getXY());
                                    },
                                    this
                                    );

                            /*
                             //  Ctlr+c
                             new Ext.KeyMap(Ext.get('tabpanel1'), [{
                             key: "c",
                             ctrl: true,
                             scope: this,
                             fn: function (e, ele) {
                             ele.preventDefault();
                             var arrDataCopy = ["c_detail", "c_code_ref", "po_creditor_name"];
                             var rowx = Ext.selectRow;
                             if (!Ext.isEmpty(rowx) && !Ext.isEmpty(arrDataCopy)) //if Ctlr+c
                             CopyToClipboard(rowx, arrDataCopy);
                             
                             }
                             }]);
                             //end key
                             */
                        },
                    },
                    store: Ext.storeDtl,
                    columns: colmnn,
                    bbar: new Ext.PagingToolbar({
                        pageSize: 20,
                        store: Ext.storeDtl,
                        displayInfo: true,
                        displayMsg: "Displaying topics {0} - {1} of {2}",
                    }),
                });
            }),
            Ext.grid.EditorGridPanel,
            {}
    );

    Ext.extend(Ext.Panel, {});

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
};
