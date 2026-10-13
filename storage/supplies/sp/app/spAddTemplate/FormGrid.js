Ext.btn_set_color = function (ele, color_name) {
    var fullUrl = window.location.href;
    var path = window.location.pathname;
    var secondSlashIndex = path.indexOf("/", 1 + path.indexOf("/"));
    var baseUrl = fullUrl.substring(0, fullUrl.indexOf(path) + secondSlashIndex + 1);
    var imagePath = baseUrl + "dc/images/default/button/btn_color/btn-" + color_name + ".gif";

    var containerElement = document.getElementById(ele.el.id);
    var targetElement = containerElement.querySelector(".x-btn-ml");
    targetElement.style.backgroundImage = "url(" + imagePath + ")";
    targetElement.style.backgroundPosition = "-6px -24px";

    var targetElement = containerElement.querySelector(".x-btn-mc");
    targetElement.style.backgroundImage = "url(" + imagePath + ")";
    targetElement.style.backgroundPosition = "0 -2168px";

    var targetElement = containerElement.querySelector(".x-btn-mr");
    targetElement.style.backgroundImage = "url(" + imagePath + ")";
    targetElement.style.backgroundPosition = "-9px -24px";

    var targetElement = containerElement.querySelector(".x-btn-tl");
    targetElement.style.backgroundImage = "url(" + imagePath + ")";
    targetElement.style.backgroundPosition = "-6px 0";

    var targetElement = containerElement.querySelector(".x-btn-tc");
    targetElement.style.backgroundImage = "url(" + imagePath + ")";
    targetElement.style.backgroundPosition = "0 -9px";

    var targetElement = containerElement.querySelector(".x-btn-tr");
    targetElement.style.backgroundImage = "url(" + imagePath + ")";
    targetElement.style.backgroundPosition = "-9px 0";

    var targetElement = containerElement.querySelector(".x-btn-bl");
    targetElement.style.backgroundImage = "url(" + imagePath + ")";
    targetElement.style.backgroundPosition = "-6px -3px";

    var targetElement = containerElement.querySelector(".x-btn-bc");
    targetElement.style.backgroundImage = "url(" + imagePath + ")";
    targetElement.style.backgroundPosition = "0 -18px";

    var targetElement = containerElement.querySelector(".x-btn-br");
    targetElement.style.backgroundImage = "url(" + imagePath + ")";
    targetElement.style.backgroundPosition = "-9px -3px";
};
const winDisable_admin = function (BOOLE, record_data) {
    let msg = "";

    if (msg == "") {
        var win = new Ext.Window({
            id: "MessageBox_re",
            title: "ยืนยันยกเลิกรายการ ",
            modal: true,
            maximizable: false,
            resizable: false,
            width: 310,
            items: [
                {
                    xtype: "form",
                    frame: true,
                    labelAlign: "right",
                    labelWidth: 0.1,
//                    bodyStyle: {padding: "10px 20px"},
                    defaults: {anchor: "100%", msgTarget: "side"},
                    items: [
                        {
                            xtype: "displayfield",
                            id: "displaytext",
                            width: 200,
                            value: BOOLE
                                    ? `
                    <span style='color: red; white-space: nowrap; font-size: 15px;'>*รายการจะถูกยกเลิกการใช้งาน</span>
                    <br><span style='color: red; white-space: nowrap;'>ท่านต้องการยืนยัน <b><u>ยกเลิกการใช้งาน</u></b> ?</span>
                  `
                                    : `<span style='color: green; white-space: nowrap; font-size: 15px;'>*เปิดใช้งานรายการ</span>`,
                            style: "text-align: center;",
                        },
                        {
                            xtype: "textarea",
                            hidden: BOOLE ? false : true,
                            emptyText: "สาเหตุยกเลิกรายการ...",
                            id: "c_comment_restatus",
                            width: 300,
                        },
                    ],
                },
            ],
            buttonAlign: "left",
            buttons: [
                {
                    text: "ยืนยัน",
                    id: "btn_save-MessageBox_re",
                    icon: BOOLE ? "../../images/icons/delete.png" : "../../images/icons/yes.gif",
                    listeners: {
                        afterrender: function () {
                            btn_set_color(this, BOOLE ? "red" : "green"); //color : green, red, yellow, orange
                        },
                    },
                    handler: function () {
                        let msg = "";
                        if (msg == "") {
                            Ext.Msg.wait("Uploading...");

                            Ext.Ajax.request({
                                url: "api/mn_poSendStatusAll.php",
                                method: "POST",
                                params: {
                                    mode: BOOLE ? "DISABLE_admin" : "ENABLE_admin",
                                    id: record_data.data.id,
                                    begin_hdr_id: record_data.data.po_working_begin_hdr_id,
                                    i_status: Ext.I_STATUS,
                                    i_sub_status: Ext.I_SUB_STATUS,
                                    i_sub_status_before: Ext.I_SUB_STATUS_BEFORE,
                                    c_comment: Ext.getCmp("c_comment_restatus").getValue(),
                                    re_protest: record_data.data.i_sub_status == "3.00" ? 1 : 0,
                                },
                                success: function (result, request) {
                                    let jsonData = Ext.util.JSON.decode(result.responseText); //decode json
                                    if (jsonData.success == true) {
                                        Ext.store.load({params: {mode: ""}});
                                        Ext.Msg.alert("แจ้งเตือน", "<span style='white-space: nowrap;'>" + jsonData.msg + "</span>");
                                        Ext.getCmp("MessageBox_re").hide();
                                        Ext.getCmp("MessageBox_re").destroy();
                                        Ext.getCmp("contenterCenter").remove(Ext.getCmp("frm-Add"), true) || {};
                                        Ext.getCmp("contenterCenter").remove(Ext.getCmp("frm-Dtl"), true) || {};
                                    } else {
                                        Ext.MessageBox.alert("แจ้งเตือน", '<font color="red" style="white-space: nowrap;">' + jsonData.msg + "</font>");
                                    }
                                },
                                failure: function (result, request) {
                                    Ext.MessageBox.alert("Failed", result.responseText); // connect error
                                },
                            });
                        } else {
                            Ext.Msg.alert("แจ้งเตือนddd", msg);
                        }
                    },
                },
                {xtype: "tbfill"},
                {
                    text: "ย้อนกลับ",
                    handler: function () {
                        Ext.getCmp("MessageBox_re").hide();
                        Ext.getCmp("MessageBox_re").destroy();
                    },
                },
            ],
        }).show();
    } else {
        Ext.Msg.alert("แจ้งเตือน", msg);
    }
}; // reStatus

function copyToClipboard(str) {
    var el = document.createElement("textarea");
    el.value = str;
    el.setAttribute("readonly", "");
    el.style.position = "absolute";
    el.style.left = "-9999px";
    document.body.appendChild(el);
    var selected = document.getSelection().rangeCount > 0 ? document.getSelection().getRangeAt(0) : false;
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
    if (selected) {
        document.getSelection().removeAllRanges();
        document.getSelection().addRange(selected);
    }
    Ext.example.msg("Copied to Clipboard.&nbsp;", "- คัดลอกไปยังคลิปบอร์ดสำเร็จ", 1);
//    $(this).next("text copied");
//    setTimeout(function () {
//        $(this).next().remove();
//    }, 2000);
}

const Preview = function (id) {
    let url = "../po/preview/Pre_Working.php";
    let loader_display = '<div id="loader_display" style="display: flex; padding: 15px 15px; font-size:14px;"><div class="loader"></div><p>&nbsp;&nbsp;กำลังโหลดสถานะกรุณารอสักครู่...</p></div>';

    new Ext.Window({
        title: "แสดงสถานะใบขอเบิก",
        id: "Preview",
        modal: true,
        preventBodyReset: true,
        closable: true,
        autoScroll: true,
        maximized: true, // เต็มจอ auto
        html: loader_display + '<iframe name="printf" src="' + url + "?id=" + id + '" style="width:100%; height:100%; border-style:hidden;"></iframe>',
        buttonAlign: "left",
        buttons: [
            {
                text: "&nbsp;" + Ext.GLOBAL_BU_PRINT_TH + "&nbsp;",
                iconCls: "printer_mono",
                handler: function () {
                    document.printf.window.print();
                },
            },
            {
                text: Ext.GLOBAL_BU_BACK_TH,
                handler: function () {
                    Ext.getCmp("Preview").destroy();
                },
            },
        ],
        listeners: {
            afterrender: function () {
                $("iframe")
                        .load(function () {
                            document.getElementById("loader_display").remove();
                        })
                        .show();
            },
        },
    }).show();
};

const setNumberByName = function (form, arr_name) {
    var items = form.items.items;
    arr_name.forEach((name) => {
        var index = items.findIndex((item) => item.name === name);
        var item = items[index];
        item.setValue(floatRenderer(floatMinus(item.getValue().replace(/,/g, ""), 2)));
    });
};

function StoreLoadWithPromise(store, params) {
    return new Promise((resolve, reject) => {
        store.load({
            params: params,
            callback: (records, operation, success) => {
                success ? resolve(records) : reject(`Failed to load ${store}`);
            },
        });
    });
}

function Po_OpenPdf(c_filename, c_dir) {
    addTabPreviewPDFOutPut(c_filename, c_dir);
}

Ext.ux.PoplovPrDoc = Ext.extend(Ext.Button, {
    config: {
    }
    , initComponent: function () {
        this.mini = this.Minipop();
        this.isCellClickGrid = false;
        this.isSetFilter = false;
        this.setReset();

    },

    setReset: function (t) {
        if (t) {
            Ext.getCmp(this.id + '_Name').setValue();
            Ext.getCmp(this.id).setValue();
        }
    },
    afterrender: function () {},
    uiSearch: function (id) {
        var store = this.store;
        var id = id;

        var setDefaultFilter = [['c_code', "รหัส"], ['c_name', "ชื่อ"]];
        var setFilter = [['c_name', "ชื่อ"]];

        var filterGrid = new Ext.data.SimpleStore({
            fields: ["value", "text"],
            data: this.isSetFilter ? setFilter : setDefaultFilter,
        });
        var store = this.store;

        var filterGrid = Ext.isEmpty(this.filterGrid) ? filterGrid : this.filterGrid; //comb&store filter
        var defFilter = this.defFilter; //default filter

        return [{
                id: "filter" + id,
                xtype: 'combo',
                width: 130,
                mode: 'local',
                store: filterGrid,
                valueField: "value",
                displayField: "text",
                allowBlank: false,
                editable: false,
                triggerAction: "all",
                typeAhead: false,
                value: Ext.isEmpty(defFilter) ? 'c_name' : defFilter,
            }, '-', {
                id: "value-box" + id,
                xtype: "textfield",
                width: 130,
                fieldLabel: "fieldLabel",
                emptyText: 'คำที่ต้องการค้นหา',
                listeners: {
                    specialkey: function (f, e) {
                        if (e.getKey() == e.ENTER) {
                            store.setBaseParam("mode", "SEARCH");
                            store.setBaseParam("filter", Ext.getCmp("filter" + id).getValue());
                            store.setBaseParam("value", Ext.getCmp("value-box" + id).getValue());
                            Ext.getCmp('win-pop-lov-modal-' + id).getStore().load();
                        }
                    }
                },
            }];
    }

    , Minipop: function () {
        /******/
        var store = this.store;
        var headerGrid = this.headerGrid;
        var id = this.id;
        var nameID = this.id + '_Name';
        var widthText = isNaN(this.widthText) ? 198 : this.widthText;
        var uiSearch = this.uiSearch(id);

        /*****/
        function SearchGrid(store, id) {

            if (Ext.getCmp("value-box" + id).getValue() != "")
            {
                Ext.storePrDoc.setBaseParam("mode", "SEARCH");
                Ext.storePrDoc.setBaseParam("filter", Ext.getCmp("filter" + id).getValue());
                Ext.storePrDoc.setBaseParam("value", Ext.getCmp("value-box" + id).getValue());
                Ext.getCmp('win-pop-lov-modal-' + id).getStore().load();
            } else {

                Ext.storePrDoc.setBaseParam("mode", "");
                Ext.getCmp('win-pop-lov-modal-' + id).getStore().load();
            }
        }
        ;

        var cellClick_lov = function (grid, rowIndex, columnIndex, e) {

            var record = grid.getStore().getAt(rowIndex);
            var TextShow = record.data.c_code + ' ' + record.data.c_name;

            Ext.getCmp(id).setValue(record.data.id);
            Ext.getCmp(nameID).setValue(TextShow);

            Ext.getCmp("win-pop-lov" + id).hide();
            Ext.getCmp("win-pop-lov" + id).destroy();

        };

        cellClick_lov = (this.isCellClickGrid) ? this.cellClickGrid : cellClick_lov;

        return {
            fieldLabel: this.fieldLabel,
            xtype: 'radiogroup',
            id: 'pop_' + this.id,
            columns: [0, widthText, 40],
            hidden: (this.hidden == true) ? true : false,
            listeners: {
                afterrender: this.afterrender,
            },
            items: [{
                    xtype: 'hidden',
                    name: this.valueHidden,
                    id: id,
                    value: this.value,
                }, {
                    xtype: 'textfield',
                    name: 'txt' + this.id,
                    emptyText: this.text,
                    id: nameID,
                    readOnly: true,

                }, {
                    xtype: 'button',
                    id: 'Bu' + this.id,
                    name: 'Bu' + this.id,
                    iconCls: this.iconCls,
                    handler: function () {
                        /*
                         *  var val = Ext.getCmp('approved_document_val').getValue();
                         if(val==null || val=="" || val==0){
                         Ext.example.msg("แสดงการแจ้งเตือน","กรุณาเลือกรายการเอกสารที่ดำเนินการ",2); 
                         return false;
                         }else{
                         console.log(Ext.getCmp('approved_document_val').fieldLabel); 
                         }*/
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
                                afterrender: function (obj, eOpts)
                                {
                                    this.fn = function (widht, height) { //percentage
                                        var width = Ext.getBody().getViewSize().width * widht;
                                        var height = Ext.getBody().getViewSize().height * height;
                                        this.setSize(width, height);
                                        this.setTitle(Ext.getCmp('document_type_idID').lastSelectionText);
                                    }
                                    this.fn(.80, .85);
                                },
                                "maximize": function (window, opts) { //when property minimizable
                                    window.setWidth(Ext.getBody().getViewSize().width * .99);
                                    window.expand('', false);
                                    window.center();
                                }
                            },
                            items: [{
                                    xtype: 'grid',
                                    id: 'win-pop-lov-modal-' + id,
                                    border: false,
                                    stripeRows: true,
                                    loadMask: true,
                                    store: store,
                                    tbar: [uiSearch
                                                , ' ', '-', {
                                                    text: "ค้นหา",
                                                    id: 'magnifier_' + id,
                                                    iconCls: 'icon-magnifier',
                                                    handler: function () {
                                                        SearchGrid(store, id);/*SearchEngin(store,id);*/
                                                    }
                                                }/* ,' ',{
                                                 text : "เคลียร์ค่า",
                                                 id:'clearValue_'+id,
                                                 iconCls: 'icon-clear',
                                                 handler : function() {
                                                 Ext.getCmp(id).setValue('');
                                                 Ext.getCmp(nameID).setValue('');
                                                 Ext.getCmp("win-pop-lov"+id).hide();
                                                 Ext.getCmp("win-pop-lov"+id).destroy();
                                                 
                                                 }
                                                 } */],
                                    columns: headerGrid,
                                    listeners: {
                                        afterrender: function (obj, eOpts)
                                        {
                                            this.fn = function (widht, height) { //percentage

                                                var width = Ext.getBody().getViewSize().width * widht;
                                                var height = Ext.getBody().getViewSize().height * height;
                                                this.setSize(width, height);
                                            }
                                            this.fn(.5, .4);
                                        },

                                    },
                                    autoExpandColumn: 'c_name',
                                    bbar: new Ext.PagingToolbar({
                                        pageSize: 20,
                                        store: store,
                                        displayInfo: true,
                                        displayMsg: 'Displaying topics {0} - {1} of {2}'
                                    })
                                }],

                        });

                        win.show();
                        Ext.getCmp('win-pop-lov-modal-' + id).on('cellclick', cellClick_lov, this);
                    },

                }],

        };
    }, //Mini

});

Ext.AppUx = function (app, menu)
{
    Ext.HDR_ID = null;
    Ext.selectRow = [];
    Ext.menuEditGrid = true;
    Ext.menuRightEditgrid = true;
    Ext.costID = 38; //หน่วยงานผู้รับผิดชอบ พัสดุ 
    Ext.dcCostFix = false; //38
    Ext.tor_type_id = 1; // default start เจาะจงน้อวกว่า 5 แสน
    Ext.i_is_more = 0;


    Ext.tor_type_idTxt = Ext.apply({
        "tor_type_id1": {0: "แบบมี หัวงาน/ฝ่ายพิจารณาผล(ไม่เกิน 5 แสนบาท)", 1: "แบบมีคณะกรรมการพิจารณาผล(เกิน 5 แสนแสนบาท)"}
    });
    Ext.status = Ext.apply({
        name: menu,
        process: function (menuCode, record) {

            Ext.Ajax.request({
                url: "tor/api/mnTorController.php",
                params: {
                    mode: "UPSTATUS",
                    menuCode: menuCode,
                    tor_status_id: record.get("tor_status_id"),
                    id: record.get("id")
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
                }
            });
        }
    });
    Ext.buAct = null;
    Ext.yearTh = function () {
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
        return years;
    };
    //
    Ext.butTxtEdit = " แก้ไข ";
    Ext.butTxtAdd = " ทำรายการ ";
    Ext.butTxtSign = " ลงนาม ";
    Ext.butTxtApprove = " อนุมัติ ";
    //
//AutoLoad 
    Ext.keyData = 1; //type data key in 
    Ext.poFormID = "grid-form-cheque";
    Ext.getDate = Ext.apply({
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
    Ext.groupSearHeight = 120;
    //interlizing 
//gridColumn   


    var expander = new Ext.ux.grid.RowExpander({

        /**
         * @cfg {Boolean} expandOnEnter
         * <tt>true</tt> to toggle selected row(s) between expanded/collapsed when the enter
         * key is pressed (defaults to <tt>true</tt>).
         */
        expandOnEnter: true,
        /**
         * @cfg {Boolean} expandOnDblClick
         * <tt>true</tt> to toggle a row between expanded/collapsed when double clicked
         * (defaults to <tt>true</tt>).
         */
        expandOnDblClick: true,
        header: '',
        width: 23,
        sortable: false,
        fixed: true,
        hideable: false,
        menuDisabled: true,
        dataIndex: '',
        id: 'expander',
        lazyRender: true,
        enableCaching: true,
        /* tpl: new Ext.Template(
         '<p style="font-weight:bold;"> รายละเอียด ',
         '<div style="padding-left:35px; border-top:1px solid #ece;">',
         '<p><b>สถานะการลงนาม</b> : {c_status}',
         '<p><b>เลขเอกสาร</b> : {c_code_detail}',
         '<p><b>ขั้นตอน</b> : {step_sign}',
         '<p><b>ชื่อรายการ </b>: {c_name}',  
         '<p><b>ตำแหน่ง </b>: {c_position_name}', 
         '<p><b>รายละเอียด</b>: {d_doc_ref}/{c_detail}',
         )*/
        tpl: new Ext.Template(
                '<div style="font-weight:bold;">รายละเอียด</div>',
                '<div style="padding-left:35px; border-top:1px solid #ece; margin-top:5px;">',
                '<table style="width:100%;">',
                '<tr>',
                '<td style="width:40%; vertical-align:top;">',
                '<p><b>สถานะการลงนาม:</b> {c_status}</p>',
                '<p><b>เลขเอกสาร:</b> {c_code_detail}</p>',
                '<p><b>ขั้นตอน:</b> {step_sign}</p>',
                '</td>',
                '<td style="width:60%; vertical-align:top;">',
                '<p><b>ชื่อรายการ:</b> {c_name}</p>',
                '<p><b>ตำแหน่ง:</b> {c_position_name}</p>',
                '<p><b>รายละเอียด:</b> {d_doc_ref}/{c_detail}</p>',
                '</td>',
                '</tr>',
                '</table>',
                '</div>'
                )


    });
    var sm = new Ext.grid.CheckboxSelectionModel({
        renderer: function (v, p, record) {
            return '<div class="x-grid3-row-checker">&#160;</div>';
        }
    });
    var styleBu = 'style="width:auto; min-width:85px; display: flex; height: 18px; padding: 0px 5px 0px 17px;"';
    if (Ext.form.HtmlEditor) {
        Ext.apply(Ext.form.HtmlEditor.prototype, {
            createLinkText: "กรุณาระบุ URL สำหรับลิ้งค์:",
            buttonTips: {
                bold: {
                    title: "ตัวหนา (Ctrl+B)",
                    text: "กำหนดข้อความที่เลือกให้เป็นตัวหนา.",
                    cls: "x-html-editor-tip"
                },
                italic: {
                    title: "ตัวเอียง (Ctrl+I)",
                    text: "กำหนดข้อความที่เลือกให้เป็นตัวเอียง.",
                    cls: "x-html-editor-tip"
                },
                underline: {
                    title: "ขีดเส้นใต้ (Ctrl+U)",
                    text: "กำหนดข้อความที่เลือกให้ขีดเส้นใต้.",
                    cls: "x-html-editor-tip"
                },
                increasefontsize: {
                    title: "เพิ่มขนาดตัวอักษร",
                    text: "เพิ่มขนาดตัวอักษร.",
                    cls: "x-html-editor-tip"
                },
                decreasefontsize: {
                    title: "ลดขนาดตัวอักษร",
                    text: "ลดขนาดตัวอักษร.",
                    cls: "x-html-editor-tip"
                },
                backcolor: {
                    title: "เน้นสีข้อความ",
                    text: "เปลี่ยนสีพื้นหลังของข้อความที่เลือกไว้.",
                    cls: "x-html-editor-tip"
                },
                forecolor: {
                    title: "สีข้อความ",
                    text: "เปลี่ยนสีข้อความที่เลือกไว้.",
                    cls: "x-html-editor-tip"
                },
                justifyleft: {
                    title: "ชิดซ้าย",
                    text: "จัดเรียงข้อความชิดซ้าย.",
                    cls: "x-html-editor-tip"
                },
                justifycenter: {
                    title: "กึ่งกลาง",
                    text: "จัดเรียงข้อความกึ่งกลาง.",
                    cls: "x-html-editor-tip"
                },
                justifyright: {
                    title: "ชิดขวา",
                    text: "จัดเรียงข้อความชิดขวา.",
                    cls: "x-html-editor-tip"
                },
                insertunorderedlist: {
                    title: "ลำดับ",
                    text: "เริ่มตัวแสดงลำดับ.",
                    cls: "x-html-editor-tip"
                },
                insertorderedlist: {
                    title: "หมายเลขลำดับ",
                    text: "เริ่มตัวเลขแสดงลำดับ.",
                    cls: "x-html-editor-tip"
                },
                createlink: {
                    title: "ลิ้งค์",
                    text: "กำหนดลิ้งค์ให้กับข้อความที่เลือกไว้.",
                    cls: "x-html-editor-tip"
                },
                sourceedit: {
                    title: "แก้ไขโค้ด",
                    text: "เป็นไปยังโหมดแก้ไขโค้ด.",
                    cls: "x-html-editor-tip"
                }
            }
        });
    }
// Ext.styleBt.style,
    Ext.buStyle = Ext.apply({

        style: {
            backgroundImage: 'url(../../images/icons/magnifier2.png)',
            display: 'flex',
            height: '18px',
            padding: '0px 15px 0px 15px',
            boxSizing: 'border-box',
            fontVariant: 'small-caps',
            backgroundColor: 'buttonface',
            margin: '1em',
            paddingBlock: '1px',
//        paddingInline: '6psx',
            borderWidth: '1px',
            with : '150px',
            borderStyle: 'outset',
            borderColor: 'buttonborder',
            fontFamily: 'Tahoma, sans-serif',
            fontSize: '10px',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: '5px center',
            paddingLeft: '15px'  // เผื่อที่ให้ข้อความไม่ทับกับไอคอน

        }   //display: flex; height: 18px; padding: 0px 15px 0px 15px;
    });

    Ext.gridColumn = Ext.apply({column: [
            expander,
            sm,
            {//  step_document  step_sign status_approve approve_by
                id: "editColID",
                header: "-",
                align: "center",
                fixed: true,
                menuDisabled: true,
                width: 110,
                dataIndex: "id",
                renderer: function (value, metaData, record, row, col, store, gridView) {

                    var val = (record.get('sp_approval_hdr_id') === 0) ? Ext.butTxtAdd : Ext.butTxtEdit;
                    var BtnText = "<img src='../../images/icons/vcard_edit.png' style='margin-right:1px;' /><div><spen style='font-size:11px'>" + val + "</spen>";
                    return '<button ' + styleBu + ' type="button">' + BtnText + "</button>";

                }
            }, {
                id: "delete",
                header: "-",
                fixed: true,
                menuDisabled: true,
                align: "center",
                width: 90,
                dataIndex: "id",
                renderer: function (value, metaData, record, row, col, store, gridView) {
                    if (record.get("i_use") == 1) {
                        return "<font color=green>มีการใช้งานในระบบ</font>";
                    } else {
                        var BtnText = "<img src='../../images/icons/control_remove_blue.png' style='margin-right:1px;' /><div><spen style='font-size:11px'>&nbspลบ&nbsp</spen>";
                        return '<button ' + styleBu + ' type="button">' + BtnText + "</button>";

                    }
                }
            },
            {
                header: "เอกสารที่ดำเนินการ",
                width: 239,
                align: "left",
                dataIndex: "c_name",
//                    fixed: true, 
//                    menuDisabled: true, 
                renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                    var txtBt = value;
                    metaData.attr = 'ext:qtip="' + value + '"';
//                        var BtnText = "<img src='../../images/icons/page_white_acrobat.png' style='margin-right:1px;' /><div><spen style='font-size:11px; color: green;'>&nbsp<b>" 
//                                + txtBt+ "</b>&nbsp</spen>"; 
//                        var btSet = '<button style="display: flex; height: 18px; padding: 0px;" type="button">' + BtnText + "</button>";;
                    return txtBt;
                }

            }, {
                header: "สถานะ",
                width: 100,
                align: "left",
                dataIndex: "c_status",
//                    fixed: true, 
//                    menuDisabled: true, 
//                    renderer: function (value, metaData, record, rowIndex, colIndex, store) { 
//                          metaData.attr = 'ext:qtip="' + value + '"'; 
//                        var txtBt = value;
//                        var BtnText = "<img src='../../images/icons/page_white_acrobat.png' style='margin-right:1px;' /><div><spen style='font-size:11px; color: green;'>&nbsp<b>" 
//                                + txtBt+ "</b>&nbsp</spen>"; 
//                        var btSet = '<button style="display: flex; height: 18px; padding: 0px;" type="button">' + BtnText + "</button>";;
//                        return btSet; 
//                    } 
            }, {
                header: "ขั้นตอนอนุมัติ",
                width: 199,
                align: "left",
                dataIndex: "step_sign",
                /* fixed: true, 
                 menuDisabled: true, 
                 renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                 var txtBt = value;
                 metaData.attr = 'ext:qtip="' + value + '"'; 
                 var BtnText = "<img src='../../images/icons/page_white_acrobat.png' style='margin-right:1px;' /><div><spen style='font-size:11px; color: green;'>&nbsp<b>" 
                 + txtBt+ "</b>&nbsp</spen>"; 
                 var btSet = '<button style="display: flex; height: 18px; padding: 0px;" type="button">' + BtnText + "</button>";;
                 return btSet; 
                 } */
            },
            {
                header: "เอกสารประกอบ",
                sortable: false, width: 109,
                fixed: true, menuDisabled: true,
                align: "center",
                dataIndex: "c_file_pdf_dtl",
                // editor: new Ext.form.TextField({}),
                renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                    var BtnText = "<img src='../../images/icons/page_white_acrobat.png' style='margin-right:1px;' /><div><spen style='font-size:11px'>&nbspเอกสารประกอบ&nbsp</spen>";
                    return '<button style="display: flex; height: 18px; padding: 0px;" onclick="Po_OpenPdf(\'' + record.get('c_filename') + "', '" + record.get('c_dir') + '\')" type="button">' + BtnText + "</button>";

                }

            },
            {

                id: "c_name",
                header: "รายการซื้อจ้าง    ",
                width: 180,
                align: "left",
                dataIndex: "c_detail",
                renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                    metaData.attr = "style='text-align: left;'";
                    return value;
                }
            }, {
                header: "id",
                sortable: false,
                align: "left",
                dataIndex: "id",
                hidden: true, // icon: "../../images/icons/application_view_tile.png"
            },
            {
                header: "เลขที่อ้างอิง",
                sortable: true,
                align: "left",
                dataIndex: "d_doc_ref",
                width: 150,
                renderer: function (value, metaData, record, row, col, store, gridView) {
                    return value;
                },
//                },
//                {
//                    header: "เลขที่ PR",
//                    sortable: true,
//                    dataIndex: "c_code",
//                    width: 130,
//                    renderer: function (value, metaData, record, rowIndex, colIndex, store) {
//
//                        if (false) {
//                            metaData.attr = "style='font-weight:bold;color:blue'; align='right'";
//                        } else {
//                            metaData.attr = "";
//                        }
//                        return value; //DategetShortDateMonthName(value);
//                    }
            }, {
                header: "ชื่อผู้ดำเนินการ",
                align: "left",
                hidden: false,
                dataIndex: "ap_sp_emp_name",

//                }, {
//                    header: "ชื่อพนักงานเบิก",
//                    align: "left",
//                    dataIndex: "withdraw_name",
//                    width: 180,
            },
            {
                header: "หน่วยงานเจ้าของเรื่อง",
                align: "left",
                hidden: true,
                dataIndex: "dc_cost_idTxt",
            },
            {
                header: "ชื่อผู้สร้างรายการ",
                sortable: false,
                align: "center",
                dataIndex: "dc_user_create_name",
                hidden: true,
            },
            {
                header: "หน่วยงานผู้สร้าง",
                sortable: false,
                align: "center",
                dataIndex: "dc_user_create_cost_name",
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
                hidden: true,
                align: "center",
                dataIndex: "dc_user_update_name",
            },
            {
                header: "หน่วยงานแก้ไขรายการ",
                sortable: false,
                hidden: true,
                align: "center",
                dataIndex: "dc_user_update_cost_name",
            },
            {
                header: "วันที่แก้ไขรายการ",
                sortable: false,
                hidden: true,
                align: "center",
                dataIndex: "d_update",
                renderer: function (val, metaData, record, rowIndex, colIndex, store) {
                    return shortThaiDate(val);
                },
            }
            , {header: "", menuDisabled: true, }
        ]});

    Ext.gridtbar = Ext.apply({tbar: [
            {
                xtype: "buttongroup",
                columns: 1,
                title: "ระบุเงื่อนไขในการค้นหาข้อมูล <a href='#' onclick='sp_manual(event)'>คู่มือ</a>",
                height: Ext.groupSearHeight,
                defaults: {scale: "small", style: "font-size:10px; float: left"},
                labelWidth: 180,
                layout: {
                    align: 'top',
                    pack: 'left',
                    type: 'vbox'
                },
                items: [
                    {
                        xtype: "buttongroup",
                        frame: false,
                        id: 'tbarBtId',
                        items: [
                            {xtype: "label", text: "ค้นหาโดย : "},
                            {xtype: "tbspacer", width: 4},
                            {
                                id: "filter",
                                xtype: "combo",
                                width: 300,
                                mode: "local",
                                store: new Ext.data.SimpleStore({
                                    fields: ["value", "text"],
                                    data: [
                                        //   ["sql", "SQL"],
                                        //   ["tor_id", "hdr_id"],
                                        //   ["sp_tor_contract_id", "sp_tor_contract_id"],
                                        ["c_code", "เลขที่ตรวจรับ"],
                                        ["c_arrive_code", "เลขที่รับของ"],
                                        ["d_code", "เลขที่ใบเบิก"],
                                        ["c_overlap", "เลขที่ใบกัน"],
                                        ["c_code_po", "เลขสัญญา"],
                                        // ["c_code", "เลขที่ PR"],
                                        ["dc_creditor_name", "ผู้ขายผุ้รับจ้าง"],
                                        ["dc_creditor_tax_numbe", "เลชประจำตัวผู้เสียภาษีผู้ขายผุ้รับจ้าง"],
                                    ],
                                }),
                                value: "c_code",
                                valueField: "value",
                                displayField: "text",
                                allowBlank: false,
                                editable: false,
                                triggerAction: "all",
                                typeAhead: false,
                            },
                            {xtype: "tbspacer", width: 4},
                            {
                                xtype: "textfield",
                                id: "value-box",
                                width: 196,
                                fieldLabel: "fieldLabel",
                                emptyText: "คำที่ต้องการค้นหา",
                            },
                        ],
                    },
                    {
                        xtype: "buttongroup",
                        frame: false,
                        items: [
                            {xtype: "label", text: "แหล่งเงิน : "},
                            {xtype: "tbspacer", width: 4},
                            new Ext.form.ComboBox({
                                id: "s_dc_expense_budget_type_id",
                                mode: "local",
                                store: Ext.dc_expense_budget_type_all,
                                valueField: "id",
                                displayField: "c_name",
                                triggerAction: "all",
                                forceSelection: true,
                                selectOnFocus: true,
                                typeAhead: false,
                                emptyText: "กรุณาเลือก...",
                                width: 400,
                                value: "0",
                                listeners: {
                                    afterrender: function () {
                                        this.fn = function () {};
                                    },
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
                                    },
                                },
                            }),
                        ],
                    }, {
                        xtype: "buttongroup",
                        frame: false,
                        items: [{xtype: "label", text: "สถานะ : "},
                            {xtype: "tbspacer", width: 4},
                            {
                                id: "s_i_statusID",
                                xtype: "combo",
                                anchor: "40%",
                                mode: "local",
                                store: new Ext.data.SimpleStore({
                                    fields: ["value", "text"],
                                    data: [
                                        ["0", "ทั้งหมด"],
                                        ["1", "1 - รอตรวจรับ"],
                                        ["2", "2 - รอวางบิล"],
                                        ["3", "3 - ออกเลขวางบิล"],
                                        ["4", "4 - ผ่านวางบิลแล้ว(รอเบิก)"],
                                        ["5", "5 - เบิกแล้ว"],
                                    ],
                                }),
                                value: "0",
                                valueField: "value",
                                displayField: "text",
                                allowBlank: false,
                                editable: false,
                                triggerAction: "all",
                                typeAhead: false,
                            },
                            {xtype: "label", text: "สถานะ : "},
                            {
                                id: "s_i_product_typeID",
                                xtype: "combo",
                                width: 100,
                                mode: "local",
                                store: new Ext.data.SimpleStore({
                                    fields: ["value", "text"],
                                    data: [
                                        ["0", "ทั้งหมด"],
                                        ["1", "1 - วัสดุ"],
                                        ["2", "2 - ครุภัณฑ์"],
                                        ["3", "3 - ไม่ระบุของ"],
                                                // ["3", "3 - ทักท้วง"],
                                                // ["4", "4 - อนุมัติฏีกา"],
                                                // ["5", "5 - หัวหน้าฝ่ายการคลังลงนาม"],
                                                // ["6", "6 - ผู้บริหารลงนาม"],
                                                // ["7", "7 - ผู้บริหารลงนาม"],
                                                // ["8", "8 - จัดทำเช็ค"],
                                                // ["9", "9 - หัวหน้าฝ่ายการคลังลงนามเช็ค"],
                                                // ["10", "10 - ผู้บริหารลงนามเช็ค"],
                                                // ["11", "11 - ทำทะเบียนจ่าย"],
                                    ],
                                }),
                                value: "0",
                                valueField: "value",
                                displayField: "text",
                                allowBlank: false,
                                editable: false,
                                triggerAction: "all",
                                typeAhead: false,
                            },
                            {xtype: "tbfill"},
                        ],
                    }, {
                        xtype: "buttongroup",
                        frame: false,
                        items: [{xtype: "label", text: "ค้นหาโดย : "},
                            {
                                text: "ค้นหา",
                                width: 100,
                                iconCls: "icon-search",
                                xtype: "button",
                                layout: {
                                    type: "hbox",
                                    align: "right",
                                    pack: "end"
                                },
                                handler: function () {
                                    Ext.gridtSearch.search();
                                },
                            }, {
                                xtype: "label", text: ""}, {
                                xtype: "label", text: ""}, {
                                text: "บันทีกแบบขออนุมัติเอกสาร",
                                width: 100,
                                iconCls: "icon-save-edit",
                                xtype: "button",
                                layout: {
                                    type: "hbox",
                                    align: "right",
                                    pack: "end"
                                },
                                handler: function () {
                                    /*c_name
                                     : 
                                     "ซื้ออุปกรณ์ผ่าตัดศัลยกรรม 90 รายการ"
                                     group : 1
                                     pr_code  "PR25671200010"
                                     tor_type_id :  4
                                     update :  "2025-10-07 11:02:50"*/
                                    var p = window.parent.Ext.globValue;
                                    Ext.rec.set("d_doc_ref", p.pr_code);
                                    Ext.rec.set("tor_type_id", p.tor_type_id);
                                    Ext.controllTab(Ext.rec, "ADD");


                                }
                            }
                        ],
                    },
                ],
            },
            {
                xtype: "buttongroup",
                columns: 1,
                height: Ext.groupSearHeight,
                defaults: {scale: "small", style: "float: right"},
            },
            {xtype: "tbfill"},
            {
                xtype: "container",
                items: [
                    {xtype: "container", height: 92},
                    {
                        xtype: "label",
                        html: '<img src="../../images/icons/information.png">',
                        listeners: {
                            render: function (c) {
                                var style_dot_color = "font-size:20px; -webkit-text-stroke: 0.5px black;";
                                var text_ToolTip = "<span style='white-space:nowrap;'><span style='" + style_dot_color + "color: #E4FFE4;'>∎</span>ผ่านรายการ</span>";
                                //   var text_ToolTip = "<span style='white-space:nowrap;'><span style='" + style_dot_color + "color: #DEDEDE;'>∎</span></span><br>";
                                //   text_ToolTip += "<span style='white-space:nowrap;'><span style='" + style_dot_color + "color: #FFEBEB;'>∎</span> รายการยกเลิก</span><br>";
                                new Ext.ToolTip({
                                    target: c.id,
                                    anchor: "top",
                                    html: text_ToolTip,
                                    bodyStyle: {
                                        backgroundColor: "#FFFFFF",
                                    },
                                });
                            },
                        },
                    },
                ],
            }, '->',
            new Ext.form.TwinTriggerField({
                xtype: 'twintriggerfield',
                trigger1Class: 'x-form-clear-trigger',
                trigger2Class: 'x-form-search-trigger',
                onTrigger1Click: function ( ) {
                    alert(1);
                    Ext.getCmp("gridID").getSelectionModel().selectRow(2);
                }, onTrigger2Click: function ( ) {

                    Ext.getCmp("gridID").getSelectionModel().selectRow(0);
                }
            })
        ]});

    Ext.gridtSearch = Ext.apply({search: function () {
            var msg = "";
            if (msg == "") {
                Ext.store.setBaseParam("mode", "LIST_SUB_PERIOD_HDR");
                Ext.store.setBaseParam("type", "SEARCH");
                Ext.store.setBaseParam("filter", Ext.getCmp("filter").getValue());
                Ext.store.setBaseParam("value", Ext.getCmp("value-box").getValue());
                Ext.store.setBaseParam("i_type_contract", Ext.getCmp("i_type_contract").getValue());
                Ext.store.setBaseParam("i_budget_year", Ext.getCmp("s_i_budget_year").getValue());
                Ext.store.setBaseParam("i_budget_year_overlap", Ext.getCmp("s_i_budget_year_overlap").getValue());
                Ext.store.setBaseParam("i_year_contract", Ext.getCmp("s_i_year_contract").getValue());
                Ext.store.setBaseParam("i_enable", Ext.getCmp("s_i_enable").getValue());
                Ext.store.setBaseParam("i_product_type", Ext.getCmp("s_i_product_typeID").getValue());
                Ext.store.setBaseParam("i_status", Ext.getCmp("s_i_statusID").getValue());
            } else {
                Ext.Msg.alert("แจ้งเตือน", msg);
            }
            Ext.store.load();
        }
    });

    Ext.gridBbar = Ext.apply({bbar: [{xtype: 'button', iconCls: "icon-save", text: 'บันทีกรายการที่เลือก'}, ' ', '->',
            new Ext.PagingToolbar({
                pageSize: 20,
                store: Ext.store,
                displayInfo: true,
                displayMsg: "Displaying topics {0} - {1} of {2}",
            })
        ]});

    Ext.extend((gridMain = function () {

        //plug in checkbox expan 
        gridMain.superclass.constructor.call(this, {
            region: "center",
            iconCls: 'icon-application-view-list',
            padding: "10px 10px 10px 10px",
            frame: true,
            loadMask: true, trackMouseOver: false,
            title: Ext.menu_name,
            id: "tabpanel1",
            border: true,
//            stripeRows: true, 
            layout: "fit",
            //------------------
            sm: sm,
            autoScroll: true,
            plugins: expander,
            clicksToEdit: 1,
            store: Ext.store,
            tbar: Ext.gridtbar.tbar,
            columns: Ext.gridColumn.column,
            viewConfig: {
                emptyText: "ไม่มีข้อมูล..",
                deferEmptyText: false,
            },
            bbar: Ext.gridBbar.bbar,
            listeners: {
                dblclick: function (dataview, index, item, e) {
//                     Ext.buAct = "update";
//                     Ext.loadStore("edit", true); // app,data.load
                },
                viewready: function (grid) {
                    grid.getView().mainBody.on('click', function (e, t) {
                        var view = grid.getView();

                        var rowIndex = view.findRowIndex(t);   // หา row index
                        var colIndex = view.findCellIndex(t);  // หา column index

                        var record = grid.getStore().getAt(rowIndex);
                        var fieldName = grid.getColumnModel().getDataIndex(colIndex);


//                                console.log('rowIndex:', rowIndex);
//                                console.log('colIndex:', colIndex);
//                                console.log('fieldName:', fieldName);
//                                console.log('record:', record.data);

                        if (colIndex === grid.getColumnModel().getIndexById("editColID")) {
                            console.log(" ข้อมูลการตั้งค่า ", record);
                            Ext.controllTab(record, 'EDIT'); //on  
                        }

                    }, null, {delegate: 'button'});
                },
                // Allow rows to be rendered.
                beforeedit: function (g)
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


                },
                afterrender: function (grid, rowIndex, columnIndex, e)
                {


                    this.RowContextMenu = new Ext.menu.Menu({
                        items: [
                            {
                                text: "แก้ไขรายละเอียดสัญญา",
                                icon: "../../images/icons/book_magnify.png",
                                handler: function (e)
                                {

                                },
                                scope: this
                            }]
                    });
                    this.on("cellclick", cellClick, this);
                    this.on("contextmenu", function (dataview, index, item, e)
                    {
                        // Use preventDefault to stop the default context menu
                        e.preventDefault();
                        // Optionally, stop the event from bubbling
                        // e.stopPropagation();
                        this.RowContextMenu.showAt(e.getXY());
                    }, this);


                }
            }
        });
    }
    ), Ext.grid.GridPanel, {});
    //EditorGridPanel


    function cellClick(grid, rowIndex, columnIndex, e)
    {
        var rec = grid.getStore().getAt(rowIndex);
    }
    Ext.storePrDoc = new Ext.data.JsonStore({
        storeId: "storeRefId",
        autoLoad: false,
        url: "api/All.php",
        root: "data",
        baseParams: {type: "PRLISTSTEP02", docType: 0, start: 0, limit: 20, mode: null}, //Permission i_read
        idProperty: "id",
        totalProperty: "totalCount",
        fields: ["id", "c_code", "d_doc_ref", "tor_typeTxt", "c_name"],
    });
    var columnMini = [
        {header: "ID System", sortable: true, hidden: true, dataIndex: "id"},
        {header: "เลขที่ PR", sortable: true, dataIndex: "c_code"},
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
    Ext.PopChoosePRForm = new Ext.ux.PoplovPrDoc({
        text: "เลขที่ PR",
        id: "sp_tor_idID", //go to relation
        iconCls: "page_magnify",
        valueHidden: "sp_tor_id", //go to hidden
        store: Ext.storePrDoc,
        headerGrid: columnMini,
        widthText: 280,
        fieldLabel: "เลขที่ PR",
        isCellClickGrid: true,
        cellClickGrid: function (grid, rowIndex, columnIndex, e) {

            var record = grid.getStore().getAt(rowIndex);

            var TextShow = record.data.c_code;
            var TextShow1 = record.data.d_doc_ref;
            var tor_typeTxt = record.data.tor_typeTxt;
            Ext.rec = record;

//            Ext.fnTrigger(Ext.getCmp('sign_step_doc'));
            Ext.rec.set('sp_tor_id', record.data.id);
            Ext.rec.set('pr_code', TextShow);
            Ext.rec.set('sp_tor_idID_Name', TextShow);
            Ext.rec.set('d_doc_ref', TextShow1);
            Ext.rec.set('tor_typeTxt', tor_typeTxt);

            Ext.getCmp('sp_tor_idID').setValue(record.data.id);
            Ext.getCmp('d_doc_ref').setValue(TextShow1);
            Ext.getCmp('sp_tor_idID_Name').setValue(TextShow);
            Ext.getCmp('tor_type_idTxtID').setValue(tor_typeTxt);

            Ext.getCmp("win-pop-lovsp_tor_idID").hide();
            Ext.getCmp("win-pop-lovsp_tor_idID").destroy();


        },
    });
    Ext.rec = {};
    Ext.AddStoreDoc = (rec) => {
        return new Ext.data.JsonStore({
            fields: [
                {name: 'id'},
                {name: 'sp_sign_type_id'},
                {name: 'line'},
                {name: 'dc_user_id'},
                {name: 'full_name'},
                {name: 'position_name'},
                {name: 'action'},
                {name: 'c_approved'},
                {name: 'page'},
                {name: 'date_document'},
                {name: 'line_approved'},
                {name: 'position_y'},
                {name: 'org_name'},
                {name: 'sign_date'},
                {name: 'row'},
                {name: 'col'},
                {name: 'step_sign'},
                {name: 'document_id'},
                {
                    name: 'c_name',
                    convert: function (v, rec) {
                        return rec.position_name + " " + rec.full_name;
                    }
                },
                {
                    name: 'rc',
                    convert: function (v, rec) {
                        return rec.row + "," + rec.col;
                    }
                }
            ],
            data: rec
        });
    };

// สร้าง store ใหม่แต่ละอัน (clone ข้อมูลแยก)
    // กำหนด shared fields
    var gridFields = [
        {name: 'id'},
        {name: 'sp_sign_type_id'},
        {name: 'line'},
        {name: 'dc_user_id'},
        {name: 'full_name'},
        {name: 'position_name'},
        {name: 'c_postion'},
        {name: 'action'},
        {name: 'c_approved'},
        {name: 'page'},
        {name: 'date_document'},
        {name: 'line_approved'},
        {name: 'position_y'},
        {name: 'org_name'},
        {name: 'sign_date'},
        {name: 'row'},
        {name: 'col'},
        {name: 'step_sign'},
        {name: 'document_id'},
        {
            name: 'c_name',
            convert: function (v, rec) {
                return rec.position_name + " " + rec.full_name;
            }
        },
        {
            name: 'rc',
            convert: function (v, rec) {
                return rec.row + "," + rec.col;
            }
        }
    ];
    Ext.createGridStore = (id, rec) => {
//        console.log(" gen store", rec);
        return new Ext.data.JsonStore({
            storeId: "myStore" + id,
            fields: gridFields,
            data: rec
        });
    };

    Ext.createGrid = (gridId, rec) => {
        var records = rec;
        const dataToSave = [];
        const store = Ext.getCmp('grid-step-sign-doc').getStore();
        store.each(function (record) {
            if (gridId == "grid-copy1" && (record.data.id == 3 || record.data.id == 5)) {
                dataToSave.push(record.data);
            } else if (gridId == "grid-copy2" && record.data.id == 5) {
                dataToSave.push(record.data);
            }
        });
    var C_APPROVE_KEY = 'approve_history_'+gridId;
// โหลดประวัติจาก localStorage (สูงสุด 5 รายการ)
    function loadApproveHistory() {
        try {
            var arr = JSON.parse(localStorage.getItem(C_APPROVE_KEY) || '[]');
            if (!Ext.isArray(arr))
                arr = [];
            return arr.slice(0, 5);
        } catch (e) {
            return [];
        }
    } 
// บันทึกข้อความใหม่ลงประวัติ
    function saveApproveHistory(text) {
        var v = (text || '').replace(/\s+/g, ' ').trim();
        if (!v)
            return;
        var arr = loadApproveHistory();
        // ลบค่าที่ซ้ำกับ v
        arr = arr.filter(function (x) {
            return x !== v;
        });
        // ใส่ไว้หัวแถว
        arr.unshift(v);
        // จำกัดไม่เกิน 5 รายการ
        arr = arr.slice(0, 5);
        try {
            localStorage.setItem(C_APPROVE_KEY, JSON.stringify(arr));
        } catch (e) {
        }

        // อัปเดต store ถ้ามี
        var st = Ext.StoreMgr.get('approveHistoryStore');
        if (st) {
            var data = [];
            Ext.each(arr, function (x) {
                data.push([x]);
            });
            st.loadData(data);
        }
    }
    // === สร้าง store สำหรับคอมโบ ===
    var approveHistoryStore = new Ext.data.ArrayStore({
        id: 'approveHistoryStore',
        fields: ['v'],
        data: (function () {
            var data = [];
            Ext.each(loadApproveHistory(), function (x) {
                data.push([x]);
            });
            return data;
        })()
    });	 
    
var comboApprove = {
        xtype: "combo",
        name: gridId+"c_approve",
        id: gridId+"c_approveID",
        width: 300,
        style: "font-size: 12px;",
        emptyText: "- เห็นชอบ",
        store: approveHistoryStore,
        displayField: 'v',
        valueField: 'v',
        mode: 'local',
        editable: true,
        forceSelection: false,
        triggerAction: 'all',
        typeAhead: true,
        minChars: 0,
        listeners: {
            select: function (combo, rec) {
                combo.setValue(rec.get('v'));
                saveApproveHistory(rec.get('v'));
            },
            specialkey: function (field, e) {
                if (e.getKey() === e.ENTER) {
                    saveApproveHistory(field.getValue());
                }
            },
            blur: function (field) {
                saveApproveHistory(field.getValue());
            },
            afterrender: function (combo) {
                combo.getEl().on('focus', function () {
                    combo.doQuery('', true);
                });
            }
        }
    };
        return new Ext.grid.EditorGridPanel({
            id: gridId,
            layout: "fit",
            height: 300,
            border: true,
            stripeRows: true, frame: true,
            tbar: [{
                    xtype: "buttongroup",
                    frame: false,
                    id: 'buttonGroup' + gridId,
                    items: [{xtype: "tbfill"},
                        {xtype: "label", text: " หน้าที่จะลงลายเซ็น :", style: "font-size: 14px;"},
                        {xtype: "tbspacer", width: 4},
                        {xtype: "textfield", id: gridId + "_page", name: "page", value: 3, width: 80},
                        {xtype: "label", text: "ตำแหน่งแกน Y : ", style: "padding-left:10px; font-size: 14px;"},
                        {xtype: "tbspacer", width: 4},
                        {xtype: "textfield", id: gridId + "_position_y", name: "position_y", value: "50", width: 50},
                        {xtype: "label", text: "คำอนุมัติ/เห็นชอบ", style: "padding-left:10px; font-size: 14px;"}, comboApprove
 
				  // , '-', '-', '-', 'คำอนุมัติ/เห็นชอบ:' , comboApprove 
                    ]
                }],
            store: Ext.createGridStore(gridId, dataToSave),
            columns: [
                {
                    header: '-',
//            hidden:true,
                    menuDisabled: true,
                    dataIndex: 'id', fixed: true,
                    align: "center",
                    width: 30,
                },
                {
                    header: 'dc_user_id',
                    hidden: true,
                    dataIndex: 'dc_user_id',
                },
                {

                    header: 'ตำแหน่ง r,c',
                    align: 'center',
                    dataIndex: 'rc', width: 100,
                    editor: Ext.customEditorRowCol,
                    id: 'position_xyID' + gridId, menuDisabled: true, fixed: true,
                    renderer: function (value, metaData, record, row, col, store, gridView) {
                        if (value == "") {
                            metaData.css = 'grid-icon-cell';
                            return '<img src="../../images/icons/xhtml_valid.png" style="vertical-align:middle;margin-right:5px;" />' +
                                    '<span style="color:red;"> ' + record.get('row') + ',' + record.get('col') + ' </span>';
                        } else {
                            return '<span style="color:blue;">' + record.get('row') + ',' + record.get('col') + '  </span>';

                        }

                    }
                },
                {
                    header: 'เลือกผู้ปฎิบัติหน้าที่ 2', width: 230,
                    dataIndex: 'c_postion', menuDisabled: true, fixed: true,
                    id: 'dc_user_idID' + gridId,
//                    editor: Ext.customEditor,
                    iconCls: "icon-vcard",
                    renderer: function (value, metaData, record, row, col, store, gridView) {
                        if (!value || value == 0) {
                            metaData.css = 'grid-icon-cell';
                            return '<img src="../../images/icons/user_add.png" style="vertical-align:middle;margin-right:5px;" />' +
                                    '<span style="color:red;"> แก้ไข ' + value + '</span>';
                        } else {
//                            return '<img src="../../images/icons/user_edit.png" style="vertical-align:middle;margin-right:5px;" />' +
                            return '<span style="color:blue;"> ' + value + '</span>';
                        }

                    }
                },
                {

                    header: 'เจ้าหน้าที่ดำเนินการลงนาม',
                    dataIndex: 'full_name', width: 200,
                    editor: new Ext.form.TextField({
                        allowBlank: false
                    })

                },
                {

                    header: 'ส่วนงาน/ปฎิบัติหน้าที่',
                    dataIndex: 'action', width: 200,
                    editor: new Ext.form.TextField({
                        allowBlank: false
                    })
                },
                {

                    header: 'องค์กร/สังกัด',
                    dataIndex: 'org_name', width: 150,
                    editor: new Ext.form.TextField({
                        allowBlank: false
                    })
                }, {
                    header: "วันที่ลงนาม",
                    sortable: true,
                    align: "center",
                    dataIndex: "sign_date",
                    width: 120,
                    renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                        return shortThaiDate(value);

                    },
                    editor: new Ext.form.DateField()
                }
            ],
            clicksToEdit: 1,
            viewConfig: {
                emptyText: "ไม่มีข้อมูล..",
                deferEmptyText: false
            },
            listeners: {
                renderer: function () {
//                    const gridCmp = this; 
//                      gridCmp.getStore().each(function (record) {
//                        if (gridCmp.getId()=='grid-copy1' && record.data.id == '3') { 
//                            record.set('row',2);  record.set('col',1);
//                            alert(record.data.id);
//                        }else if (gridCmp.getId()=='grid-copy1' && record.data.id == '5') { 
//                            record.set('row',3);  record.set('col',1);
//                            alert(record.data.id);
//                        }else if (gridCmp.getId()=='grid-copy2' && record.data.id == '5') { 
//                            record.set('row',2);  record.set('col',2);
//                            alert(record.data.id);
//                        } 
//                    });

//                    if(Ext.getCmp('grid-copy1'))Ext.getCmp('grid-copy1').on('cellclick', function (grid, rowIndex, columnIndex) {
////                        if (columnIndex === grid.getColumnModel().getIndexById(gridId + '_delete')) {
//                            var rec = grid.getStore().getAt(rowIndex); 
//                                Ext.Msg.alert("แจ้งเตือน", "grid-copy1"); 
//                    }); 
//                    if(Ext.getCmp('grid-copy2'))Ext.getCmp('grid-copy2').on('cellclick', function (grid, rowIndex, columnIndex) { 
//                            var rec = grid.getStore().getAt(rowIndex); 
//                                Ext.Msg.alert("แจ้งเตือน", "grid-copy2"); 
//                    }); 
                },
                afterrender: function () {
                    const gridCmp = this;
                    gridCmp.on('cellclick', function (grid, rowIndex, columnIndex) {
                        if (columnIndex === grid.getColumnModel().getIndexById(gridId + '_delete')) {
                            var rec = grid.getStore().getAt(rowIndex);
                            if (rec) {
                                grid.getStore().remove(rec);
                            } else {
                                Ext.Msg.alert("แจ้งเตือน", "กรุณาเลือกรายการที่จะลบ");
                            }
                      
				    }else if (columnIndex === grid.getColumnModel().getIndexById('dc_user_idID' + gridId,)) {
                            var rec = grid.getStore().getAt(rowIndex);
                            if (rec) { 
						  Ext.Msg.alert("แจ้งเตือน", "แก้ไขรายชื่อ");
                            } else {
                                Ext.Msg.alert("แจ้งเตือน", "กรุณาเลือกรายชื่อแก้ไข");
                            }
                        }
				    
                    });

                }
            }
        });
    };

    Ext.controllTab = (rec, evnt) => {
//        console.log(evnt, rec);
        Ext.customEditorRowCol = new Ext.form.TriggerField({
            triggerClass: 'x-form-search-trigger', // shows the search icon
            editable: false,
            onTriggerClick: function () {
//            console.log(Ext.recMain); 
//            console.log(this.gridEditor.record); 

                Ext.gridEditorRec = this.gridEditor;
                var col = this.gridEditor.record.get('col');
                var row = this.gridEditor.record.get('row');

                var ss = new Ext.Window({
                    title: 'ตำแหน่ง',
                    id: 'win-grid-rowColID',
                    modal: true,
                    maximizable: false,
                    closable: true,
                    listeners: {
                        afterrender: function (obj, eOpts)
                        {

                            this.fn = function (d, h) { //percentage
                                var width = Ext.getBody().getViewSize().width * d;
                                var height = Ext.getBody().getViewSize().height * h;
                                this.setSize(width, height);
//                            this.setTitle(Ext.getCmp('tabpanelGridEmp').lastSelectionText);
                            };
                            this.fn(0.5, 0.5);
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
//              items: [],
                    html: '<iframe name="positionChoose" src="./position.html?rowIndex=' + row + '&Column=' + col + '" style="width:100%; height:100%; border-style:hidden;"></iframe>',
                }).show();

            }
        });

        Ext.SignStore_Type1 = new Ext.data.JsonStore({
            storeId: 'SignStore_Type1',
            fields: ['no','id', 'sp_tor_id', 'type_id', 'i_signer','i_audit','page', 'position_y',  'position_x', 'line', 'dc_user_id', 'full_name', 'position_name', 'action', 'org_name', 'sign_date', 'row', 'col', 'step_sign', 'c_approved']
        });

        Ext.SignStore_Type2 = new Ext.data.JsonStore({
            storeId: 'SignStore_Type2',
            fields: ['no','id', 'sp_tor_id', 'type_id',  'i_signer','i_audit','page', 'position_y', 'position_x', 'line', 'dc_user_id', 'full_name', 'position_name', 'action', 'org_name', 'sign_date', 'row', 'col', 'step_sign', 'c_approved']
        });

        Ext.SignStore_Type3 = new Ext.data.JsonStore({
            storeId: 'SignStore_Type3',
            fields: ['no','id', 'sp_tor_id', 'type_id', 'i_signer','i_audit', 'page', 'position_y',  'position_x', 'line', 'dc_user_id', 'full_name', 'position_name', 'action', 'org_name', 'sign_date', 'row', 'col', 'step_sign', 'c_approved']
        });


        Ext.LoadRecordSign = (p, callback) => {

            var p = window.parent.Ext.globValue;
            Ext.Ajax.request({
                url: '/supplies/sp/tor/api/List_approve_document.php',
                method: 'POST',
                jsonData: {
                    type: "APSTEPS00",
                    pr_code: p.d_doc_ref,
                    document_id: p.group,
                    sp_tor_id: p.sp_tor_id,
                    urlfile: p.url,
                    dateSign: '',
                    step_sign: 0
                },
                success: function (response) {
                    try {
                        var res = Ext.decode(response.responseText);
//                        console.log('✅ Response:', res);

                        if (callback)
                            callback(res); // 🔹 ส่งข้อมูลกลับผ่าน callback

                        if (res.ok) {
                           if(res.totalCount>0){
                                Ext.Msg.alert('สำเร็จ', res.message || 'ข้อมูลในการสร้าง PDF ถูกสร้างเรียบร้อยแล้ว'); 
//                                console.log('📄 ไฟล์บันทึกที่:', res.saved_path);
                           }else{
                                Ext.Msg.alert('สำเร็จ', res.message || 'ข้อมูลในการสร้างเริ่มตั้งค่า');  
                           }
                            
                        } else {
                            Ext.Msg.alert('ผิดพลาด', res.message || 'ไม่สามารถสร้าง PDF ได้');
                        }

                    } catch (e) {
                        Ext.Msg.alert('ข้อผิดพลาด', 'ไม่สามารถอ่านข้อมูลจาก server ได้');
                        console.error('Response parse error:', e, response.responseText);
                        if (callback)
                            callback(null);
                    }
                },
                failure: function (response) {
                    Ext.Msg.alert('ข้อผิดพลาด', 'การเชื่อมต่อกับ server ล้มเหลว (' + response.status + ')');
                    console.error('Server error:', response);
                    if (callback)
                        callback(null);
                }
            });
        };

        Ext.callFromAdd = (rec) => {
            // --- ความจำข้อความ c_approve ใน localStorage ---
//            console.log("callFromAdd Method REC ", rec);
            // 🔹 แบ่งข้อมูลตาม type_id
            var type1 = [];
            var type2 = [];
            var type3 = [];
 
            Ext.each(rec.sort(function (a, b) {
                return a.line - b.line; // เรียงจากน้อย → มาก
            }), function (rec) {
                if (rec.type_id == 1)
                    type1.push(rec);
                else if (rec.type_id == 2)
                    type2.push(rec);
                else if (rec.type_id == 3)
                    type3.push(rec);
            });
            // 🔹 โหลดข้อมูลลงแต่ละ Store
            Ext.SignStore_Type1.loadData(type1);
            Ext.SignStore_Type2.loadData(type2);
            Ext.SignStore_Type3.loadData(type3); 
//            console.log("SignStore_Type1 ", Ext.SignStore_Type1);
//            console.log("SignStore_Type2 ", Ext.SignStore_Type2);
//            console.log("SignStore_Type3 ", Ext.SignStore_Type3);
// 
//alert(" st 1 "+Ext.SignStore_Type1.totalLength+" , st2 "+Ext.SignStore_Type2.totalLength+", st3"+Ext.SignStore_Type3.totalLength);
 
            if (Ext.getCmp("frm-Add"))
                Ext.getCmp("contenterCenter").remove(Ext.getCmp("frm-Add"), true) || {}; // null obj not errer 
            if (Ext.getCmp("tabpanel1"))
                Ext.getCmp("contenterCenter").remove(Ext.getCmp("tabpanel1"), true) || {}; // null obj not errer 
            let frmAdd = new formAdd(rec);
            Ext.getCmp("contenterCenter").add(frmAdd);
            Ext.getCmp("contenterCenter").setActiveTab(frmAdd);
            Ext.getCmp("role-form-mode").setValue("EDIT");

            if (type1.length > 0) {
                Ext.butt == "EDIT"; 
                var ids = [];
                Ext.SignStore_Type1.data.each(function (record) {
//                    console.log(record.get('line')));
                    ids.push(record.get('line'));
                    var NewRecord = Ext.getCmp('grid-step-sign-doc').store.recordType;  // this gets the Record constructor
                    var newRec = new NewRecord({
                        id: record.get('id'),
                        dc_user_id: record.get('dc_user_id'),
                        dc_emp_id: record.get('dc_emp_id'),
                        c_postion: record.get('position_name'),
                        full_name: record.get('full_name'),
                        action: record.get('action'),
                        org_name: record.get('org_name'),
                        sign_date: record.get('sign_date'),
                        c_approved: record.get('c_approved'),
                        row: record.get('row'),
                        col: record.get('col'),
                        line: record.get('line'),
                        i_signer: record.get('i_signer'),
                        i_audit: record.get('i_audit'),
                        rc: record.get('row') + ',' + record.get('col'),
                        step_sign: record.get('step_sign'),
                        document_id: record.get('document_id') //document_id step_sign line
                    });
                    Ext.getCmp('grid-step-sign-doc').store.add(newRec); 
                    Ext.getCmp('c_approveID').setValue(record.get('c_approved'));
                    Ext.getCmp('sp_sign_type_idID').setValue(record.get('sp_sign_type_id'));
                    Ext.getCmp('pageID').setValue(record.get('page'));
                    Ext.getCmp('position_yID').setValue(record.get('position_y'));

                });
                
                Ext.getCmp('sign_step_doc').setValue(ids.join(';'));
                
                if (Ext.SignStore_Type2.totalLength > 0) {
                    
                    if (!Ext.getCmp('tab2')) {
                        Ext.getCmp('tabMainID').add({
                            title: "วางลายเซ็นแบบที่ 2 ตำแหน่ง",
                            iconCls: "icon-vcard",
                            id: "tab2",
                            closable: true,
                            layout: "fit",
                            items: [Ext.createGrid("grid-copy1", (Ext.butt == "EDIT") ? Ext.SignStore_Type2.data : {})]
                        });
                        
                        Ext.getCmp('tabMainID').setActiveTab('tab2');
                    
                        Ext.getCmp('grid-copy1_page').setValue(Ext.SignStore_Type2.data.items[0].get('page'));
                        Ext.getCmp('grid-copy1_position_y').setValue(Ext.SignStore_Type2.data.items[0].get('position_y'));
/////////////////////END EDIT///////////////////////////////////////////////////////////////////////////////////////////////////////////////////// ///

                    } else {

                    }

                }
                if (Ext.SignStore_Type3.totalLength > 0) {  
                    if (!Ext.getCmp('tab3')) {
                        Ext.getCmp('tabMainID').add({
                            title: " วางลายเซ็นแบบที่ 1 ตำแหน่ง",
                            iconCls: "icon-vcard",
                            id: "tab3",
                            layout: "fit",
                            closable: true,
                            items: [Ext.createGrid("grid-copy2", (Ext.butt == "EDIT") ? Ext.SignStore_Type3.data : {})]
                        });
                    Ext.getCmp('tabMainID').setActiveTab('tab3');
                    Ext.getCmp('grid-copy2_page').setValue(Ext.SignStore_Type3.data.items[0].get('page'));
                    Ext.getCmp('grid-copy2_position_y').setValue(Ext.SignStore_Type3.data.items[0].get('position_y'));
                    } else {

                    }

                }
            } else {

            }
        };
        //@TODO Add on Version 1 

        var p = window.parent.Ext.globValue;

        Promise.all([])
                .then(() => {
                    window.parent.Ext.getCmp("settingID").getEl().mask("Please wait...", "x-mask-loading"); //window.parent.Ext.getCmp("settingID").getEl().unmask();
                })
                .then(() => {
                    window.parent.Ext.getCmp('fr1ID').getEl().unmask();
                    return new Promise((resolve, reject) => {
                        Ext.LoadRecordSign(p, function (res) {
                            if (res) {
                                console.log(" ได้ข้อมูลกลับจาก server:", res);
                                Ext.callFromAdd(res.data); 
                                window.parent.Ext.getCmp("settingID").getEl().unmask();
                            }
                        });

                    });
                }).catch((error) => {
            console.error(error);
        })
                .finally(() => {
//                  
                });
    };
    Ext.selectRows = (p, store) => {

        // //Ext.globValue
        store.setBaseParam("type", "APSTEPS10");
        store.setBaseParam("pr_code", p.pr_code);
        store.setBaseParam("tor_type_id", p.tor_type_id);
        store.setBaseParam("group", p.group);
        store.setBaseParam("ownner", 1);
        store.load({
            callback: function (record, operation, success) {
                if (success)
                {
                    if (record)
                    {

                        console.log("Edit", record[0]);
                        console.log("EDIT", record[0]);
                        Ext.controllTab(record[0], 'EDIT'); //on  

                    } else {
                        var p = window.parent.Ext.globValue;
                        Ext.rec.set("d_doc_ref", p.pr_code);
                        Ext.rec.set("tor_type_id", p.tor_type_id);

                        Ext.controllTab(Ext.rec, 'ADD'); //on  
                    }
                }
            }
        });
    };

}
; // controllTab
// 
//OnLoad Renderer App
Ext.onReady(function () {
    Ext.QuickTips.init();
          if (typeof user_right_add === 'undefined' || user_right_add === null) { 
                
                window.location.href = '../access/logout.php'; // หรือ URL อื่นที่ต้องการ
                return false;
            }
    Ext.user_right_add = user_right_add;
    Ext.user_right_edit = user_right_edit;
    Ext.user_right_delete = user_right_delete;



//@TODO Add on Version 1  
    Ext.menu_name = Ext.title;
    Ext.AppUx("SP", Ext.menu_code); //app & show menu


    var App = new Ext.Viewport({
        layout: "border",
        items: new Ext.TabPanel({
            region: "center",
            border: false,
            id: "contenterCenter",
//            items: new gridMain(),
            listeners: {
                afterrender: function () {
                    fnLoad = () => {
                        Ext.getCmp("contenterCenter").setActiveTab("tabpanel1");
                        Ext.Ajax.request({
                            url: './conf/config.json',
                            method: 'GET',
                            success: function (response) {
                                var jsonData;
                                try {
                                    jsonData = Ext.decode(response.responseText, true); // true = safe decode (ไม่ throw error)
                                } catch (e) {
                                    Ext.Msg.alert('Error', 'Invalid JSON format in config.json');
                                    Ext.getCmp("contenterCenter").getEl().unmask();
                                    return;
                                }

                                if (!jsonData) {
                                    Ext.Msg.alert('Error', 'Empty or invalid JSON in config.json');
                                    Ext.getCmp("contenterCenter").getEl().unmask();
                                    return;
                                }

                                Ext.config = jsonData;
                                // ถ้าต้องการใช้ config ใน store
                                if (Ext.status_sigature_document) {
                                    Ext.store.setBaseParam("type", Ext.status_sigature_document);
                                    Ext.store.reload();
                                }
                                var p = window.parent.Ext.globValue;

                                Ext.controllTab(p, "ADD");
                                Ext.getCmp("contenterCenter").getEl().unmask();
                            },
                            failure: function (response) {
                                Ext.Msg.alert('Error', 'Failed to load config.json (' + response.status + ')');
                                Ext.getCmp("contenterCenter").getEl().unmask();
                            }
                        });
                    };
                    fnLoad();

                }
            }

        }),
    });
});