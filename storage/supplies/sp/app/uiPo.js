/*!
 * Ext JS Library 3.4.0
 * Copyright(c) 2006-2011 Sencha Inc.
 * licensing@sencha.com
 * http://www.sencha.com/license
 */
/* global Ext */
//(Ext.Poplov_in)ใช้เฉพาะหน้า บันทึกใบขอเบิก
Ext.part_file_pdf = "http://" + location.host + "/pdf_po/";
Ext.Poplov_in = Ext.extend(Ext.Button, {
    config: {
        //    	   		mini 		: null,
        //    	   		widthText	: 0,
        //    	   		headerGrid	: [], 	//json
    },
    initComponent: function () {
        this.mini = this.Minipop();
        this.isCellClickGrid = false;
        this.isSetFilter = false;
        this.setReset();
    },

    setReset: function (t) {
        if (t) {
            Ext.getCmp(this.id + "_Name").setValue();
            Ext.getCmp(this.id).setValue();
        }
    },
    afterrender: function () {},
    uiSearch: function (id) {
        var store = this.store;
        var headerGrid = this.headerGrid;
        var id = id;

        var setDefaultFilter = [
            ["c_code", "เลขที่ใบเบิก"],
            ["c_name", "รายการ"],
        ];
        var setFilter = [["c_name", "รายการ"]];

        var filterGrid = new Ext.data.SimpleStore({
            fields: ["value", "text"],
            data: this.isSetFilter ? setFilter : setDefaultFilter,
        });
        var store = this.store;

        var filterGrid = Ext.isEmpty(this.filterGrid) ? filterGrid : this.filterGrid; //comb&store filter
        var defFilter = this.defFilter; //default filter

        return [
            {
                id: "filter" + id,
                xtype: "combo",
                width: 130,
                mode: "local",
                store: filterGrid,
                valueField: "value",
                displayField: "text",
                allowBlank: false,
                editable: false,
                triggerAction: "all",
                typeAhead: false,
                value: Ext.isEmpty(defFilter) ? "c_code" : defFilter,
            },
            "-",
            {
                id: "value-box" + id,
                xtype: "textfield",
                width: 130,
                fieldLabel: "fieldLabel",
                emptyText: "คำที่ต้องการค้นหา",
                listeners: {
                    specialkey: function (f, e) {
                        if (e.getKey() == e.ENTER) {
                            store.setBaseParam("mode", "SEARCH");
                            store.setBaseParam("filter", Ext.getCmp("filter" + id).getValue());
                            store.setBaseParam("value", Ext.getCmp("value-box" + id).getValue());
                            Ext.getCmp("win-pop-lov-modal-" + id)
                                    .getStore()
                                    .load();
                        }
                    },
                },
            },
        ];
    },

    Minipop: function () {
        /******/
        var store = this.store;
        var headerGrid = this.headerGrid;
        var id = this.id;
        var nameID = this.id + "_Name";
        var widthText = isNaN(this.widthText) ? 198 : this.widthText;
        var uiSearch = this.uiSearch(id);

        /*****/
        function SearchGrid(store, id) {
            if (Ext.getCmp("value-box" + id).getValue() != "") {
                store.setBaseParam("mode", "SEARCH");
                store.setBaseParam("filter", Ext.getCmp("filter" + id).getValue());
                store.setBaseParam("value", Ext.getCmp("value-box" + id).getValue());
                Ext.getCmp("win-pop-lov-modal-" + id)
                        .getStore()
                        .load();
            } else {
                store.setBaseParam("mode", "");
                Ext.getCmp("win-pop-lov-modal-" + id)
                        .getStore()
                        .load();
            }
        }

        var cellClick_lov = function (grid, rowIndex, columnIndex, e) {
            var record = grid.getStore().getAt(rowIndex);
            var TextShow = record.data.c_code + " " + record.data.c_name;

            Ext.getCmp(id).setValue(record.data.id);
            Ext.getCmp(nameID).setValue(TextShow);

            Ext.getCmp("win-pop-lov" + id).hide();
            Ext.getCmp("win-pop-lov" + id).destroy();
        };

        cellClick_lov = this.isCellClickGrid ? this.cellClickGrid : cellClick_lov;

        return {
            fieldLabel: this.fieldLabel,
            xtype: "radiogroup",
            id: "pop_" + this.id,
            columns: [0, widthText, 40],
            hidden: this.hidden == true ? true : false,
            listeners: {
                afterrender: this.afterrender,
            },
            items: [
                {
                    xtype: "hidden",
                    name: this.valueHidden,
                    id: id,
                    value: this.value,
                },
                {
                    xtype: "textfield",
                    name: "txt" + this.id,
                    emptyText: this.text,
                    id: nameID,
                    readOnly: true,
                },
                {
                    xtype: "button",
                    id: "Bu" + this.id,
                    name: "Bu" + this.id,
                    iconCls: this.iconCls,
                    handler: function () {
                        /* //Load Store Begin SearchGrid */
                        store.setBaseParam("mode", "");
                        store.load();

                        var win = new Ext.Window({
                            id: "win-pop-lov" + id,
                            title: "เลือกข้อมูล",
                            modal: true,
                            plain: true,
                            layout: "fit",
                            maximizable: true,
                            constrainHeader: true,
                            closable: true,
                            listeners: {
                                afterrender: function (obj, eOpts) {
                                    this.fn = function (widht, height) {
                                        //percentage
                                        var width = Ext.getBody().getViewSize().width * widht;
                                        var height = Ext.getBody().getViewSize().height * height;
                                        this.setSize(width, height);
                                    };
                                    this.fn(0.8, 0.85);
                                },
                                maximize: function (window, opts) {
                                    //when property minimizable
                                    window.setWidth(Ext.getBody().getViewSize().width * 0.99);
                                    window.expand("", false);
                                    window.center();
                                },
                            },
                            items: [
                                {
                                    xtype: "grid",
                                    id: "win-pop-lov-modal-" + id,
                                    border: false,
                                    stripeRows: true,
                                    loadMask: true,
                                    store: store,
                                    tbar: [
                                        uiSearch,
                                        " ",
                                        "-",
                                        {
                                            text: "ค้นหา",
                                            id: "magnifier_" + id,
                                            iconCls: "icon-magnifier",
                                            handler: function () {
                                                SearchGrid(store, id); /*SearchEngin(store,id);*/
                                            },
                                        } /* ,' ',{
                                         text : "เคลียร์ค่า",
                                         id:'clearValue_'+id,
                                         iconCls: 'icon-clear',
                                         handler : function() {  
                                         Ext.getCmp(id).setValue('');
                                         Ext.getCmp(nameID).setValue('');  
                                         Ext.getCmp("win-pop-lov"+id).hide();  					
                                         Ext.getCmp("win-pop-lov"+id).destroy();  
                                         
                                         }
                                         } */,
                                    ],
                                    columns: headerGrid,
                                    listeners: {
                                        afterrender: function (obj, eOpts) {
                                            this.fn = function (widht, height) {
                                                //percentage

                                                var width = Ext.getBody().getViewSize().width * widht;
                                                var height = Ext.getBody().getViewSize().height * height;
                                                this.setSize(width, height);
                                            };
                                            this.fn(0.5, 0.4);
                                        },
                                    },
                                    autoExpandColumn: "c_name",
                                    bbar: new Ext.PagingToolbar({
                                        pageSize: 15,
                                        store: store,
                                        displayInfo: true,
                                        displayMsg: "Displaying topics {0} - {1} of {2}",
                                    }),
                                },
                            ],
                        });

                        win.show();
                        Ext.getCmp("win-pop-lov-modal-" + id).on("cellclick", cellClick_lov, this);
                    },
                },
            ],
        };
    }, //Mini
});

Ext.AppUx = function (app, menu) {
    Ext.HDR_ID = null;
    // storeYear
    Ext.selectRow = null;
    Ext.menuEditGrid = false;
    Ext.menuRightEditgrid = true;
    let years = [];
    let currentTime = new Date();
    let now = currentTime.getFullYear() + 1;
    let id = currentTime.getFullYear() - 3;
    while (id <= now) {
        let c_name = id + 543;
        years.push({id, c_name});
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

    function cellClick(grid, rowIndex, columnIndex, e) {
//       Ext.selectRow = this.selModel.selection.record;
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
        autoLoad: false,
        url: "api/All_PoWorkingImpHdr.php",
        baseParams: {
            type: "po_emp",
        },
        root: "data",
        idProperty: "id",
        fields: ["id", "c_code", "c_name"],
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
    Ext.bg_expense_group = new Ext.data.JsonStore({
        autoDestroy: false,
        autoLoad: true,
        url: "api/All_PoWorkingImpHdr.php",

        baseParams: {
            type: "bg_expense_group",
        },
        root: "data",
        idProperty: "id",
        fields: ["id", "c_name"],
    });
//  Ext.bg_expense = new Ext.data.JsonStore({
//    autoDestroy: false,
//    autoLoad: false,
//    url: "api/All_PoWorkingImpHdr.php",
//    baseParams: {
//      type: "bg_expense",
//    },
//    root: "data",
//    idProperty: "id",
//    fields: ["id", "c_name"],
//  });
    Ext.bg_expense = new Ext.data.JsonStore({
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

//   Ext.po_expense = new Ext.data.JsonStore({
//    autoDestroy: false,
//    autoLoad: true,
//    url: "api/All_PoWorkingImpHdr.php",
//    baseParams: {
//      type: "po_expense",
//    },
//    root: "data",
//    idProperty: "id",
//    fields: ["id", "c_name"],
//  }); 

    Ext.storeCont = new Ext.data.JsonStore({
        //autoLoad: true,
        storeId: "myStoreCont",
        url: "api/List_PoWorkingDtlCancel.php", //List_PoWorkingDtlCancel.php
        baseParams: {type: "storeDtlCancel", id: 0},
        root: "data",
        idProperty: "po_working_hdr_id",
        totalProperty: "totalCount",
        fields: [
            {name: "no"},
            {name: "id"},
            {name: "c_code"},
            {name: "c_name"},
            {name: "c_status_last"},
            {name: "dc_cost_idTxt"},
            {name: "dc_expense_budget_type_idTxt"},
            {name: "bg_expense_group_idTxt"},
            {name: "po_working_hdr_id"},
            {name: "po_working_dtl_id"},
            {name: "i_budget_year"},
            {name: "i_budget_year_overlap"},
            {name: "i_type_year"},
            {name: "dc_cost_id"},
            {name: "po_creditor_transfer_id"},
            {name: "po_creditor_id"},
            {name: "dc_expense_budget_type_id"},
            {name: "bg_expense_group_id"},
            {name: "c_approve_name"},
            {name: "bg_expense_id"},
            {name: "bg_expense_idTxt"},
            {name: "d_audit_date"},
            {name: "d_approve_date"},
            {name: "po_emp_id"},
            {name: "dc_approve_id"},
            {name: "c_code_ref"},
            {name: "d_doc_date"},
            {name: "d_inv_date"},
            {name: "po_creditor_id"},
            {name: "po_creditor_name"},
            {name: "c_detail"},
            {name: "c_qty"},
            {name: "f_total"},
            {name: "c_comment"},
        ],
    });
    Ext.storeDtl = new Ext.data.JsonStore({
        autoDestroy: false,
        autoLoad: true,
        url: "../po/api/List_PoWorkingDtl.php",
        baseParams: {
            type: "po_working_dtl",
            keyData: Ext.keyData,
        },
        root: "data",
        idProperty: "id",
        totalProperty: "totalCount",
        fields: [
            {name: "no"},
            {name: "id"},
            {name: "c_status_last"},
            {name: "dc_cost_idTxt"},
            {name: "c_approve_name"},
            {name: "dc_expense_budget_type_idTxt"},
            {name: "bg_expense_group_idTxt"},
            {name: "po_working_hdr_id"},
            {name: "po_working_dtl_id"},
            {name: "i_budget_year"},
            {name: "i_budget_year_overlap"},
            {name: "i_type_year"},
            {name: "dc_cost_id"},
            {name: "po_creditor_transfer_id"},
            {name: "po_creditor_id"},
            {name: "c_code_invoice"},
            {name: "dc_expense_budget_type_id"},
            {name: "bg_expense_group_id"},
            {name: "bg_expense_id"},
            {name: "bg_expense_idTxt"},
            {name: "d_audit_date"},
            {name: "d_approve_date"},
            {name: "po_emp_id"},
            {name: "dc_approve_id"},
            {name: "c_code_ref"},
            {name: "d_doc_date"},
            {name: "d_inv_date"},
            {name: "po_creditor_id"},
            {name: "po_creditor_name"},
            {name: "c_detail"},
            {name: "c_qty"},
            {name: "f_total"},
            {name: "c_comment"},
            {name: "i_is_url_pdf_hdr"},
            {name: "i_is_url_pdf_dtl"},
            {name: "pdf_hdr"},
            {name: "pdf_dtl"},
            {name: "i_am_status" ,type:'int'},
            {name: "i_acc_status" ,type:'int'},
            
        ],
    });
    Ext.store_year = new Ext.data.JsonStore({
        fields: ["id", "c_name"],
        autoDestroy: false,
        autoLoad: false,
        data: years,
    });

    function DisbledButton(t) {
        //Disabled etc...
        if (t) {
            Ext.getCmp("buSaveID").hide();
        } else {
            Ext.getCmp("buSaveID").show();
        }
    }
    //Ext
    Ext.keyData = 1; //type data key in
    Ext.title = "ข้อของการขอเบิก";
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
    Ext.loadStore = function (status) {
        var statusx = status; 
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
                                                                                    Ext.bg_expense_group.reload({
                                                                                        callback: function (recordx, operation, success) {
                                                                                            if (success) {
                                                                                                Ext.bg_expense.reload({
                                                                                                    callback: function (recordx, operation, success) {
                                                                                                        if (success) {
                                                                                                            if (statusx === "load") {
                                                                                                            } else
                                                                                                                AppPoStore(statusx).show();

                                                                                                            if (statusx === "add") {
                                                                                                                Ext.selectRow = null;
                                                                                                                Ext.HDR_ID = null;
                                                                                                                Ext.pdf_hdr = null;
                                                                                                                Ext.pdf_dtl = null;
                                                                                                                Ext.i_is_url_pdf_hdr = null;
                                                                                                                Ext.i_is_url_pdf_dtl = null;
                                                                                                            } else if (statusx === "edit") {
                                                                                                                Ext.HDR_ID = Ext.selectRow.data.po_working_hdr_id;
                                                                                                                Ext.pdf_hdr = Ext.selectRow.data.pdf_hdr;
                                                                                                                Ext.pdf_dtl = Ext.selectRow.data.pdf_dtl;
                                                                                                                Ext.i_is_url_pdf_hdr = Ext.selectRow.data.i_is_url_pdf_hdr;
                                                                                                                Ext.i_is_url_pdf_dtl = Ext.selectRow.data.i_is_url_pdf_dtl;
                                                                                                                Ext.getCmp("winChequeID").items.items[0].getForm().loadRecord(Ext.selectRow);
                                                                                                            }
                                                                                                            //
                                                                                                        }
                                                                                                    },
                                                                                                }); //bg_expense
                                                                                            }
                                                                                        },
                                                                                    }); //bg_expense_group
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
        /*
        var comboEmp = new Ext.form.ComboBox({
            mode: "local",
            store: Ext.po_emp,
            anchor: "80%",
            fieldLabel: "ผู้ดำเนินการ",
            submitValue: true,
            hiddenName: "po_emp_id", //bg_expense_group_id
            name: "po_emp_name",
            valueField: "id",
            displayField: "c_name",
            triggerAction: "all",
            forceSelection: false,
            selectOnFocus: true,
            typeAhead: false,
            emptyText: "กรุณาเลือกคีย์เพิ่มหรือว่างไว้",
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

        var document_inspector = new Ext.form.ComboBox({
            mode: "local",
            store: Ext.po_user_permission,
            anchor: "80%",
            fieldLabel: "ผู้ตรวจอนุมัติฎีกา",
            submitValue: true,
            hiddenName: "dc_approve_id", //bg_expense_group_id
            name: "c_checker_name",
            valueField: "id",
            displayField: "c_name",
            triggerAction: "all",
            forceSelection: true,
            selectOnFocus: true,
            typeAhead: false,
            emptyText: "กรุณาเลือกผู้ตรวจอนุมัติฎีกา...",
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
        */
       
        var comboCost = new Ext.form.ComboBox({
            mode: "local",
            store: Ext.dc_cost,
            anchor: "80%",
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
            store: Ext.dc_expense_budget_type,
            fieldLabel: "แหล่งเงิน",
            anchor: "80%",
            submitValue: true,
            name: "dc_expense_budget_type_idTxt",
            hiddenName: "dc_expense_budget_type_id", //bg_expense_group_id
            valueField: "id",
            displayField: "c_name",
            triggerAction: "all",
            forceSelection: true,
            selectOnFocus: true,
            typeAhead: false,
            emptyText: "กรุณาเลือกแหล่งเงิน...",
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
        var comboBgYear = new Ext.form.ComboBox({
            mode: "local",
            fieldLabel: "ปีงบประมาณ",
            submitValue: true,
            hiddenName: "i_budget_year",
            name: "i_budget_yearTxt",
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
        var comboUsedBgYear = new Ext.form.ComboBox({
            mode: "local",
            fieldLabel: "ใช้เงินปีงบประมาณ",
            submitValue: true,
            hiddenName: "i_budget_year_overlap",
            name: "i_budget_year_overlapTxt",
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
//        var comboExpenseGroup = new Ext.form.ComboBox({
//            mode: "local",
//            store: Ext.bg_expense_group,
//            valueField: "id",
//            displayField: "c_name",
//            submitValue: true,
//            hiddenName: "bg_expense_group_id",
//            name: "bg_expense_group_idTxt",
//            triggerAction: "all",
//            forceSelection: true,
//            selectOnFocus: true,
//            fieldLabel: "ประเภทรายจ่าย",
//            width: 200,
//            typeAhead: false,
//            emptyText: "กรุณาเลือกประเภทรายจ่าย...",
//            listeners: {
//                afterrender: function () {
//                    this.fn = function () {};
//                },
//                Change: function () {
//                    this.fn();
//                },
//                beforequery: function (q) {
//                    if (q.query) {
//                        var length = q.query.length;
//                        q.query = new RegExp(Ext.escapeRe(q.query));
//                        q.query.length = length;
//                    }
//                },
//                blur: function () {
//                    this.getStore().clearFilter();
//                },
//            },
//        });
        var comboExpense = new Ext.form.ComboBox({
            mode: "local",
            store: Ext.bg_expense,
            valueField: "id",
            displayField: "c_name",
            anchor: "80%",
            submitValue: true,
            name: "c_detail",
            hiddenName: "bg_expense_id",
            id: "bg_expense_id",
            triggerAction: "all",
            allBlank: true,
            forceSelection: true,
            selectOnFocus: true,
            fieldLabel: "รายการย่อย",
            width: 200,
            typeAhead: false,
            emptyText: "กรุณาเลือกใช้จ่าย...",
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

        var comboCreditor = new Ext.form.ComboBox({
            mode: "local",
            store: Ext.po_creditor,
            valueField: "id",
            displayField: "c_name",
            anchor: "80%",
            submitValue: true,
            name: "po_creditor_name",
            hiddenName: "po_creditor_id",
            id: "po_creditor_idID",
            triggerAction: "all",
            forceSelection: false,
            allBlank: true,
            selectOnFocus: true,
            fieldLabel: "จ่ายให้",
            width: 200,
            typeAhead: false,
            emptyText: "กรุณาเลือกคีย์เพิ่มหรือว่างไว้",
            listeners: {
                afterrender: function () {
                    this.fn = function () {};
                },
                Change: function () {
                    var f_id = Ext.isEmpty(Ext.getCmp("po_creditor_transfer_id").getValue());
                    if (f_id)
                        Ext.getCmp("po_creditor_transfer_id").setValue(this.getValue());
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
        var comboCreditortransfer = new Ext.form.ComboBox({
            mode: "local",
            store: Ext.po_creditor_transfer,
            valueField: "id",
            displayField: "c_name",
            anchor: "80%",
            submitValue: true,
            name: "po_creditor_transfer_name",
            hiddenName: "po_creditor_transfer_id",
            id: "po_creditor_transfer_id",
            triggerAction: "all",
            forceSelection: false,
            allBlank: true,
            selectOnFocus: true,
            fieldLabel: "โดยมอบให้",
            width: 200,
            typeAhead: false,
            emptyText: "กรุณาเลือกคีย์เพิ่มหรือว่างไว้",
            listeners: {
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

        var columnMini = [
            {
                header: "ID System",
                sortable: true,
                hidden: true,
                dataIndex: "id",
            },
            {
                header: "เลขที่ใบเบิก",
                sortable: true,
                dataIndex: "c_code",
            },
            {
                header: "จ่ายให้",
                width: 250,
                sortable: true,
                dataIndex: "po_creditor_name",
            },
            {
                header: "รายการ",
                sortable: true,
                id: "c_name",
                dataIndex: "c_name",
                renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                    metaData.attr = "style='cursor:pointer';";
                    return value;
                },
            },
        ];
        var PopContForm = new Ext.Poplov_in({
            text: "เลือกเลขที่ใบเบิกที่ยกเลิก",
            id: "i_parentID",
            iconCls: "page_magnify",
            valueHidden: "i_parent_id",
            store: Ext.storeCont,
            headerGrid: columnMini,
            widthText: 330,
            fieldLabel: "เลือกเลขที่ใบเบิกที่ยกเลิก",
            isCellClickGrid: true,
            cellClickGrid: function (grid, rowIndex, columnIndex, e) {
                var id = "i_parentID";
                var nameID = id + "_Name";
                var record = grid.getStore().getAt(rowIndex);

                var TextShow = record.data.c_code + " " + record.data.c_name;
                Ext.getCmp(id).setValue(record.data.po_working_hdr_id);

                if (Ext.HDR_ID == null) {
                    record.set("id", null);
                    record.set("po_working_hdr_id", null);
                    record.set("po_working_dtl_id", null);
                    record.set("c_code", null);
                    record.set("c_status_last", null);
                    Ext.getCmp(Ext.poFormID).getForm().loadRecord(record);
                }
                Ext.getCmp(nameID).setValue(TextShow);
                Ext.getCmp("win-pop-lov" + id).hide();
                Ext.getCmp("win-pop-lov" + id).destroy();
            },
        });

        var statusx = statuss;
        //alert(statusx);
        return new Ext.Window({
            collapsible: true,
            maximizable: true,
            title: "ทำรายการขอเบิก",
            width: Ext.getCmp("contenterCenter").getWidth() - 20,
            height: Ext.getCmp("contenterCenter").getHeight() - 20,
            id: "winChequeID",

            layout: "fit",
            modal: true,
            plain: true,
            bodyStyle: "padding:1px;",
            buttonAlign: "center",
            items: new Ext.FormPanel({
                id: Ext.poFormID,
                url: "reg/controller/mnPoWorkingHdrBegin.php",
                fileUpload: true,
                frame: true,
                labelAlign: "left",
                bodyStyle: "padding:1px",
                layout: "column",
                items: [
                    {
                        columnWidth: 0.5,
                        xtype: "fieldset",
                        id: "win-cheque",
                        labelWidth: 150,
                        title: "ข้อมูลรายการ",
                        defaults: {
                            width: "80%",
                            border: false,
                        },
                        // Default config options for child items
                        defaultType: "textfield",
                        autoHeight: true,
//            bodyStyle: Ext.isIE ? "padding:0 0 1px 5px;" : "padding:0px 1px;",
                        border: false,
                        style: {
//              "margin-left": "3px",
                            // when you add custom margin in IE 6...
//              "margin-right": Ext.isIE6 ? (Ext.isStrict ? "-4px" : "-5px") : "0", // you have to adjust for it somewhere else
                        },
                        frame: true,
                        autoScroll: true,
                        loadMask: true,
                        items: [
                            {
                                xtype: "hidden",
                                name: "id",
                            },
                            {
                                xtype: "hidden",
                                name: "po_working_hdr_id",
                            },
                            {
                                xtype: "hidden",
                                name: "po_working_dtl_id",
                            },
                            {
                                xtype: "radiogroup",
                                /*ss*/
                                columns: [300],
                                id: "i_is_parentID",
                                fieldLabel: "สถานะรายการ",
                                items: [
                                    {
                                        name: "i_is_parent",
                                        id: "i_is_parent1ID",
                                        inputValue: 1,
                                        checked: true,
                                        boxLabel: "ทำรายการรอเลขเบิก MIS"
                                    }
                                ],
                                listeners: {
                                    change: function (cb, rec, ind) {
                                        this.fn(rec.inputValue);
                                    },
                                    afterrender: function (obj, eOpts) {
                                        this.fn = function (i) {
                                            if (i === 2) {
                                                Ext.getCmp("i_cont_dis_idID").show();
                                            } else {
                                                Ext.getCmp("i_cont_dis_idID").hide();
                                            }
                                        }; //fn
                                        this.fn(Ext.getCmp("i_is_parentID").getValue().inputValue);
                                    },
                                },
                            },
                            {
                                xtype: "compositefield",
                                id: "i_cont_dis_idID",
                                fieldLabel: "เลือกเลขที่ใบเบิกที่ยกเลิก",
                                msgTarget: "side",
                                anchor: "-20",
                                defaults: {
                                    flex: 1,
                                },
                                items: [PopContForm.mini],
                            },
                            {
                                xtype: "textfield",
                                fieldLabel: "เลขตรวจรัย/รับของ/invoice",
                                name: "c_doc_ref",
                                style: {
                                    "font-weight": "bold",
                                    padding: "1px",
                                    width: "50px",
                                    margin: "1px",
                                    color: "#000",
                                    "background-color": "#eee !important",
                                    "text-align": "center",
                                },
                            },
                            {
                                xtype: "textfield",
                                fieldLabel: "เลขที่ใบขอเบิก",
                                name: "c_code_ref",
                                style: {
                                    "font-weight": "bold",
                                    padding: "1px",
                                    width: "50px",
                                    margin: "1px",
                                    color: "#000",
                                    "background-color": "#eee !important",
                                    "text-align": "center",
                                },
                            },
                            comboBgYear,
                            comboUsedBgYear,
                            comboTypeBg,
                            /*  comboExpenseGroup,*/
                            comboExpense,
                            comboCost,
                            comboCreditor,
                            comboCreditortransfer,
                            // {
                            //   xtype: "textfield",
                            //   fieldLabel: "Name",
                            // },
                            {
                                xtype: "textfield",
                                anchor: "80%",
                                fieldLabel: "เลขที่ใบแจ้งหนี้",
                                name: "c_code_invoice",
                                // style: {
                                //   "font-weight": "bold",
                                //   padding: "1px",
                                //   margin: "1px",
                                //   color: "#000",
                                //   "background-color": "#eee !important",
                                //   "text-align": "center",
                                // },
                            },
//              {
//                xtype: "fileuploadfield",
//                id: "upload_pdf1",
//                width: "80%",
//                emptyText: "เลือกไฟล์ (.pdf)",
//                fieldLabel: "เอกสารใบเบิก (PDF)",
//                name: "upload_pdf1",
//                buttonText: "",
//                buttonCfg: {
//                  iconCls: "icon-pdf",
//                },
//                listeners: {
//                  afterrender: function () {
//                    if (Ext.selectRow == null) {
//                    } else {
//                      if (Ext.selectRow.data.pdf_hdr !== undefined) {
//                        // Ext.getCmp("upload_pdf1").hide();
//                      }
//                    }
//                  },
//                },
//              },
//              {
//                xtype: "fileuploadfield",
//                id: "upload_pdf2",
//                width: "80%",
//                emptyText: "เลือกไฟล์ (.pdf)",
//                fieldLabel: "เอกสารประกอบใบเบิก (PDF)",
//                name: "upload_pdf2",
//                buttonText: "",
//                buttonCfg: {
//                  iconCls: "icon-pdf",
//                },
//                listeners: {
//                  afterrender: function () {
//                    if (Ext.selectRow == null) {
//                      // Ext.getCmp("upload_pdf2").hide();
//                    } else {
//                      if (Ext.selectRow.data.pdf_hdr != undefined) {
//                        // Ext.getCmp("upload_pdf2").hide();
//                      }
//                    }
//                  },
//                },
//              },
//              {
//                xtype: "button",
//                id: "btn_pdf1",
//                width: 200,
//                iconCls: "icon-pdf",
//                fieldLabel: "เอกสารใบเบิก (PDF)",
//                text: "เอกสารใบเบิก",
//                handler: function () {
//                  if (Ext.i_is_url_pdf_hdr == 0) {
//                    window.open(Ext.part_file_pdf + Ext.pdf_hdr, "_blank");
//                  } else if (Ext.i_is_url_pdf_hdr == 1) {
//                    window.open(Ext.pdf_hdr);
//                  }
//                },
//                listeners: {
//                  afterrender: function () {
//                    if (Ext.selectRow == null) {
//                      Ext.getCmp("btn_pdf1").hide();
//                    } else {
//                      if (Ext.selectRow.data.pdf_hdr == null) {
//                        Ext.getCmp("btn_pdf1").hide();
//                      } else {
//                        Ext.getCmp("upload_pdf1").hide();
//                      }
//                    }
//                  },
//                },
//              },
//              {
//                xtype: "button",
//                id: "btn_pdf2",
//                width: 200,
//                iconCls: "icon-pdf",
//                fieldLabel: "เอกสารประกอบใบเบิก (PDF)",
//                text: "เอกสารประกอบใบเบิก",
//                handler: function () {
//                  if (Ext.i_is_url_pdf_dtl == 0) {
//                    window.open(Ext.part_file_pdf + Ext.pdf_dtl, "_blank");
//                  } else if (Ext.i_is_url_pdf_pdf == 1) {
//                    window.open(Ext.pdf_dtl);
//                  }
//                },
//                listeners: {
//                  afterrender: function () {
//                    if (Ext.selectRow == null) {
//                      Ext.getCmp("btn_pdf2").hide();
//                    } else {
//                      if (Ext.selectRow.data.pdf_hdr == null) {
//                        Ext.getCmp("btn_pdf2").hide();
//                      } else {
//                        Ext.getCmp("upload_pdf2").hide();
//                      }
//                    }
//                  },
//                },
//              },
//              {
//                xtype: "checkboxgroup",
//                fieldLabel: "",
//                name: "i_edit_pdf",
//                id: "i_edit_pdfID",
//                columns: 1,
//                items: [
//                  {
//                    name: "i_edit_pdfs1",
//                    id: "i_edit_pdfIDs1",
//                    boxLabel: "แก้ไขเอกสาร",
//                    inputValue: 1,
//                  },
//                ],
//                listeners: {
//                  afterrender: function () {
//                    if (Ext.selectRow == null) {
//                      Ext.getCmp("i_edit_pdfID").hide();
//                    } else {
//                      if (Ext.selectRow.data.pdf_hdr == undefined) {
//                        Ext.getCmp("i_edit_pdfID").hide();
//                      }
//                    }
//                  },
//                  change: function (combo, newValue) {
//                    if (Ext.getCmp("i_edit_pdfIDs1").getValue() == true) {
//                      Ext.getCmp("upload_pdf1").show();
//                      Ext.getCmp("upload_pdf2").show();
//                      Ext.getCmp("btn_pdf1").hide();
//                      Ext.getCmp("btn_pdf2").hide();
//                    } else {
//                      Ext.getCmp("upload_pdf1").hide();
//                      Ext.getCmp("upload_pdf2").hide();
//                      Ext.getCmp("btn_pdf1").show();
//                      Ext.getCmp("btn_pdf2").show();
//                    }
//                  },
//                }, 
//              },
                        ],
                    },
                    {
                        columnWidth: 0.5,
                        xtype: "fieldset",
                        id: "win-chequeID",
                        labelWidth: 150,
                        title: "รายละเอียดการขอเบิก",
                        defaults: {
                            width: "80%",
                            border: false,
                            validator: function (val) {
                                if (!Ext.isEmpty(val)) {
                                    return true;
                                } else {
                                    if (this.hiddenName === "po_emp_id")
                                        return true;
                                    else
                                        return "กรุณาระบุ ข้อมูลให้ถูกต้อง";
                                }
                            },
                        },
                        // Default config options for child items
                        defaultType: "textfield",
                        autoHeight: true,
//            bodyStyle: Ext.isIE ? "padding:3px 0 3px 10px;" : "padding:3px 3px;",
                        border: false,
//            style: {
//              "margin-left": "5px",
//              // when you add custom margin in IE 6...
//              "margin-right": Ext.isIE6 ? (Ext.isStrict ? "-4px" : "-5px") : "0", // you have to adjust for it somewhere else
//            },
                        items: [
                            {
                                xtype: "textfield",
                                fieldLabel: "จำนวนรายการ",
                                name: "c_qty",
                                id: "c_qtyID",
                                style: {
                                    //                                                 'labelAlign' : 'right' ,
                                    //                                              'font-weight' : 'bold' ,
                                    padding: "1px",
                                    margin: "1px",
                                    "background-color": "#fff",
                                    "text-align": "left",
                                    width: "100px",
                                },
                            },
                            {
                                xtype: "textfield",
                                fieldLabel: "จำนวนเงิน",
                                name: "f_total",
                                id: "f_totalID",
                                listeners: {
                                    blur: function () {
                                        var f_total = parseFloat(this.getValue().replace(/,/g, "") / 1);
                                        this.setValue(Ext.floatRenderer(f_total));
                                    },
                                },
                                style: {
                                    labelAlign: "right",
                                    "font-weight": "bold",
                                    padding: "1px",
                                    margin: "1px",
                                    color: "blue",
                                    "background-color": "#fff",
                                    "text-align": "right",
                                },
                            },
                            /*comboAudit,*/
                            {
//                xtype: "datefield",
//                fieldLabel: "วันที่ตรวจรับ",
//                name: "d_audit_date",
//                id: "d_audit_date",
//              },
////              comboEmp,
//              {
                                xtype: "datefield",
                                fieldLabel: "วันที่ใบขอเบิก",
                                name: "d_doc_date",
//              },
//              document_inspector,
//              {
//                xtype: "datefield",
//                fieldLabel: "วันที่ฝ่ายคลังรับใบขอเบิก",
//                name: "d_inv_date",
                            },
//              {
//                xtype: "buttongroup",
//                fieldLabel: "วันที่ส่งใบขอเบิก",
//                frame: false,
//                border: false,
//                items: [
//                  {
//                    xtype: "datefield",
//                    name: "d_approve_date",
//                    validator: function (val) {
//                      if (!Ext.isEmpty(val)) {
//                        return true;
//                      } else {
//                        return "กรุณาระบุ ข้อมูลให้ถูกต้อง";
//                      }
//                    },
//                  },
//                  {
//                    xtype: "tbspacer",
//                    width: 4,
//                  },
//                  {
//                    xtype: "label",
//                    style: { color: "red" },
//                    text: "* เริ่มต้นนับวัน",
//                  },
//                ],
//              },

                            {
                                xtype: "radiogroup",
                                columns: [80, 70],
                                id: "i_enableID",
                                fieldLabel: "สถานะรายการ",
                                items: [
                                    {
                                        name: "i_enable",
                                        id: "i_enable1ID",
                                        inputValue: 1,
                                        checked: true,
                                        boxLabel: "ใช้งาน",
                                    },
                                    {
                                        name: "i_enable",
                                        id: "i_enable2ID",
                                        inputValue: 2,
                                        //                                                  checked : true ,
                                        boxLabel: "ยกเลิก",
                                    },
                                ],
                            },
                            {
                                xtype: "textarea",
                                fieldLabel: "คำอธิบายรายการ",
                                name: "c_comment",
                                validator: function (val) {
                                    return true;
                                },
                                width: 200,
                            },
                            {
                                xtype: "radiogroup",
                                columns: [180],
                                fieldLabel: "โหมดการบันทึก",
                                id: "modesubID",
                                listeners: {
                                    afterrender: function () {
                                        //console.log(Ext.getCmp("modesubID").getValue().inputValue);
                                    },
                                },
                                style: {
                                    "font-weight": "bold",
                                },
                                items:
                                        statusx === "add"
                                        ? [
//                        {
//                          name: "mode",
//                          inputValue: "ADD",
//                          checked: true,
//                          boxLabel: "เพิ่มรายการใหม่",
//                          id: "modesubaddID",
//                        },
                                        ]
                                        : [
                                            {
                                                name: "mode",
                                                checked: true,
                                                inputValue: "UPDATE",
                                                boxLabel: "อัพเดทรายการ",
//                        } ,{
//                          name: "mode",
//                          inputValue: "ADD",
//                          boxLabel: "เพิ่มรายการใหม่",
//                          id: "modesubaddID",
                                            },
                                            {
                                                name: "mode",
                                                inputValue: "DELETE",
                                                id: "modesubdelID",
                                                boxLabel: "ลบรายการ",
                                            },
                                        ], //radiogroup
                            },
                        ],
                    },
                ],
                buttons: [
                    {
                        text: "ทำรายการ",
                        id: "buSaveSubID",
                        iconCls: "icon-save",
                        listeners: {
                            afterrender: function () {},
                        },
                        handler: function () {
                            var msg = "";
//              let file1 = Ext.get("upload_pdf1-file").dom.files[0];
//              let parts1 = null;
//              try {
//                parts1 = file1.name.split(".");
//              } catch (err) {}
//
//              let file2 = Ext.get("upload_pdf2-file").dom.files[0];
//              let parts2 = null;
//              try {
//                parts2 = file2.name.split(".");
//              } catch (err) {}
//
//              // if (file1 == "" || file1 == undefined || file2 == "" || file2 == undefined) {
//              //   msg += "<span style='white-space: nowrap;'>กรุณาเลือกไฟล์ที่ต้องการ</span><br>";
//              // } else if (parts1[parts1.length - 1] != "pdf" || parts2[parts2.length - 1] != "pdf") {
//              //   msg += "<span style='white-space: nowrap;'>กรุณาเลือกไฟล์ (.pdf)</span><br>";
//              // }
//
//              if (file1 != undefined && file2 != undefined) {
//                if (parts1[parts1.length - 1] != "pdf" || parts2[parts2.length - 1] != "pdf") {
//                  if (parts1[parts1.length - 1] != "PDF" || parts2[parts2.length - 1] != "PDF"){
//                    msg += "<span style='white-space: nowrap;'>กรุณาเลือกไฟล์ (.pdf)</span><br>";
//                  }
//                }
//              } else {
//                if ((file1 == undefined && file2 != undefined) || (file1 != undefined && file2 == undefined)) {
//                  msg += "<span style='white-space: nowrap;'>กรุณาเลือกไฟล์ให้ครบ</span><br>";
//                }
//              }

                            if (msg != "") {
                                Ext.MessageBox.alert("แจ้งเตือน", msg);
                                return;
                            }

                            var formSubmit = function () {
                                if (Ext.getCmp("bg_expense_id").getValue() == "") {
                                    msg = "<span style='white-space: nowrap;'>กรุณาเลือก รายการย่อย</span>";
                                    Ext.Msg.alert("แจ้งเตือน", msg);
                                    return false;
                                }
                                form.submit({
                                    waitMsg: "Saving Data...",
                                    success: function (form, action) {
                                        if (action.result.success == "Success" || action.result.success == true) {
                                            Ext.Msg.alert("Success", action.result.msg, function (form, action) {
                                                Ext.getCmp("tabpanel1").getStore().reload();
                                                Ext.selectRow = null;
                                                Ext.getCmp("winChequeID").hide();
                                                Ext.getCmp("winChequeID").destroy();
                                            });
                                        } else {
                                            Ext.MessageBox.alert("แจ้งเตือน", "<span style='white-space: nowrap;'>" + action.result.msg + "</span>");
                                        }
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
                            };
                            var form = Ext.getCmp(Ext.poFormID).getForm();
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
                            } //isValid
                        }, //haddler
                    },
                    {
                        text: Ext.GLOBAL_BU_BACK_TH,
                        handler: function () {
                            Ext.getCmp("winChequeID").hide();
                            Ext.getCmp("winChequeID").destroy();
                        },
                    },
                ],
            }),
            listeners: {
                afterrender: function () {},
            },
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
            menu: menu, // assign menu by instance
        });
        //    รายการเมนู
        tb.add({
            text: " รายการเมนู ",
            icon: "../images/icons/text_list_bullets.png",
            iconCls: "bmenu",
            // <-- icon
            border: false,
            bodyStyle: "padding:0px 0px 0px 0px !important;",
            menu: menu, // assign menu by instance
        });
        menu.addSeparator();
        //  เพิ่มข้อมูล
//    menu .add({
//        text: "เพิ่มข้อมูล",
//        icon: "../images/icons/add.png",
//      })
//      .on(
//        "click",
//        (click = function () {
//          Ext.loadStore("add", false); // app,data.load
//        })
//      );
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
    var onLocationCheck = function (item) {
        var i = item.uri;
        Ext.History.add(i);
        var storeBg = Ext.storeDtl;
        storeBg.setBaseParam("keyData", i);
        storeBg.load();
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
                        {
                            xtype: "compositefield",
                            fieldLabel: "คำที่ค้นหา",
                            msgTarget: "side",
                            anchor: "-5",
                            defaults: {
                                flex: 1,
                            },
                            items: [
                                {
                                    xtype: "textfield",
                                    id: "val-ID",
                                    name: "value",
                                    width: 130,
                                },
                                {
                                    xtype: "combo",
                                    id: "filter-ID",
                                    store: new Ext.data.SimpleStore({
                                        fields: ["id", "c_name"],
                                        data: [
                                            ["c_code_ref", "เลขที่ขอเบิก"],
                                            ["c_name", "รายการที่ขอเบิก"],
                                            ["po_creditor_name", "จ่ายให้"],
                                        ],
                                    }),
                                    value: "c_code_ref",
                                    valueField: "id",
                                    width: 180,
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
                                },
                            ],
                        },
                                /*  {
                                 xtype: "combo",
                                 id: "userid-ID",
                                 fieldLabel: "ผู้ทำรายการ", //Ext.po_user
                                 store: Ext.po_user,
                                 valueField: "id",
                                 width: 180,
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
                                 afterrender: function () {
                                 this.store.reload({
                                 callback: function (record, operation, success) {
                                 if (success) {
                                 Ext.getCmp("userid-ID").setValue(0);
                                 }
                                 },
                                 });
                                 },
                                 },
                                 },*/
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
                                            if (action.result.success == "Success" || action.result.success == true) {
                                                Ext.Msg.alert("Success", action.result.msg, function (form, action) {
                                                    Ext.getCmp("tabpanel1").getStore().reload();
                                                    Ext.getCmp("winChequeID").hide();
                                                    Ext.getCmp("winChequeID").destroy();
                                                });
                                            } else {
                                                Ext.MessageBox.alert("แจ้งเตือน", "<span style='white-space: nowrap;'>" + action.result.msg + "</span>");
                                            }
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
                            }, //haddler
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
            (gridMain = function () //dc_cost_idTxt dc_expense_budget_type_idTxt bg_expense_group_idTxt
            {
                var colmnn = [
                    new Ext.grid.RowNumberer({
                        header: "ที่",
                        dataIndex: "id",
                        id: "idID",
                        width: 30,
                        renderer: function (value, metaData, record, row, col, store, gridView) {
                            metaData.attr = "style='cursor:pointer; text-align:center;';";
                            return record.get("no");
                        },

                    }),
                    {
                        header: "ของที่ได้มา",
                        sortable: false,
                        align: "center",
                        dataIndex: "id", 
                         width: 120,
                        renderer: function (value, metaData, record, row, col, store, gridView) {
                            metaData.attr = "style='font-text:bold; cursor:pointer; text-align:center;';";
                            if (record.get('id')) {
                                var inv = "ครุภัณฑ์";
                               
                            } else {
                                 var inv = "วัสดุ";
                            }
                            return inv;
                        },
                    },
                    {
                        header: "การนำเข้าเลขครุภัณฑ์",
                        sortable: false,
                        align: "center",
                        dataIndex: "id", 
                         width: 120,
                        renderer: function (value, metaData, record, row, col, store, gridView) {
                            metaData.attr = "style='font-text:bold; cursor:pointer; text-align:center;';";
                            if (record.get('id')) {
                                var inv = "<button"
                                        +" style='font-size:12px;font-text:bold; cursor:pointer; text-align:center;'>"
                                        +" รายละเอียด"
                                        +" </button>";
                            } else {
                                 var inv = "วัสดุ";
                            }
                            return inv;
                        }, 
                    },
                    {
                        header: "เลขที่ใบขอเบิก",
                        sortable: false,
                        align: "left",
                        dataIndex: "id",
                        hidden: true,
                    },
                    {
                        header: "เลขที่ใบขอเบิก",
                        sortable: false,
                        align: "left",
                        dataIndex: "id",
                        hidden: true,
                    },
                    {
                        header: "เลขที่ใบขอเบิก",
                        sortable: false,
                        align: "left",
                        dataIndex: "c_code_ref",
                        editor: new Ext.form.TextField({}),
                        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                            //                          metaData.attr = "style='color:red;'" ;
                            return value ? value : "-";
                        },
                    },
                    {
                        header: "เอกสารใบเบิก",
                        sortable: false,
                        width: 105,
                        align: "center",
                        dataIndex: "pdf_hdr",
                        editor: new Ext.form.TextField({}),
                        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                            var BtnText = "<img src='../images/icons/page_white_acrobat.png' style='margin-right:1px;' /><div><spen style='font-size:11px'>&nbspเอกสารใบเบิก</spen>";
                            if (record.data.i_is_url_pdf_hdr == null) {
                                return "-";
                            } else if (record.data.i_is_url_pdf_hdr == 0) {
                                return '<button style="display: flex" onclick="window.open(\'' + Ext.part_file_pdf + value + '\')" type="button">' + BtnText + "</button>";
                            } else if (record.data.i_is_url_pdf_hdr == 1) {
                                return '<button style="display: flex" onclick="window.open(\'' + value + '\')" type="button">' + BtnText + "</button>";
                            }
                        },
                    },
                    {
                        header: "เอกสารประกอบใบเบิก",
                        sortable: false,
                        width: 140,
                        align: "center",
                        dataIndex: "pdf_dtl",
                        editor: new Ext.form.TextField({}),
                        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                            var BtnText = "<img src='../images/icons/page_white_acrobat.png' style='margin-right:1px;' /><div><spen style='font-size:11px'>&nbspเอกสารประกอบใบเบิก</spen>";
                            if (record.data.i_is_url_pdf_dtl == null) {
                                return "-";
                            } else if (record.data.i_is_url_pdf_dtl == 0) {
                                return '<button style="display: flex" onclick="window.open(\'' + Ext.part_file_pdf + value + '\')" type="button">' + BtnText + "</button>";
                            } else if (record.data.i_is_url_pdf_dtl == 1) {
                                return '<button style="display: flex" onclick="window.open(\'' + value + '\')" type="button">' + BtnText + "</button>";
                            }
                        },
                    },
                    {
                        header: "วันที่ ฝ่ายคลัง รับใบขอเบิก",
                        sortable: false,
                        align: "center",
                        width: 150,
                        dataIndex: "d_inv_date",
                        editor: new Ext.form.DateField({}),
                        renderer: function (val, metaData, record, rowIndex, colIndex, store) {
                            // var vals = val; // val.add(Date.YEAR, 543);
                            // return vals !== null && vals !== "" ? vals.dateFormat("d-m-Y") : "";
                            return shortThaiDate(val);
                        },
                    },
                    {
                        header: "ปีงบประมาณ",
                        sortable: false,
                        align: "center",
                        dataIndex: "i_budget_year",
                        width: 90,
                        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                            if (value !== "" && value !== undefined) {
                                return parseInt(value) + 543;
                            } else {
                                metaData.attr = "style='color:red;'";
                                return "-";
                            }
                        },
                    },
                    {
                        header: "สถานะปัจจุบัน",
                        sortable: true,
                        align: "left",
                        dataIndex: "c_status_last",
                    },
                    {
                        header: "รายการย่อย",
                        sortable: false,
                        align: "left",
                        dataIndex: "bg_expense_idTxt",
                    },
                    {
                        header: "หน่วยงาน",
                        sortable: false,
                        align: "center",
                        dataIndex: "dc_cost_idTxt",
                        width: 250,
                        /*   editor : new Ext.form.ComboBox (
                         {
                         mode : "local" ,
                         store : Ext.dc_cost ,
                         valueField : "id" ,
                         displayField : "c_name" ,
                         triggerAction : "all" ,
                         forceSelection : true ,
                         selectOnFocus : true ,
                         typeAhead : false ,
                         emptyText : "กรุณาเลือก..." ,
                         listeners : {
                         afterrender : function ()
                         {
                         this.fn = function ()
                         {
                         
                         } ;
                         
                         } ,
                         Change : function ()
                         {
                         this.fn () ;
                         } ,
                         beforequery : function ( q )
                         {
                         if ( q.query )
                         {
                         var length = q.query.length ;
                         q.query = new RegExp ( Ext.escapeRe ( q.query ) ) ;
                         q.query.length = length ;
                         }
                         } ,
                         blur : function ()
                         {
                         this.getStore ().clearFilter () ;
                         }
                         }
                         } ) ,*/
                        //                  renderer : function ( value , metaData , record , rowIndex , colIndex , store )
                        //                  {
                        //                      if ( value !== "" && value !== undefined )
                        //                      {
                        //                          metaData.attr = "style='text-align: left;'" ;
                        //                          return getStoreItems ( Ext.dc_cost , value , "c_code" ) + " : " + getStoreItems ( Ext.dc_cost , value , "c_name" ) ;
                        //                      }
                        //                      else
                        //                      {
                        //                          metaData.attr = "style='color:red; text-align: left;'" ;
                        //                          return "-" ;
                        //                      }
                        //                  }
                    },
                    {
                        header: "แหล่งเงิน",
                        sortable: false,
                        dataIndex: "dc_expense_budget_type_idTxt",
                        width: 250,
                        /* editor : new Ext.form.ComboBox (
                         {
                         mode : "local" ,
                         store : Ext.dc_expense_budget_type ,
                         valueField : "id" ,
                         displayField : "c_name" ,
                         triggerAction : "all" ,
                         forceSelection : true ,
                         selectOnFocus : true ,
                         typeAhead : false ,
                         emptyText : "กรุณาเลือก..." ,
                         listeners : {
                         afterrender : function ()
                         {
                         this.fn = function ()
                         {} ;
                         } ,
                         Change : function ()
                         {
                         this.fn () ;
                         } ,
                         beforequery : function ( q )
                         {
                         if ( q.query )
                         {
                         var length = q.query.length ;
                         q.query = new RegExp ( Ext.escapeRe ( q.query ) ) ;
                         q.query.length = length ;
                         }
                         } ,
                         blur : function ()
                         {
                         this.getStore ().clearFilter () ;
                         }
                         }
                         } ) ,*/
                        //                  renderer : function ( value , metaData , record , rowIndex , colIndex , store )
                        //                  {
                        //                      if ( value !== "" && value !== undefined )
                        //                      {
                        //                          metaData.attr = "style='text-align: left;'" ;
                        //                          return getStoreItems ( Ext.dc_expense_budget_type , value , "c_name" ) ;
                        //                      }
                        //                      else
                        //                      {
                        //                          metaData.attr = "style='color:red; text-align: left;'" ;
                        //                          return "-" ;
                        //                      }
                        //                  }
                    },
                    {
                        header: "วันที่ตรวจรับ",
                        sortable: false,
                        align: "center",
                        dataIndex: "d_audit_date",
                        editor: new Ext.form.DateField({}),
                        renderer: function (val, metaData, record, rowIndex, colIndex, store) {
                            // var vals = val; // val.add(Date.YEAR, 543);

                            // return vals !== null && vals !== "" ? vals.dateFormat("d-m-Y") : "";
                            return shortThaiDate(val);
                        },
                    },
                    {
                        header: "วันที่ใบขอเบิก",
                        sortable: false,
                        align: "center",
                        dataIndex: "d_doc_date",
                        editor: new Ext.form.DateField({}),
                        renderer: function (val, metaData, record, rowIndex, colIndex, store) {
                            // var vals = val; // val.add(Date.YEAR, 543);
                            // return vals !== null && vals !== "" ? vals.dateFormat("d-m-Y") : "";
                            return shortThaiDate(val);
                        },
                    },
                    {
                        header: "จ่ายให้",
                        sortable: false,
                        align: "center",
                        width: 300,
                        dataIndex: "po_creditor_name", //
                        //                      dataIndex : "dc_creditor_id" ,
                        //                      editor : new Ext.form.ComboBox (
                        //                          {
                        //                              mode : "local" ,
                        //                              store : Ext.dc_cnt ,
                        //                              valueField : "id" ,
                        //                              displayField : "c_name" ,
                        //                              triggerAction : "all" ,
                        //                              forceSelection : true ,
                        //                              selectOnFocus : true ,
                        //                              typeAhead : false ,
                        //                              emptyText : "กรุณาเลือก..." ,
                        //                              listeners : {
                        //                                  afterrender : function ()
                        //                                  {
                        //                                      this.fn = function ()
                        //                                      {} ;
                        //                                  } ,
                        //                                  Change : function ()
                        //                                  {
                        //                                      this.fn () ;
                        //                                  } ,
                        //                                  beforequery : function ( q )
                        //                                  {
                        //                                      if ( q.query )
                        //                                      {
                        //                                          var length = q.query.length ;
                        //                                          q.query = new RegExp ( Ext.escapeRe ( q.query ) ) ;
                        //                                          q.query.length = length ;
                        //                                      }
                        //                                  } ,
                        //                                  blur : function ()
                        //                                  {
                        //                                      this.getStore ().clearFilter () ;
                        //                                  }
                        //                              }
                        //                          } ) ,
                        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                            if (value !== "" && value !== undefined) {
                                metaData.attr = "style='text-align: left;'";
                                //                              var vals = getStoreItems ( Ext.dc_cnt , value , "c_name" ) ;
                                return value;
                            } else {
                                metaData.attr = "style='color:red; text-align: left;'";
                                return "-";
                            }
                        },
                    },
                    {
                        header: "จำนวนรายการ",
                        sortable: false,
                        align: "left",
                        dataIndex: "c_qty",
                        editor: new Ext.form.TextField({}),
                    },
                    {
                        header: "จำนวนเงิน",
                        sortable: false,
                        align: "center",
                        dataIndex: "f_total",
                        width: 110,
                        renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                            metaData.attr = "style='color:blue;text-align: right;'";
                            return floatRenderer(floatMinus(value, 2));
                        },
                    },
                    {
                        header: "ผู้อนุมัติ",
                        dataIndex: "c_approve_name",
                        width: 110,
                    },
                    {
                        width: 20,
                        dataIndex: "",
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
                        deferEmptyText: true,
                    },
                    listeners: {
                        viewready: function (g) {
                            //   g.getSelectionModel().selectRow(0);
                        }, // Allow rows to be rendered.
                        beforeedit: function (g) {
                            // if (g.rowIdx == 0) return false;
                        }, // Allow rows to be rendered. console.log(value.format('d-m-Y'));
                        afteredit: function (g) {
                            // console.log(g.record.get('d_inv_date').format('d-m-Y'));
                        },
                        beforerender: function () {
                            this.contextMenu = new Ext.menu.Menu({
                                items: [
                                    {
//                  text: "เพิ่มข้อมูล",
//                  icon: "../images/icons/add.png",
//                  handler: function (e) {
//                    Ext.loadStore("add", true); // app,data.load
//                  },
//                  scope: this,
//                },
//                {
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
                        afterrender: function () {
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
                    sm: new Ext.grid.RowSelectionModel({
                        singleSelect: true,
                        listeners: {
                            rowselect: function (sm, row, rec) {
                                Ext.selectRow = rec; //handle row in grid
                                console.log(rec);
                                console.log(row);
                            }
                        }
                    }),
                    tbar: [new searchGrid()],
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
};
