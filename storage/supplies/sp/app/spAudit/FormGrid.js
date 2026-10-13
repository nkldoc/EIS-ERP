
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

    Ext.sentNotif = (function () {

        window.parent.Ext.btnApprove = ((status) => {
            
            const pr = Ext.getCmp('d_doc_ref').getValue();
            const user_id = window.parent.Ext.session.user_id || '60113'; 
            const nextUsersId  = Ext.recMain.get('doc_next_user_id'); 
            const url = Ext.stepPreview(Ext.getCmp('urlfileID').getValue(), Ext.getCmp('stepSignID').getValue() || '');
            const c_name = Ext.getCmp('c_name').getValue(); //'2568' + Math.floor(Math.random()*90000+10000);
            const line = Ext.rec.get('line') || 1;
            const sign_step = Ext.getCmp('stepSignID').getValue() || 1;
            const dateSignCheck = Ext.getCmp('dateSignID').getValue() && Ext.rec.get('date_type') !== 2 ? Ext.util.Format.date(Ext.getCmp('dateSignID').getValue() || new Date(), 'Y-m-d') : '';
            const insertUrl = '../../notif/'.replace(/[^\/]*$/, '') + 'approveDocument';
            const payload = 'pr_code=' + encodeURIComponent(pr)
                    + '&approver_id=' + encodeURIComponent(user_id)
                    + '&url=' + encodeURIComponent(url)
                    + '&line=' + encodeURIComponent(line)
                    + '&nextUsersId=' + encodeURIComponent(nextUsersId)//(parseInt(line)+1) '60047,40050,30047,60630,60520,1
                    + '&dateSign=' + encodeURIComponent(dateSignCheck)
                    + '&c_name=' + encodeURIComponent(c_name)
                    + '&title=' + encodeURIComponent(status === 'back' ? 'ทักท้วงเอกสารลงนาม' : 'เอกสารผ่านการลงนาม')
                    + '&sign_step=' + encodeURIComponent(sign_step);
 
                  console.log("Payload Msg",payload);  
            Ext.Ajax.request({
                url: insertUrl,
                method: 'POST',
                headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                params: payload, 
                success: function (result, request) {
                    var jsonData = Ext.util.JSON.decode(result.responseText); //decode json
                    if (jsonData.success) { 
//                            Ext.MessageBox.alert("Success", "บันทึกเรียบร้อย");
                            Ext.getCmp('tab-prw').destroy();
                    } else {
                        Ext.MessageBox.alert("Failed", ); // alert massage error
                    }

                },
                failure: function (result, request) {
                    Ext.MessageBox.alert("Failed", result.responseText); // connect error
                } 
            });
        })();
    });
    
    Ext.approved = Ext.apply({
        updateStatus: function (status, obj) {
 
            var payload;
            var tab = obj || {};
      

            Ext.userNextID = (Ext.getCmp('user_next_return_id').getValue() > 0 && (status=='back' || 'return'))
            ?Ext.getCmp('user_next_return_id').getValue() 
            :Ext.recMain.get('doc_next_user_id');
            var payload = {
                mode: 'edit',
                status: status,
                sp_sign_document_id: Ext.recMain.get('sp_sign_document_id'),
                sp_tor_id: Ext.recMain.get('sp_tor_id'),
                document_id: Ext.recMain.get('document_id'),
                c_comment: Ext.c_comment_backID || status,
                audit_id: Ext.recMain.get('i_audit') || 0,
                i_audit: Ext.recMain.get('i_audit') || 0,
                i_status: (status=='forword'?1:2) || 1,
                doc_prev_user_id: Ext.recMain.get('doc_prev_user_id') || 0,
                doc_active_user_id: Ext.recMain.get('doc_active_user_id') || 0, 
                nextUsersId:Ext.userNextID
            };
 
            console.log(Ext.recMain);
            console.log(payload);
//            return false;
            Ext.Ajax.request({
                url: "./app/api/mnSignerAuditDocUpdate.php",
                params: payload,
                method: "POST", //GET
                success: function (result, request) {
                    var jsonData = Ext.util.JSON.decode(result.responseText); //decode json
                    if (jsonData.success) {
                        Ext.MessageBox.alert("Success", jsonData.message, function () { 
                            Ext.sentNotif(status); 
                            tab.destroy();
                            Ext.getCmp('MessageBox_re').destroy(); 
                            Ext.getCmp('tab-prw').destroy();
                            Ext.getCmp("tabpanel1").getStore().reload();
                            Ext.sentNotif(status); 
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
    Ext.butTxtEdit = " ลงนาม ";
    Ext.butTxtAdd = " แก้ไขลงนาม ";
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

Ext.timeline = function(id){

    var logStore = new Ext.data.JsonStore({
        url: 'api/List_items.php',
        root: 'data',
        totalProperty: 'total',
        autoLoad: true,
        baseParams: {
            sp_sign_document_id: id,
            type: 'sp_approve_items_log'
        },
        fields: [
            'd_create',
            'dc_user_id',
            'user_act_name',     // ✅ เพิ่ม
            'i_audit',
            'audit_text',
            'comment',
            'i_status',
            'status_text',
            'document_name',
            'combinefile',
            'pr_code'
        ]
    });

 

var timelineTpl = new Ext.XTemplate(
    '<tpl for=".">',
        '<div class="tl-row {[this.rowCls(values, xindex, parent.length)]}">',

            '<div class="tl-icon">',
                '{[this.icon(values.i_audit)]}',
            '</div>',

            '<div class="tl-content">',
                '<div class="tl-title">{audit_text}</div>',

                '<div class="tl-meta">',
                    '{d_create}',
                    '<tpl if="user_act_name">',
                        ' | <span class="tl-user">{user_act_name}</span>',
                    '</tpl>',
                '</div>',

                '<div class="tl-status {[this.statusCls(values.i_status)]}">',
                    '{status_text}',
                '</div>',

                '<tpl if="comment">',
                    '<div class="tl-comment">🗨 {comment}</div>',
                '</tpl>',

            '</div>',
        '</div>',
    '</tpl>',
    {
        icon: function(i){
            switch (i) {
                case 1: return '📝';
                case 2: return '➡️';
                case 3: return '🔍';
                case 4: return '✅';
                case 5: return '✍️';
                default: return '•';
            }
        },
        statusCls: function(s){
            switch (s) {
                case 0: return 'st-pending';
                case 1: return 'st-done';
                case 2: return 'st-warning';
                case 3: return 'st-return';
                default: return '';
            }
        },
        rowCls: function(values, idx, total){
            // แถวสุดท้าย = สถานะปัจจุบัน
            return (idx === total) ? 'tl-current' : '';
        }
    }
);

 
var timelinePanel = new Ext.Panel({
    autoScroll: true,
    border: false,
    bodyStyle: 'background:#fff;padding:10px',
    tpl: timelineTpl
});

logStore.on('load', function(store){
    var rows = [];
    store.each(function(r){
        rows.push(r.data);
    });
    timelinePanel.update(rows);
});

var win = new Ext.Window({
    title: '📜 Timeline การลงนาม',
    modal: true,
    width: 800,
    height: 500,
    layout: 'fit',
    items: timelinePanel,
    listeners: {
        show: function(w) {
            // คลิกที่ document
            w.mon(Ext.getDoc(), 'mousedown', function(e) {
                // ถ้าคลิก "นอก" window → ปิด
                if (!e.within(w.el)) {
                    w.close();
                }
            });
        }
    }
});

win.show();


};


    var expander = new Ext.ux.grid.RowExpander({
        expandOnEnter: true,
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
        tpl: new Ext.Template(
                '<div style="font-weight:bold;">รายละเอียด</div>',
                '<div style="padding-left:35px; border-top:1px solid #ece; margin-top:5px;">',
                '<table style="width:100%;">',
                '<tr>',
                '<td style="width:40%; vertical-align:top;">',
                '<p><b>สถานะการลงนาม:</b> {c_status}</p>',
                '<p><b>เลขเอกสาร:</b> {c_code_detail}</p>',
//                '<p><b>ขั้นตอน:</b> ',
//                '<select id="check_{id}">',
//                '<option value="0" {[values.step_sign==0?"selected":""]}>ทักท้วง</option>',
//                '<option value="1" selected>ส่งหัวหน้าสายงาน</option>',
//                '<option value="2" {[values.step_sign==2?"selected":""]}>หัวหน้าพนักงานพัสดุ</option>',
//                '<option value="3" {[values.step_sign==2?"selected":""]}>ลงนามเอกสาร</option>',
//                '</select>',
//                '</p>',
//                '<p><b>บันทีกการส่งรายการ:</b> ',
                '<button class="buHTML btn-timeline" onclick="Ext.timeline({sp_sign_document_id});" id="buttonSave_{id}">  📜 รายละเอียดการลงนาม </button>', 
                '</p>',
                '</td>',
                '<td style="width:60%; vertical-align:top;">',
                '<p><b>ชื่อรายการ:</b> {c_name}</p>',
                '<p><b>วิธการดำเนินงาน:</b> {tor_type_idTxt}</p>',
                '<p><b>จำนวนเงิน:</b> {f_total_amt}</p>',
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
    var styleBu = 'style="width:auto; min-width:85px; display: flex; height: 18px; padding: 0px 5px 0px 13px;"';

// Ext.styleBt.style,
    Ext.buStyle = Ext.apply({
        style: {
            backgroundImage: 'url(../images/icons/magnifier2.png)',
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
            {
                id: "editColID",
                header: "-",
                align: "center",
                fixed: true,
                hidden: true,
                menuDisabled: true,
                width: 100,
                dataIndex: "id",
                renderer: function (value, metaData, record, row, col, store, gridView) {

                    var val = Ext.butTxtEdit;
                    //new.png  vcard_edit.png
                    var BtnText = "<img src='../images/icons/new_red.png' style='margin-right:1px;' /><div><spen style='font-size:11px'>" + val + "</spen>";
                    return '<button ' + styleBu + ' type="button">' + BtnText + "</button>";

                }
            },
            {
                id: "auditColID",
                header: "-",
                align: "center",
                fixed: true,
                menuDisabled: true,
                width: 170,
                dataIndex: "id",
                renderer: function (value, metaData, record, row, col, store, gridView) {
                    var disabled = 'disabled';
                    var img = 'new_red.png';
                    var val;
                    var color = 'blue;';
                    if (record.get('i_fish')) {
                        val = "เอกสารลงนามอย่างสมบูรณ์แล้ว";
                        img = 'bullet_tick.png';
                    } else if (record.get('doc_active_user_id') === Ext.session.user_id) {
                        if (record.get('i_status') == 2) {
                            val = "รอดำเนินการ ทักท้วง";
                            img = 'vcard_delete.png';
                            color = 'red;';
                        } else if (record.get('i_status') == 9) {
                            val = "อนุมัติเรียบร้อยแล้ว";
                            img = 'tick.png';
                        } else {
                            val = "รอดำเนินการ";
                            img = 'vcard_add.png';
                        }

                        disabled = '';
                    } else if (record.get('active_line') > record.get('ownner_line')) {
                        if (record.get('is_room') != 0) {
                            var txt = '';
                            if (record.get('is_room') == 1) {
                                txt = 'หน้าห้องหัวหน้าพัสดุ';
                                disabled = '';
                            } else if (record.get('is_room') == 2) {
                                txt = 'หน้าห้องรองคณบดี';
                            } else if (record.get('is_room') == 3) {
                                txt = 'หน้าห้องคณบดี';
                            }

                            val = txt + "กำลังตรวจสอบ";
                            img = 'vcard_add.png';
                        } else {
                            val = "ดำเนินการแล้ว";
                            img = 'vcard.png';
                        }


                    } else {

                        if (record.get('i_status') == 2) {
                            val = "รอดำเนินการ ทักท้วง";
                            img = 'vcard_delete.png';
                            color = 'red;';
                        } else if (record.get('i_status') == 9) {
                            val = "อนุมัติเรียบร้อยแล้ว";
                            img = 'tick.png';
                        } else {
                            val = "รอดำเนินการ";
                            img = 'vcard_add.png';
                        }


                    }


                    var BtnText = "<img src='../images/icons/" + img + "' style='margin-right:1px;' /><div><spen style='color:" + color + " font-size:11px'>" + val + "</spen>";
                    return '<button ' + disabled + ' ' + styleBu + ' type="button">' + BtnText + "</button>";

                }
            }, {
                header: "สถานะดำเนินการ",
                width: 120,
                align: "left",
                dataIndex: "c_status",
            }, {
                header: "ผู้ดำเนินการ",
                width: 140,
                align: "left",
                dataIndex: "active_name", renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                    metaData.attr = "style='text-align: left;font-weight:bold; color:blue;'";
                    return  value;
                }
//               }, {
//                    header: "ผู้ดำถัดไป",
//                    align: "left",
//                    dataIndex: "next_name",
//                    hidden: false, 
//                    width: 180,
            }, {
                header: "เลขที่อ้างอิง",
                sortable: true,
                align: "left",
                dataIndex: "d_doc_ref",
                width: 190,
                renderer: function (value, metaData, record, row, col, store, gridView) {
                    return record.get('c_code_detail') + " " + value;
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
                    return txtBt;
                }

            }, {
                header: "ขั้นตอนอนุมัติ",
                width: 199,
                align: "left",
                dataIndex: "step_sign",
                hidden: true,
            },
            {

                id: "c_name",
                header: "รายการซื้อจ้าง    ",
                width: 280,
                align: "left",
                dataIndex: "c_detail",
                renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                    var txtBt = value;
                    metaData.attr = 'ext:qtip="' + value + '"';
                    return txtBt;
                }
            }, {
                header: "id",
                sortable: false,
                align: "left",
                dataIndex: "id",
                hidden: true, // icon: "../images/icons/application_view_tile.png"

            }, {
                header: "เจ้าหน้าที่ผู้จัดทำเอกสาร",
                align: "left",
                hidden: false,
                dataIndex: "ownner_name",

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
                hidden: false,
                align: "center",
                dataIndex: "d_update",
                renderer: function (val, metaData, record, rowIndex, colIndex, store) {
                    return shortThaiDate(val);
                }
            }, {header: "", dataIndex: ""}
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
                                iconCls: "icon-save-page",
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
                                text: "ลงนามหลายฉบับ",
                                width: 100,
                                iconCls: "icon-save-page",
                                xtype: "button",
                                layout: {
                                    type: "hbox",
                                    align: "right",
                                    pack: "end"
                                },
                                handler: function () {
                                    controllTab({}, "ADD");
                                }
                            }
                        ],
                    },
                ],
            },
            {xtype: "tbfill"},
            {
                xtype: "container",
                items: [{xtype: 'button'},
                    {xtype: "container", height: 92},
                    {
                        xtype: "label",
                        html: '<img src="../images/icons/information.png">',
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
                onTrigger1Click: function () {
                    Ext.getCmp("gridID").getSelectionModel().selectRow(2);
                }, onTrigger2Click: function ( ) {
                    Ext.getCmp("gridID").getSelectionModel().selectRow(0);
                }
            })

        ]});

    Ext.gridtSearch = Ext.apply({search: function () {
//            var msg = "";
//            if (msg == "") {
//                Ext.store.setBaseParam("mode", "LIST_SUB_PERIOD_HDR");
//                Ext.store.setBaseParam("type", "SEARCH");
//                Ext.store.setBaseParam("filter", Ext.getCmp("filter").getValue());
//                Ext.store.setBaseParam("value", Ext.getCmp("value-box").getValue());
//                Ext.store.setBaseParam("i_type_contract", Ext.getCmp("i_type_contract").getValue());
//                Ext.store.setBaseParam("i_budget_year", Ext.getCmp("s_i_budget_year").getValue());
//                Ext.store.setBaseParam("i_budget_year_overlap", Ext.getCmp("s_i_budget_year_overlap").getValue());
//                Ext.store.setBaseParam("i_year_contract", Ext.getCmp("s_i_year_contract").getValue());
//                Ext.store.setBaseParam("i_enable", Ext.getCmp("s_i_enable").getValue());
//                Ext.store.setBaseParam("i_product_type", Ext.getCmp("s_i_product_typeID").getValue());
//                Ext.store.setBaseParam("i_status", Ext.getCmp("s_i_statusID").getValue());
//            } else {
//                Ext.Msg.alert("แจ้งเตือน", msg);
//            }
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
    
    var statusStore = new Ext.data.SimpleStore({
        fields: ['value', 'text'],
        data: [
//            ['progress', 'กำลัง ตรวจสอบ/ลงนาม  👈 '],
//            ['return', '<span style="color:red;">ทักท้วง</span> 👈 '],
//            ['done', '<span style="color:blue;">ดำเนินการแล้ว</span>'],
            ['myselt', 'ที่รอดำเนิน 👈'],
            ['allSeft', 'เห็นทั้งหมด 👈'],
            ['tor_type_1', '<span style="color:blue;">วิธีการดำเนินงานที่ต่ำกว่า 5 แสน 👈</span>'],
            ['text_filter', 'textfield'] // ตัวสุดท้าย = ช่องกรองข้อความ
        ]
    });

    var defaultStatuses = ['myselt'];

    var statusMenu = new Ext.menu.Menu({items: []});

// ====== สร้างเมนูจาก statusStore ======
    statusStore.each(function (rec) {
        var val = rec.get('value');
        var txt = rec.get('text');

        if (val === 'text_filter') {
            statusMenu.add('-');
            // ✅ เพิ่ม Item ว่างไว้ก่อน แล้วจะใส่ TextField ตอนหลัง render
            statusMenu.add(new Ext.menu.Item({
                id: 'menuFilterTextItem',
                hideOnClick: false,
                canActivate: false,
                text: '<div id="filterTextContainer" style="padding:1px;"></div>',
                listeners: {
                    render: function () {
                        // ✅ สร้าง TextField ลงใน div ที่เตรียมไว้
                        new Ext.form.TextField({
                            id: 'menuTextFilter',
                            width: 170,
                            emptyText: 'พิมพ์คำค้นหา...',
                            enableKeyEvents: true,
                            listeners: {
                                keyup: function (field, e) {
                                    onTextFilterChange(field.getValue());
                                },
                                render: function (f) {
                                    // ป้องกันเมนูปิดเมื่อคลิกในช่อง
                                    f.getEl().on('click', function (ev) {
                                        ev.stopEvent();
                                    });
                                }
                            }
                        }).render('filterTextContainer');
                    }
                }
            }));
        } else {
            var checkedDefault = defaultStatuses.indexOf(val) !== -1;
            statusMenu.add(new Ext.menu.CheckItem({
    text: txt,
    value: val,
    group: 'statusGroup',   // ⭐ สำคัญ
    checked: checkedDefault,
    hideOnClick: false,
    checkHandler: function (item, checked) {
        if (checked) {
            updateStatusButtonText();
        }
    }
}));

        }
    });

// ======= ปุ่ม Combo =======
    var statusButton = new Ext.Button({
        id: 'filterStatusBtn',
        text: 'เอกสารทั้งหมด',
        icon: '../images/icons/page_white_acrobat.png',
        menu: statusMenu,
        width: 180
    });

// ======= ฟังก์ชันอัปเดตชื่อปุ่ม =======
    function updateStatusButtonText() {
    var selected = null;
    statusMenu.items.each(function (it) {
        if (it.checked) {
            selected = it.text;
        }
    });

    statusButton.setText(
        selected ? Ext.util.Format.stripTags(selected) : 'เอกสารทั้งหมด'
    );
}


// ======= ฟังก์ชันเมื่อพิมพ์ใน textfield =======
    function onTextFilterChange(val) {
        console.log('🔎 คำค้นหา:', val);
        // ที่นี่สามารถ filter grid / store ได้ เช่น
        // myGridStore.filter('fieldName', val);
    }

// ======= รีเซ็ตค่าเริ่มต้น =======
    function resetToDefaultStatuses() {
    statusMenu.items.each(function (it) {
        if (it.value) {
            it.setChecked(it.value === defaultStatuses[0], true);
        }
    });

    var tf = Ext.getCmp('menuTextFilter');
    if (tf) tf.setValue('');

    updateStatusButtonText();
}


    updateStatusButtonText();


    Ext.gridTbar = Ext.apply({}, {
        xtype: 'toolbar',
        items: [
            'เริ่มวันที่:',
            {
                xtype: 'datefield',
                id: 'filterDate-start',
                width: 120,
//                format: 'Y-m-d'
            },
            '-',
            'ถึง:',
            {
                xtype: 'datefield',
                id: 'filterDate-end',
                width: 120,
//                format: 'Y-m-d'
            },
            '-',
            statusButton,
            '-',
            {
                text: 'ค้นหา',
                icon: '../images/icons/feed_magnify.png',
                handler: function () {
                    var d = Ext.getCmp('filterDate-start').getRawValue();
                    var e = Ext.getCmp('filterDate-end').getRawValue();

                    var selectedStatuses = [];
                    statusMenu.items.each(function (it) {
                        if (it.checked)
                            selectedStatuses.push(it.value);
                    });


                    Ext.store.load({
                        params: {
                            filter_date_start: d,
                            filter_date_end: e,
                            filter_status: selectedStatuses.join(',')
                        }
                    });
                }
            }, '-',
            {
                text: 'ล้าง',
                icon: '../images/icons/comment_delete.png',
                handler: function () {
                    Ext.getCmp('filterDate-start').reset();
                    Ext.getCmp('filterDate-end').reset();
                    resetToDefaultStatuses();
                    Ext.store.load({params: {}});
                }
            }
        ]
    });

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
//            tbar: Ext.gridtbar.tbar,
            columns: Ext.gridColumn.column,
            viewConfig: {
                emptyText: "ไม่มีข้อมูล..",
                deferEmptyText: false,
            },
            bbar: Ext.gridBbar.bbar,
            tbar: Ext.gridTbar,
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
//                        var fieldName = grid.getColumnModel().getDataIndex(colIndex);


//                                console.log('rowIndex:', rowIndex);
//                                console.log('colIndex:', colIndex);
//                                console.log('fieldName:', fieldName);
//                                console.log('record:', record.data);

                        if (colIndex === grid.getColumnModel().getIndexById("editColID")) {
                            controllTab(record, record.get('sp_approval_hdr_id') > 0 ? 'EDIT' : 'ADD'); //on  
                        } else if (colIndex === grid.getColumnModel().getIndexById("auditColID")) {
                            controllTab(record, record.get('i_audit') > 0 ? 'EDIT' : 'ADD'); //on  
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
                                icon: "../images/icons/book_magnify.png",
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
    var gridOnSave = (val) => {

        if (val == 'back') {

            Ext.recMain.set('i_audit', 0);
            Ext.recMain.set('i_status', 0);
            Ext.recMain.set('doc_prev_user_id', 0);
            Ext.recMain.set('doc_active_user_id', 0);
            Ext.recMain.set('doc_next_user_id', 0);
        } else {
            Ext.recMain.set('i_audit', 0);
            Ext.recMain.set('i_status', 0);
            Ext.recMain.set('doc_prev_user_id', 1);
            Ext.recMain.set('doc_active_user_id', 1);
            Ext.recMain.set('doc_next_user_id', 1);
        }

        var payload = {
            mode: 'edit',
            sp_tor_id: Ext.recMain.get('sp_tor_id'),
            document_id: Ext.recMain.get('document_id'),
            i_audit: Ext.recMain.get('i_audit') || 0,
            i_status: Ext.recMain.get('i_status') || 0,
            doc_prev_user_id: Ext.recMain.get('doc_prev_user_id') || 0,
            doc_active_user_id: Ext.recMain.get('doc_active_user_id') || 0,
            doc_next_user_id: Ext.recMain.get('doc_next_user_id') || 0
        };

        console.log(payload);
        return false;

//        window.parent.Ext.getCmp("settingID").getEl().mask("Please wait...", "x-mask-loading");

        Ext.Ajax.request({
            url: './api/mnSignerAuditDocUpdate.php',
            method: 'POST',
            jsonData: payload,
            success: function (response) {
                const res = Ext.decode(response.responseText);
                console.log(res);
                if (res.success === 'success') {

                    Ext.Msg.alert('สำเร็จ', res.message || 'บันทึกข้อมูลเรียบร้อยแล้ว');
                    store.commitChanges();

                } else {
                    Ext.Msg.alert('ผิดพลาดในการบันทึก', res.message || '<span style="white-space: nowrap;">เกิดข้อผิดพลาด/มีการบันทึกซ้ำ</span>');
                }
            },
            failure: function (response) {
                Ext.Msg.alert('ผิดพลาด', '<span style="white-space: nowrap;">ไม่สามารถติดต่อเซิร์ฟเวอร์ได้</span>');
            }
        });
//        window.parent.Ext.getCmp("settingID").getEl().unmask();
    };
   
//    
//Ext.saveConfirm = function () {
//    var combo = Ext.getCmp('user_next_return_id');
//    if (!combo) return '';
//
//    var value = combo.getValue();      // id
//    var text  = combo.getRawValue();   // 🔥 name (displayField)
//
//    console.log('id:', value, 'name:', text);
//    return text;
//};
Ext.saveConfirm = function () {
    var combo = Ext.getCmp('user_next_return_id');
    if (!combo) return '';

 
//    var rec = combo.getStore().findRecord('id', id);

    return '';
//    return rec ? rec.get('name') : '';
};    
    Ext.save = () => {
        
        
        var msgTxt = "<h1 align=center>ตรวจสอบรายละเอียดให้เรียบร้อย</h1>"
                + " <b>เลขอ้างอิง :  </b>  " + Ext.getCmp('c_code_detail').getValue()
                + " <br><b>เอกสาร :  </b>  " + Ext.getCmp('c_name').getValue()
                + " <br><b>ขั้นตอน :   </b> " + Ext.rec.get('c_status')
                + " <br><b>วิธีดำเนินงาน :  </b>  " + Ext.rec.get('tor_type_idTxt')
//                                        + " <br><b>ผู้ลงนาม :  </b>  " + Ext.rec.get('full_name')
                + " <br><b>วันที่ :  </b> " + Ext.util.Format.date(Ext.getCmp('dateSignID').getValue() || new Date(), 'd/m/Y')
                + ((Ext.rec.get('date_type') === 2) ? "<h1 align=center>วันที่ลงนาม กำหนดภายหลัง</h1>" : "")
                + " <br><b>ส่ง :  </b>  " + Ext.saveConfirm()+" ตรวจสอบ/ลงนาม/อนุมัติ";

        var win = new Ext.Window({
            title: 'ยืนการการลงนามอย่างสมบูรณ์',
            id: 'msgTxtID',
            modal: true,
            width: 800,
            height: 350,
            layout: 'fit',
            bodyStyle: {background: "#ffffff", "padding": "15px"},
            html: '<div style="font-size:18px; font-weight:normal; ">' + msgTxt + '</div>',
            buttonAlign: "center",
            buttons: [{
                    text: 'ยืนยันบันทึกการลงนาม',
                    icon: '../images/icons/save.png',
                    id: 'btnApprove',
                    handler: function () {
                        Ext.approved.updateStatus('forward', Ext.getCmp('msgTxtID'));

                    }
                },
                {
                    text: ' ❌ ยกเลิก',
                    icon: '../images/icons/cancel.png',
                    handler: function () {
                        console.log('ยกเลิก');
                        this.ownerCt.ownerCt.close();
                    }
                }
            ] ,   listeners: {
        show: function(w) {
            // คลิกที่ document
            w.mon(Ext.getDoc(), 'mousedown', function(e) {
                // ถ้าคลิก "นอก" window → ปิด
                if (!e.within(w.el)) {
                    w.close();
                }
            });
        }
    }
        }).show();


    };

Ext.saveOption = function (opt) {

    var win = Ext.getCmp('winReturn');

    if (!win) {

        win = new Ext.Window({
            title: 'เลือกการดำเนินการเอกสาร',
            width: 400,
            height: 300,
            id: 'winReturn',
            modal: true,
            layout: 'fit',

            items: [{
                xtype: 'form',
                id: 'saveFrmID',
                bodyStyle: 'padding:15px;',

                items: [{
                    xtype: 'radiogroup',
                    fieldLabel: 'การดำเนินการ',
                    columns: 1,
                    vertical: true,
                    id: 'actionDoc',

                    items: [
                        { boxLabel: 'ทักท้วง เจ้าพนักเจ้าของเรื่อง', name: 'actionDoc', inputValue: 'back' },
                        { boxLabel: 'ยืนยันการส่งคืนผู้ทักท้วง', name: 'actionDoc', inputValue: 'return' }
                    ],

                    listeners: {
                        change: function (rg, checked) {

                            var val = rg.getValue().inputValue;
                            var combo = Ext.getCmp('user_next_return_id');
                            var store = combo.getStore();

                            if (val === 'back' || val === 'return') {
                                combo.show();

                                if (store.getCount() === 0) {
                                    store.load({
                                        callback: function (records, op, success) {
                                            if (success) {
                                                combo.setValue(
                                                    Ext.recMain.get('doc_next_user_id')
                                                );
                                            }
                                        }
                                    });
                                }

                            } else {
                                combo.hide();
                                combo.reset();
                            }
                        }
                    }

                },
                Ext.comboReturn,
                {
                    xtype: "textarea",
                    fieldLabel: 'หมายเหตุ',
                    emptyText: "สาเหตุยกเลิกรายการ...",
                    name: "c_comment",
                    id: "c_comment_backID",
                    width: 200
                }]
            }],

            buttons: [{
                text: 'ตกลง',
                icon: "../images/icons/save.png",
                handler: function () {

                    var actionVal = Ext.getCmp('actionDoc').getValue();

                    if (!actionVal) {
                        Ext.Msg.alert('แจ้งเตือน', 'กรุณาเลือกตัวเลือกก่อน');
                        return;
                    }

                    var val = actionVal.inputValue;

                    Ext.c_comment_backID = Ext.getCmp('c_comment_backID').getValue();
                    Ext.sp_step_id = Ext.getCmp('user_next_return_id').getValue();

                    if (val === 'return') {

                        if (!Ext.sp_step_id) {
                            Ext.Msg.alert('แจ้งเตือน', 'กรุณาเลือกตำแหน่งที่ส่งกลับ');
                            return;
                        }

                        Ext.approved.updateStatus(val, win);

                    } else if (val === 'back') {

                        Ext.approved.updateStatus(val, win);

                    } else {

                        Ext.save();
                    }
                }

            }, {
                text: '❌ ยกเลิก',
                icon: "../images/icons/cancel.png",
                handler: function () {
                    win.hide();
                }
            }]
        });
    }

    win.show();
};

    
    function parsePdfPath(path) {
        // แยกด้วยเครื่องหมาย /
        const parts = path.split('/');
        const year = parts[0] || '';
        const prCode = parts[1] || '';
        const folder = parts[2] || '';
        const fileName = parts[3] || '';

        // แยกชื่อไฟล์ (ตัด .pdf ออก)
        const nameOnly = fileName.replace('.pdf', '');
        const fileParts = nameOnly.split('_');

        const prCode2 = fileParts[0] || '';
        const step = parseInt(fileParts[1] || 0);
        const index = parseInt(fileParts[2] || 0);

        return {
            year,
            prCode,
            folder,
            fileName,
            prCode2,
            step,
            index
        };
    } 
    Ext.openUploadWindow = (rec, url, evnt) => {
        var fileFieldId = Ext.id();
        var pbId = Ext.id();
        var infoId = Ext.id();
        var btnUploadId = Ext.id();
        url = url || '';
        evnt = evnt || '';

        var form = new Ext.form.FormPanel({
            border: false, bodyStyle: 'padding:10px', fileUpload: false, labelWidth: 120, defaults: {anchor: '100%'},
            items: (!url || evnt == 'edit') ? [
                {xtype: 'displayfield', value:
                            '<div style="line-height:1.6">'
                            + '<b>รหัส:</b> ' + Ext.util.Format.htmlEncode(rec.get('pr_code')) + ' &nbsp; <b>เลขวิธีการดำเนินงาน:</b> ' + rec.get('tor_type_id')
                            + ' &nbsp; <b>เลขกลุ่ม:</b> ' + rec.get('document_id') + '<br/>'
                            + '<b>หัวข้อ:</b> ' + Ext.util.Format.htmlEncode(rec.get('c_name')) + '<br/>'
//                + '<b>หน้า:</b> '+ rec.get('page') + ' &nbsp; <b>กลุ่ม:</b> '+ rec.get('group') +'<br/>'
                            + ('<b> file :</b>' + rec.get('urlfile') + '</b>')
                            + '</div>'
                },
                {xtype: 'textfield', id: fileFieldId, inputType: 'file', fieldLabel: 'เลือกไฟล์ PDF', allowBlank: false},
                {xtype: 'displayfield', id: infoId, value: 'ยังไม่ได้เลือกไฟล์', style: 'color:#666'},
                {xtype: 'box', autoEl: {tag: 'div', html:
                                '<div id="' + pbId + '" class="x-progress-wrap x-progress-wrap-center" style="margin-top:8px;height:22px;border:1px solid #ccc;">'
                                + '<div class="x-progress-inner" style="height:100%;position:relative;">'
                                + '<div class="x-progress-bar" style="width:0%;height:100%;"></div>'
                                + '<div class="x-progress-text" style="position:absolute;left:0;top:0;width:100%;text-align:center;line-height:22px;">0%</div>'
                                + '</div></div>'
                    }}
            ] : [{fieldLabel: 'url', xtype: 'displayfield', value: url},
                {fieldLabel: 'เปิดดูเอกสาร', xtype: 'button', text: 'เปิด PDF', handler: function () {
//                        addIframeview(); 
                        toggleSettingTab('docPDFID', rec);
                        win.close();
                    }},
                {fieldLabel: 'อัพโหลดอีกครั้ง', xtype: 'button', text: 'แก้ไข/อัพโหลด PDF อีกครั้ง', handler: function () {
                        Ext.openUploadWindow(rec, url, 'edit');
                        win.close();
                    }},
                {fieldLabel: 'ตั้งค่าเอกสาร', xtype: 'button', text: 'ตั้งค่าลงนาม PDF', handler: function () {
                        toggleSettingTab('settingID', rec);
                        win.close();
                    }}
            ]
        });

        var win = new Ext.Window({title: 'อัปโหลดเอกสาร PDF', width: 620, height: 300, modal: true, layout: 'fit', items: form, buttons: [{text: '❌ ปิด', handler: function () {
                        win.close();
                    }}, 
                {text: 'ดาวน์โหลดเอกสารต้นฉบับ', id: 'dowloadBtnID', handler: doDowload},
                {text: 'อัปโหลด', id: btnUploadId, handler: doUpload},
                {text: 'Upload Quere', id: 'btnUpload2Id', handler: doUploadQueue }
            ]});
        win.show();

//          setTimeout(function(){ var input = Ext.getCmp(fileFieldId).getEl().dom; input.accept = 'application/pdf'; input.onchange = function(){ var f = input.files && input.files[0]; var msg = f ? ('ไฟล์: '+Ext.util.Format.htmlEncode(f.name)+' ('+fmtBytes(f.size)+')') : 'ยังไม่ได้เลือกไฟล์'; Ext.getCmp(infoId).setValue(msg); }; },10);
        function setProgress(pct) {
            pct = Math.max(0, Math.min(1, pct || 0));
            var wrap = document.getElementById(pbId);
            if (!wrap)
                return;
            var bar = wrap.querySelector('.x-progress-bar');
            var txt = wrap.querySelector('.x-progress-text');
            if (bar)
                bar.style.width = Math.round(pct * 100) + '%';
            if (txt)
                txt.textContent = Math.round(pct * 100) + '%';
        }
        function slugName(s) {
            return String(s || '').trim().replace(/[\\\/:*?"<>|]+/g, ' ').replace(/\s+/g, ' ').replace(/^\s+|\s+$/g, '');
        }
        function yyyymmPath(d) {
            var dt = d || new Date();
            var y = dt.getFullYear();
            return y + '/supplies/';
        }



// ======== ตัวอย่างการใช้งาน ========

        function doDowload() {
    
           Ext.previewPDF(true);
        }
        
        function doUpload() {
            var input = Ext.getCmp(fileFieldId).getEl().dom;
            var f = input.files && input.files[0];
            if (!f) {
                Ext.Msg.alert('แจ้งเตือน', 'กรุณาเลือกไฟล์ PDF');
                return;
            }
            if (f.type && f.type.toLowerCase().indexOf('pdf') === -1) {
                Ext.Msg.alert('แจ้งเตือน', 'โปรดเลือกไฟล์นามสกุล .pdf');
                return;
            }

            // -----------------------------
            // ✅ ค่าหลักที่ต้องกำหนด
            // -----------------------------
//    year,
//    prCode,
//    folder,
//    fileName,
//    prCode2,
//    step,
//    index
            const url = rec.get('urlfile'); //"2025/PR25680200023/input/PR25680200023_1_2.pdf";
            const info = parsePdfPath(url);

            var prCode = info.prCode;     // หรือมาจาก rec.get('pr_code')
            var year = info.year;
            var step = info.step;                   // ลำดับขั้นตอน
            var index = info.index;                   // ลำดับไฟล์ในขั้นตอน

            // -----------------------------
            // ✅ สร้างชื่อไฟล์ปลายทาง
            // -----------------------------
            var baseName = prCode + '_' + step + '_' + index + '.pdf';
            var targetDir = year + '/' + prCode + '/input/';
            var fullPath = rec.get('urlfile');// targetDir + baseName;  // 2025/PR25680200023/input/PR25680200023_1_2.pdf

            // -----------------------------
            // ✅ เตรียม FormData
            // -----------------------------
            Ext.getCmp(btnUploadId).setDisabled(true);
            setProgress(0);

            var fd = new FormData();
            fd.append('file', f);
            fd.append('node_id', rec.id);
            fd.append('title', rec.get('title') || '');
            fd.append('page', String(rec.get('page') || ''));
            fd.append('group', String(step));
            fd.append('pr_code', prCode);
            fd.append('group_no', String(index));
            fd.append('targetDir', targetDir);
            fd.append('targetFile', baseName);
            fd.append('url', fullPath); // ✅ เพิ่ม URL แบบเต็ม

            // -----------------------------
            // ✅ ส่งผ่าน AJAX
            // -----------------------------
            var xhr = new XMLHttpRequest();
            var UPLOAD_URL = '/supplies/uploadPdfServletDriveD'; // ปรับให้ตรง Servlet จริง  
            xhr.open('POST', UPLOAD_URL, true);
            xhr.withCredentials = true;

            xhr.upload.onprogress = function (e) {
                if (e.lengthComputable)
                    setProgress(e.loaded / e.total);
            };

            xhr.onreadystatechange = function () {
                if (xhr.readyState !== 4)
                    return;
                try {
                    var ok = (xhr.status >= 200 && xhr.status < 300);
                    var res = {};
                    try {
                        res = JSON.parse(xhr.responseText || '{}');
                    } catch (_) {
                    }

                    if (ok && res && (res.success === true || res.status === 'OK')) {
                        setProgress(1);
                        Ext.Msg.alert('สำเร็จ',
                                'อัปโหลดไฟล์แล้ว<br>ที่เก็บ: ' + Ext.util.Format.htmlEncode(fullPath),
                                function () {
                                    Ext.getCmp("frm-Add")
                                            .getEl()
                                            .mask("ระบบกำลังสร้างลายเซ็นและลงนามในเอกสาร....", "x-mask-loading");
                                    Ext.genToPdf();

                                    Ext.genToPdf(1, null);
                                    win.close();
                                    Ext.getCmp('MessageBox_re').destroy();
                                    Ext.getCmp('frm-Add').destroy();
//                        Ext.getCmp("frm-Add").getEl().unmask();


//                        Ext.handlerSaveAll(Ext.util.Format.htmlEncode(fullPath), rec);
//                        reloadFromServer();
                                }
                        );
                    } else {
                        Ext.Msg.alert('ผิดพลาด', (res && (res.message || res.error)) || ('HTTP ' + xhr.status));
                        Ext.getCmp(btnUploadId).setDisabled(false);
                        setProgress(0);
                    }
                } catch (e) {
                    Ext.Msg.alert('ผิดพลาด', 'ไม่สามารถประมวลผลผลลัพธ์ได้');
                    Ext.getCmp(btnUploadId).setDisabled(false);
                    setProgress(0);
                }
            };

            xhr.onerror = function () {
                Ext.Msg.alert('ผิดพลาด', 'การเชื่อมต่อขัดข้อง');
                Ext.getCmp(btnUploadId).setDisabled(false);
                setProgress(0);
            };

            xhr.send(fd);
        }
        function doUploadQueue() {
            var input = Ext.getCmp(fileFieldId).getEl().dom;
            var f = input.files && input.files[0];
            if (!f) {
                Ext.Msg.alert('แจ้งเตือน', 'กรุณาเลือกไฟล์ PDF');
                return;
            }
            if (f.type && f.type.toLowerCase().indexOf('pdf') === -1) {
                Ext.Msg.alert('แจ้งเตือน', 'โปรดเลือกไฟล์นามสกุล .pdf');
                return;
            }

            // -----------------------------
            // ✅ ค่าหลักที่ต้องกำหนด
            // -----------------------------
//    year,
//    prCode,
//    folder,
//    fileName,
//    prCode2,
//    step,
//    index
            const url = rec.get('urlfile'); //"2025/PR25680200023/input/PR25680200023_1_2.pdf";
            const info = parsePdfPath(url);

            var prCode = info.prCode;     // หรือมาจาก rec.get('pr_code')
            var year = info.year;
            var step = info.step;                   // ลำดับขั้นตอน
            var index = info.index;                   // ลำดับไฟล์ในขั้นตอน

            // -----------------------------
            // ✅ สร้างชื่อไฟล์ปลายทาง
            // -----------------------------
            var baseName = prCode + '_' + step + '_' + index + '.pdf';
            var targetDir = year + '/' + prCode + '/input/';
            var fullPath = rec.get('urlfile');// targetDir + baseName;  // 2025/PR25680200023/input/PR25680200023_1_2.pdf

            // -----------------------------
            // ✅ เตรียม FormData
            // -----------------------------
            Ext.getCmp(btnUploadId).setDisabled(true);
            setProgress(0);

            var fd = new FormData();
            fd.append('file', f);
            fd.append('node_id', rec.id);
            fd.append('title', rec.get('title') || '');
            fd.append('page', String(rec.get('page') || ''));
            fd.append('group', String(step));
            fd.append('pr_code', prCode);
            fd.append('group_no', String(index));
            fd.append('targetDir', targetDir);
            fd.append('targetFile', baseName);
            fd.append('url', fullPath); // ✅ เพิ่ม URL แบบเต็ม

            // -----------------------------
            // ✅ ส่งผ่าน AJAX
            // -----------------------------
            var xhr = new XMLHttpRequest();
            var UPLOAD_URL = '../../notif/uploadPdf'; // ปรับให้ตรง Servlet จริง  
            xhr.open('POST', UPLOAD_URL, true);
            xhr.withCredentials = true;

            xhr.upload.onprogress = function (e) {
                if (e.lengthComputable)
                    setProgress(e.loaded / e.total);
            };

            xhr.onreadystatechange = function () {
                if (xhr.readyState !== 4)
                    return;
                try {
                    var ok = (xhr.status >= 200 && xhr.status < 300);
                    var res = {};
                    try {
                        res = JSON.parse(xhr.responseText || '{}');
                    } catch (_) {
                    }

                    if (ok && res && (res.success === true || res.status === 'OK')) {
                        setProgress(1);
                        Ext.Msg.alert('สำเร็จ',
                                'อัปโหลดไฟล์แล้ว<br>ที่เก็บ: ' + Ext.util.Format.htmlEncode(fullPath),
                                function () {
                                    Ext.getCmp("frm-Add")
                                            .getEl()
                                            .mask("ระบบกำลังสร้างลายเซ็นและลงนามในเอกสาร....", "x-mask-loading");
                                    Ext.genToPdf();

                                    Ext.genToPdf(1, null);
                                    win.close();
                                    Ext.getCmp('MessageBox_re').destroy();
                                    Ext.getCmp('frm-Add').destroy();
 
                                }
                        );
                    } else {
                        Ext.Msg.alert('ผิดพลาด', (res && (res.message || res.error)) || ('HTTP ' + xhr.status));
                        Ext.getCmp(btnUploadId).setDisabled(false);
                        setProgress(0);
                    }
                } catch (e) {
                    Ext.Msg.alert('ผิดพลาด', 'ไม่สามารถประมวลผลผลลัพธ์ได้');
                    Ext.getCmp(btnUploadId).setDisabled(false);
                    setProgress(0);
                }
            };

            xhr.onerror = function () {
                Ext.Msg.alert('ผิดพลาด', 'การเชื่อมต่อขัดข้อง');
                Ext.getCmp(btnUploadId).setDisabled(false);
                setProgress(0);
            };

            xhr.send(fd);
        }

    };
    // ====== END Upload Window ====== 

    Ext.getIframeDocSafe = (frame) => {
        // รับได้ทั้ง element id หรือ DOM element
        if (typeof frame === 'string')
            frame = Ext.getCmp(frame).el.dom.contentWindow;
        if (!frame)
            return null;
        // ยังไม่โหลดหรือไม่มี contentWindow ก็รอไปก่อน
        if (!frame.contentWindow)
            return null;

        try {
            // ทดสอบสิทธิ์การเข้าถึง (cross-domain จะ throw)
            var w = frame.contentWindow;
            var d = w.document; // จุดที่มัก error
            // บางครั้งยังเป็น about:blank
            if (!d || d.readyState === 'loading')
                return null;
            return d;
        } catch (e) {
            // ข้ามโดเมน หรือยังโหลดไม่เสร็จ
            return null;
        }
    };


    Ext.genTabAuditDoc = (url) => {
// เมนูเครื่องมือ 


        var toolsMenu = new Ext.menu.Menu({
            items: [
                {
                    text: 'เครื่องมือ 🎯 bookmarks/รายการข้อความ/marks เอกสาร ',
                    icon: '../images/icons/text_list_numbers.png', hideOnClick: true,
                    handler: function () {

                        var fr = Ext.getCmp('pdfFrame').el.dom.contentWindow;
                        fr.window.loadJsonToImages('load');
                        fr.window.toggleTools();

                    }
                } , '-', {
                text: " ข้อมูลโครงสร้างเอกสารซื้อจ้าง PDF /views",
                icon: "../images/icons/layout_edit.png",
                handler: function () {

                    var tabPanel = Ext.getCmp('contenterCenter'); 
                    if (tabPanel) {
                        var tabId = 'tab-structor-pr';
                        var existingTab = tabPanel.getComponent(tabId);
                
                        
                        if (!existingTab) {
                            tabPanel.add({
                                id: tabId,
                                title: 'ข้อมูลโครงสร้างเอกสารซื้อจ้าง',
                                iconCls: 'icon-vcard', // ใช้ไอคอนตามต้องการ
                                closable: true,
                                html: iframeHtml('./app/mnBookmarkTemplate.php'),
                            });
                            // แสดงแท็บที่เพิ่มขึ้นมา
                            tabPanel.setActiveTab(tabId);
                        }
                    }
                }
//            } 
//                , '-', {
//                    text: 'ดาวน์โหลด PDF เอกสาร PDF เพื่อแก้ไขทักท้วง', hideOnClick: true,
//                    icon: '../images/icons/disk_download.png',
//                    handler: function () {
//                        console.log(Ext.recMain);
//                        Ext.openUploadWindow(Ext.recMain, Ext.recMain.get('url'), 'edit');
//                    }
                }, '-', {text: 'ดาวน์โหลด/นำเข้าไฟล์เอกสาร PDF แก้ไขแล้วทักท้วง', hideOnClick: true,
                    icon: '../images/icons/disk_upload.png',
                    handler: function () {
                        console.log(Ext.recMain);
                        Ext.openUploadWindow(Ext.recMain, Ext.recMain.get('url'), 'edit');
                    }
                }, '-', {

                    text: "1) ทักท้วง/ส่งคืนเอกสาร ❌ ",
                    icon: "../images/icons/table_save.png", hideOnClick: true,
                    handler: function () {
                        Ext.saveOption();
                    }
                }, '-', {

                    text: " 2) อนุมัติ/ลงนามเอกสาร ✅ ", hideOnClick: true,
                    icon: "../images/icons/text_signature.png",
                    id: 'btn_save-MessageBox_re',
                    handler: function () {
                        Ext.genTabSignDoc(Ext.getCmp('urlID').getValue(), 'tapSignID');
                    }

                }, '-', {
                    text: "3) ยืนยันการลงนาม  ✅  ",
                    icon: "../images/icons/save.png", hideOnClick: true,
                    handler: function () {
                        Ext.save();
                    }
                }, '-', {

                    text: "4) เอกสาร pdf ", hideOnClick: true,
                    icon: "../images/icons/icon_pdf.png",
                    id: 'btn_pre-MessageBox_re',

                    handler: function () {
                        Ext.previewPDF();
                    }
//                }, '-', {
//                    text: 'ซูมเข้า', hideOnClick: false,
//                    icon: '../images/icons/zoom_in.png',
//                    handler: function () {
////				    var win = Ext.getCmp('pdfFrame').el.dom.contentWindow;
//                        if (win && typeof win.zoomIn === 'function')
//                            win.zoomIn();
//                    }
//                },
//                {
//                    text: 'ซูมออก', hideOnClick: false,
//                    icon: '../images/icons/zoom_out.png',
//                    handler: function () {
//                        var win = Ext.getCmp('pdfFrame').el.dom.contentWindow;
//                        if (win && typeof win.zoomOut === 'function')
//                            win.zoomOut();
//                    }
//                },
//                {
//                    text: 'พอดีกว้าง',
//                    icon: '../images/icons/text_fit.png',
//                    handler: function () {
//                        var win = Ext.getCmp('pdfFrame').el.dom.contentWindow;
//                        if (win && typeof win.fitWidth === 'function')
//                            win.fitWidth();
//                    }
                },
                '-',
                {
                    text: 'ปิดหน้า',
                    icon: '../images/icons/page_go.png',
                    handler: function () {
                       Ext.getCmp('MessageBox_re').destroy();
                        
                    }
                },
            ]
        });
        // ยูทิลช่วยสร้าง iframe ภายในแท็บ
        function iframeHtml(url) {
            return '<iframe  width="100%" height="100%" frameborder="0" class="tab-iframe" src="' + url + '" loading="lazy"></iframe>';
        }

        // ดึง iframe ของแท็บปัจจุบัน
        function getTabIframe(tab) {
            if (!tab)
                return null;
            var el = tab.body ? tab.body.dom : tab.getEl().dom;
            return el ? el.querySelector('iframe.tab-iframe') : null;
        }
// ปุ่ม/ไอเท็มฝั่งขวาบนของ toolbar
        var topRightTools = [
//    '->',
            '-',
            '-',

//		  {xtype: 'tbtext', text: 'เมนูและเครื่องมือ'},
            {
                xtype: 'button',
                text: 'เครื่องมือ Tools', width: 150,
                icon: '../images/icons/wrench.png',
                menu: toolsMenu
            }, '-', {
                text: 'รีเฟรช',
                icon: '../images/icons/arrow_refresh.png',
                handler: function () {
                    var f = Ext.getCmp('pdfFrame');
                    if (f && f.el && f.el.dom) {
                        // รีโหลด iframe พร้อม bust cache
                        var src = f.el.dom.src;
                        src = src.replace(/__dc=\d+(\.\d+)?/, '__dc=' + Math.random());
                        f.el.dom.src = src;
                    }
                }
            }, '-', {
                text: " อนุมัติ/ลงนาม เอกสารPDF",
                icon: "../images/icons/text_signature.png",
                handler: function () {
                    Ext.genTabSignDoc(Ext.getCmp('urlID').getValue(), 'tapSignID');
                }
            }, '-', {
                            text: " ยืนยันการลงนาม  ✅ ", 
                            hidden:true,
                            id:'saveSingStep1ID',
                            icon: "../images/icons/save.png",
                            handler: function () {
                                Ext.save();
                            }
                        },'->', {

                            text: " ทักท้วง/ส่งคืนเอกสาร ❌ ",
                            icon: "../images/icons/table_save.png", hideOnClick: true,
                            handler: function () {
                                Ext.saveOption();
                            }
                        },
            '->', '-', {style: 'margin-right:20px;', xtype: "label", text: "วิธีการดำเนินงาน " + Ext.recMain.get('tor_type_idTxt') + " " + Ext.recMain.get('pr_code') + " เอกสาร " + Ext.recMain.get('c_name')}

        ];


        var step = parseInt(Ext.recMain.get('step_sign')) - 1;
        var path = url;
        var url = path.replace(/\/\d+_PR/, "/" + step + "_PR");
 
        var reviewForm = new Ext.form.FormPanel({
            id: 'reviewForm',
            border: false,
            bodyStyle: 'padding:2px',
            layout: 'vbox',
            layoutConfig: {align: 'stretch'},
            tbar: new Ext.Toolbar({
                items: topRightTools
            }),
            items: [{
                    xtype: 'box',
                    id: 'pdfFrame',
                    autoEl: {
                        tag: 'iframe',
                        id: 'ifr-tools',
                        frameborder: 0,
                        src: './app/view_drawremove.php?__dc=' + Math.random() + '&path=' + url+ '&audit_id=' + Ext.rec.get('a'),
                        style: 'width:100%;height:100%;display:block;'
                    }
                }]

        });

        (function openTab() {
            var center = Ext.getCmp("contenterCenter");
            if (!center) {
                Ext.Msg.alert('ผิดพลาด', 'ไม่พบคอมโพเนนท์ contenterCenter');
                return;
            }
            var existed = center.getComponent("MessageBox_re");
            if (existed) {
                existed.destroy();
            }

            var win = new Ext.Panel({
                id: "MessageBox_re",
                title: "ตรวจสอบ/ทักท้วง/อนุมัติ/ลงนามลายเซ็น เอกสาร",
                layout: "fit",
                closable: true, // ให้ปิดแท็บได้
                border: false,
                items: [reviewForm],
                listeners: {
                    afterrender: function () {

                    }
                }
            });
            center.add(win);
            center.setActiveTab(win);
            center.hideTabStripItem(1);

        })();
    };


    Ext.genTabSignDoc = function (url, id) {
        var suffix = (id !== undefined && id !== null && String(id).trim() !== "") ? String(id).trim() : "";
        var formId = 'signForm' + (suffix ? '-' + suffix : '');
        var frameId = 'pdfSignFrame' + (suffix ? '-' + suffix : '');
        var wrapId = 'MessageBox_re' + (suffix ? '-' + suffix : '');

        var reviewForm = new Ext.form.FormPanel({
            id: formId,
            border: false,
            bodyStyle: 'padding:0px',
            layout: 'vbox',
            layoutConfig: {align: 'stretch'},
            items: [{
                    xtype: 'box',
                    id: frameId,
                    autoEl: {
                        tag: 'iframe',
                        frameborder: 0,
                        src: './app/draw_sign.php?__dc=' + Math.random() + '&path=' + url,
                        style: 'width:100%;height:100%;display:block;'
                    }
                }],
            buttonAlign: 'left',
            buttons: [{
                    text: "บันทึกตรวจสอบ/ลงนาม เอกสาร",
                    icon: "../images/icons/save.png",
                    id: "btn_save-" + wrapId,
                    handler: function () {
//        Ext.saveOption();

                        Ext.getCmp("contenterCenter").getEl().mask("ระบบกำลังสร้างลายเซ็นใน pdf ...", "x-mask-loading");
                        var win = Ext.getCmp('pdfSignFrame-tapSignID').el.dom.contentWindow;
                        Ext.signImg = win.window.saveSingStep1(); 
                        Ext.getCmp('saveSingStep1ID').setVisible(true);
                        Ext.genToPdf(null, Ext.signImg);
                         
                        
                        Ext.getCmp("contenterCenter").getEl().unmask();

                    }
                }, {
                    text: "ย้อนกลับ",
                    icon: "../images/icons/delete.png",
                    handler: function () {
                        // ปิด container ที่ห่ออยู่ (window หรือ panel ใน tab)
                        var win = this.findParentByType('window');
                        if (win) {
                            win.close();
                            return;
                        }
                        var pnl = this.findParentByType('panel');
                        if (pnl && pnl.ownerCt && pnl.ownerCt.remove) {
                            pnl.ownerCt.remove(pnl, true);
                        } else if (pnl && pnl.destroy) {
                            pnl.destroy();
                        }
                    }
                }]
        });

        // ---- มี id ⇒ เปิดเป็นหน้าต่างใหม่ ----
        if (suffix) {
            var existedWin = Ext.getCmp(wrapId);
            if (existedWin)
                existedWin.close();

            var win = new Ext.Window({
                id: wrapId,
                title: "ตรวจสอบเอกสารก่อนจะลงนามสร้างลายเซ็น",
                width: 950,
                height: 540,
                layout: "fit",
                modal: true,
//      maximizable: true,
                items: [reviewForm],
                listeners: {
                     show: function(w) {
            // คลิกที่ document
             w.maximize();
            w.mon(Ext.getDoc(), 'mousedown', function(e) {
           
                // ถ้าคลิก "นอก" window → ปิด
                if (!e.within(w.el)) {
                    w.close();
                }
            });
        }
                }
            });
            win.show();
            return;
        }

        // ---- ไม่มี id ⇒ เปิดในแท็บกลาง (contenterCenter) ----
        var center = Ext.getCmp("contenterCenter");
        if (!center) {
            Ext.Msg.alert('ผิดพลาด', 'ไม่พบคอมโพเนนท์ contenterCenter');
            return;
        }
        var existed = center.getComponent("MessageBox_re");
        if (existed)
            existed.destroy();

        var tab = new Ext.Panel({
            id: "MessageBox_re",
            title: id ? 'ลงนามสร้างลายเซ็น' : 'ตรวจสอบเอกสารก่อนจะลงนามสร้างลายเซ็น',
            layout: "fit",
            closable: true,
            border: false,
            items: [reviewForm]
        });
        center.add(tab);
        center.setActiveTab(tab);
    };

    Ext.stepPreview = (url, step) => { 
        if (!url || typeof url !== "string")
            return "";

        // แยก path ออกเป็นส่วน ๆ โดยรองรับทั้ง / และ \
        var parts = url.split(/[\/\\]+/);

        if (parts.length < 4) {
            console.warn("Invalid URL format:", url);
            return url; // คืนค่าเดิมถ้ารูปแบบไม่ถูก
        }

        var year = parts[0];      // เช่น 2025
        var prCode = parts[1];    // เช่น PR25680400078
        var fileName = parts[3];  // เช่น PR25680400078_1_1.pdf

        let urlPath;
        if (step == '') {
            // step 0 → ใช้ path เดิม
            urlPath = `${year}/${prCode}/input/${fileName}`;
        } else if (step === 0) {
            // step 0 → ใช้ path เดิม
            urlPath = `${year}/${prCode}/${step}_${fileName}`;
        } else {
            // step > 0 → เปลี่ยนชื่อไฟล์ตามรูปแบบที่ต้องการ
            urlPath = `${year}/${prCode}/${step}_${fileName}`;
        }
//alert(urlPath);
        return urlPath;
    };
    Ext.previewPDF = (org) => {
        if (!Ext.isEmpty(Ext.getCmp('tab-prw')))
            Ext.getCmp('tab-prw').destroy();
        function iframeHtml(url) {
            return `<iframe src="${url}" width="100%" height="100%" frameborder="0"></iframe>`;
        }
        var tabPanel = Ext.getCmp('contenterCenter');
            var urlPath = org?Ext.rec.get('urlfile') || '' :Ext.stepPreview(Ext.getCmp('urlfileID').getValue(), Ext.getCmp('stepSignID').getValue() || '');
 
        if (tabPanel) {
            // ตรวจสอบว่ามีแท็บ prw แล้วหรือยัง
            var tabId = 'tab-prw';
            var existingTab = tabPanel.getComponent(tabId);

            if (!existingTab) {
                // ถ้ายังไม่มี -> เพิ่มแท็บใหม่
                tabPanel.add({
                    id: tabId,
                    title: 'เอกสาร PDF ',
                    iconCls: 'icon-vcard', // ใช้ไอคอนตามต้องการ
                    closable: true,
                    tbar: ['-', '-', '-', 
                        {
                            text: " แก้ไขลายเซ็น เอกสาร PDF",
                            icon: "../images/icons/text_signature.png",
                            handler: function () {
//                                console.log(Ext.signImg);
                                Ext.genTabSignDoc(Ext.getCmp('urlID').getValue(), 'tapSignID');
                            }
                        }, '-', '-', {
                            text: " ยืนยันการลงนาม  ✅ ",
                            id:'confirmSingID',
//                            disabled:true,
                            icon: "../images/icons/save.png",
                            handler: function () {
                                Ext.save();
                            }
                        }, '->', {

                            text: " ทักท้วง/ส่งคืนเอกสาร ❌ ",
                            icon: "../images/icons/table_save.png", hideOnClick: true,
                            handler: function () {
                                Ext.saveOption();
                            }
                        }, '-', '-'
                    ], ///
                    html: iframeHtml('./app/list_pdf.php?__dc=' + Math.random() + '&path=' + urlPath)
                });
                // แสดงแท็บที่เพิ่มขึ้นมา
                tabPanel.setActiveTab(tabId);
            } else {
                existingTab.destroy();
                tabPanel.add({
                    id: tabId,
                    title: 'เอกสาร PDF ',
                    iconCls: 'icon-pdf', // ใช้ไอคอนตามต้องการ
                    closable: false,
                    layout: 'fit',
                    html: iframeHtml('list_pdf.php?__dc=' + Math.random() + '&path=' + urlPath)
                });
                // แสดงแท็บที่เพิ่มขึ้นมา
                tabPanel.setActiveTab(tabId);
            }
        } else {
            console.error('tabMainID not found!');
        }
//        alert(Ext.getCmp('urlID').getValue());
        function openPrwTab() {
            var tabPanel = Ext.getCmp('contenterCenter');
            if (!tabPanel)
                return;
            var tabId = 'tab-prw';
            var existing = tabPanel.getComponent(tabId);
            if (existing) {
                tabPanel.setActiveTab(existing);
            } else {
                tabPanel.add({
                    id: tabId,
                    title: 'PREVIEW Document PDF Setting',
                    iconCls: 'icon-pdf',
                    closable: true,
                    html: iframeHtml('list_pdf.php?__dc=' + Math.random() + '&path=' +urlPath)
                }).show();
            }
        }
        return openPrwTab();
    };



    function cellClick(grid, rowIndex, columnIndex, e)
    {
        var rec = grid.getStore().getAt(rowIndex);

        // controllTab(rec, rec.get('sp_approval_hdr_id')>0?'EDIT':'ADD'); //on

    }
    function controllTab(rec, evnt) {
 
        rec.set("nextUserId", rec.get('nextUserId') + ',1');

        if (!Ext.isEmpty(Ext.getCmp("frm-Add")))
            Ext.getCmp("contenterCenter").remove(Ext.getCmp("frm-Add"), true) || {};

        if (evnt == "ADD") {
//            Ext.getCmp("tabpanel1").getSelectionModel().clearSelections();
        } else if (evnt == "ADDTAB") {

            Ext.genTabAuditDoc(rec.data.url);
        }

        Ext.recMain = rec;
        Ext.butt = evnt;
         
        Ext.c_comment_backID = null;

        Promise.all([])
                .then(() => {
                    Ext.getCmp("contenterCenter").getEl().mask("Please wait...", "x-mask-loading");
                })
                .then(() => {
                    return StoreLoadWithPromise(Ext.sp_status_document_items, {sp_approval_hdr_id: rec.get('sp_approval_hdr_id')});
                })
                .then(() => {
   
                    Ext.rec = rec;
                    Ext.globValue = Ext.apply({
                            pr_code: Ext.rec.get("pr_code"),
                            c_name: Ext.rec.get("c_name"),
                            sp_tor_id: Ext.rec.get("sp_tor_id"),
                            tor_type_id: Ext.rec.get("tor_type_id") 
                        });
                        console.log(Ext.globValue);
Ext.comboReturn = new Ext.form.ComboBox({
    fieldLabel: 'ส่งกลับให้',
    id: 'user_next_return_id',
    name: 'user_next_return_id',
    valueField: 'id',
    displayField: 'name',
    mode: 'local',
    triggerAction: 'all',
    width: 200,
    hidden: true, 
    store: new Ext.data.JsonStore({
        url: 'api/List_items.php',
        root: 'data',
        totalProperty: 'total',
        autoLoad:true,
        autoDestroy:false,
        fields: ['id', 'name'],
        baseParams: {
            type: 'sp_signin_return',
            sp_tor_id: Ext.recMain.get('sp_tor_id'),
            document_id: Ext.recMain.get('document_id'),
            i_audit: Ext.recMain.get('i_audit') || 0,
            i_status: Ext.recMain.get('i_status') || 0
        }
    }), 
    listeners: {
        select: function (combo, record) {
            console.log('selected:', record.data);
        }
    }
});

// load + callback
Ext.comboReturn.getStore().load({
    callback: function (records, op, success) {
        if (success && records.length > 0) {
            Ext.comboReturn.setValue(0
              //  Ext.recMain.get('doc_next_user_id') 
            );
        }
    }
});

 
                    return new Promise((resolve, reject) => {
                        if (!Ext.isEmpty(Ext.getCmp('frm-Add')))
                            Ext.getCmp('frm-Add').destroy();

                        let frmAdd = new formAdd(rec);
                        Ext.getCmp("contenterCenter").add(frmAdd);
                        Ext.getCmp("contenterCenter").setActiveTab(frmAdd);
                        Ext.getCmp("role-form-mode").setValue("SIGNDIGIT");
                        Ext.getCmp("form-widgets").getForm().loadRecord(rec);
                        Ext.getCmp("form-widgets").doLayout();
                        resolve();
                    });
                }).then(() => {
            if (!Ext.isEmpty(Ext.getCmp('frm-Add')))
                Ext.getCmp('frm-Add').destroy();

            let frmAdd = new formAdd(rec);
            Ext.getCmp("contenterCenter").add(frmAdd);
            Ext.getCmp("contenterCenter").setActiveTab(frmAdd);
            Ext.getCmp("role-form-mode").setValue("SIGNDIGIT");
            Ext.getCmp("form-widgets").getForm().loadRecord(rec);
            Ext.getCmp("form-widgets").doLayout();

            return Ext.genTabAuditDoc(rec.data.url);
        }).catch((error) => {
            console.error(error);
        })
                .finally(() => {
                    Ext.getCmp("contenterCenter").getEl().unmask();
                });
    }
};
// controllTab

//OnLoad Renderer App
Ext.onReady(function () {
    Ext.QuickTips.init();
    if (typeof user_right_add === 'undefined' || user_right_add === null) {
        window.top.location.href = '../access/logout.php'; // หรือ URL อื่นที่ต้องการ
        return false;
    }
    Ext.user_right_add = user_right_add;
    Ext.user_right_edit = user_right_edit;
    Ext.user_right_delete = user_right_delete;
    Ext.title = 'บันทึกรายการลงนาม';
    Ext.menu_name = Ext.title;
    Ext.c_comment_backID = null;
    Ext.sp_step_id = null;
    Ext.signImg = null;
    Ext.AppUx("SP", Ext.menu_code); //app & show menu
    var App = new Ext.Viewport({
        layout: "border",
        items: new Ext.TabPanel({
            region: "center",
            border: false,
            id: "contenterCenter",
            defaults: {
                autoScroll: true,
                layout: 'fit'
            },
            items: [new gridMain()],
            listeners: {
                afterrender: function () {
                    fnLoad = () => {

                        Ext.getCmp("contenterCenter").setActiveTab("tabpanel1");
                        Ext.Ajax.request({
                            url: './app/conf/config.json',
                            method: 'GET',
                            success: function (response) { 
                                Ext.config = Ext.decode(response.responseText);
                                Ext.menu_code = Ext.config.status_step_document[1].c_code; // {APSTEP11,APSTEP21}
                                Ext.store.setBaseParam("type", Ext.status_sigature_document);
                                Ext.store.reload();
                                Ext.getCmp("contenterCenter").getEl().unmask(); 
                            },
                            failure: function (response) {
                                Ext.Msg.alert('Error', 'Failed to load config.json');
                                Ext.getCmp("contenterCenter").getEl().unmask();
                            }
                        });
                    };
                    fnLoad();
                    Ext.store.setBaseParam("type", Ext.status_sigature_document);
                    Ext.store.reload();
                    Ext.getCmp("contenterCenter").setActiveTab("tabpanel1");

                }
            }

        }),
    });
});