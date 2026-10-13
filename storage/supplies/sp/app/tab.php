<?php
include("../../conf/config.php");

//print_r($_SESSION);
//exit();
?>
<!DOCTYPE html>
<html lang="th">
    <head>
        <meta charset="utf-8" />
        <title>Bookmarks – ExtJS 3.4 TreeGrid (Maximgb) CRUD</title>

        <!-- ExtJS 3.4 -->
        <link href="../../js/ext-3.4.0/resources/css/ext-all.css" rel="stylesheet" type="text/css"/>
        <script src="js/extjs3.4.1-1/ext-base.js" type="text/javascript"></script>
        <script src="js/extjs3.4.1-1/ext-all.js" type="text/javascript"></script>

        <!-- Maximgb TreeGrid (ไม่จำเป็นต่อแท็บ แต่คงไว้ตามสโคปเดิม) -->
        <link rel="stylesheet" href="./css/maximgb-treegrid.css" />
        <script src="../../js/TreeGrid/TreeGrid.js"></script>
        <link href="../../css/icon_all.css" rel="stylesheet" type="text/css"/>
        <style>
            html, body {
                height:100%;
            }
            body{
                margin:0px
            }
            .hit{
                animation:hitpulse 1s ease-in-out 0s 2;
                background:#fffae6!important
            }
            @keyframes hitpulse{
                0%{
                    background:#fff3b0
                }
                50%{
                    background:#fff
                }
                100%{
                    background:#fff3b0
                }
            }
            .badge-1,.badge-2,.badge-3,.badge-4{
                padding:2px 6px;
                border-radius:10px;
                border:1px solid
            }
            .badge-1{
                background:#f5f5f5;
                color:#555;
                border-color:#ddd
            }
            .badge-2{
                background:#fff7e6;
                color:#a35d00;
                border-color:#ffd59c
            }
            .badge-3{
                background:#e8ffe8;
                color:#2b8a3e;
                border-color:#bfe8bf
            }
            .badge-4{
                background:#c00;
                color:#fff;
                border-color:#bfe8bf
            }
            a.clear-dt{
                color:#c00;
                text-decoration:underline
            }

            /* ให้ iframe กินเต็มพื้นที่แท็บ */
            .tab-iframe {
                width:100%;
                height:100%;
                border:0;
            }
            /* ทำให้ TabPanel สูงเต็มหน้าจอ (เมื่อไม่ใช้ Viewport) */
            #tabs-wrap, #tabs-panel {
                height: calc(100vh - 24px);
            }
        </style>
    </head>
    <body>
        <div id="tabs-wrap"></div>

        <script>
            Ext.BLANK_IMAGE_URL = '../../js/ext-3.4.0/resources/images/default/s.gif';
            Ext.PATH_DOCUMENTS = '<?php echo PATH_DOCUMENTS; ?>';
            // ====== ตั้งค่า URL ปลายทางของแต่ละแท็บ (แก้ไขได้ตามระบบจริง) ======
            var PR_URL = '../CheckList.php';    // ตัวอย่าง: หน้า PR
            var TOR_TYPE = './mnBookmarkTemplate.php';    // ตัวอย่าง: หน้า PR
            var SIGN_URL = './mnBookmark.php';              // ตัวอย่าง: หน้าลงนามเอกสาร
            var AUDITOR_URL = './mnBookmarkAllStatus.php';              // ตัวอย่าง: หน้าผู้ตรวจสอบ

            // ยูทิลช่วยสร้าง iframe ภายในแท็บ
            function iframeHtml(url) {
                return '<iframe class="tab-iframe" src="' + url + '" loading="lazy"></iframe>';
            }

            // ดึง iframe ของแท็บปัจจุบัน
            function getTabIframe(tab) {
                if (!tab)
                    return null;
                var el = tab.body ? tab.body.dom : tab.getEl().dom;
                return el ? el.querySelector('iframe.tab-iframe') : null;
            }
// โหลดจำนวนและรายการแจ้งเตือน
            function loadNotif(cb) {
                Ext.Ajax.request({
                    url: './store/configSignType.json',
                    method: 'GET',
                    params: {mode: 'LIST'}, // ใช้ LIST เพื่อเอาข้อมูลเต็ม
                    success: function (resp) {
                        var cnt = 0, list = [];
                        try {
                            var obj = Ext.decode(resp.responseText);
                            cnt = (obj && obj.count) | 0;
                            list = (obj && obj.data) ? obj.data : [];
                        } catch (e) {
                        }
                        if (typeof cb === 'function') {
                            cb(cnt, list);
                        }
                    },
                    failure: function () {
                        if (typeof cb === 'function') {
                            cb(0, []);
                        }
                    }
                });
            }

            Ext.onReady(function () {
                Ext.QuickTips.init();
                Ext.tabSettingSign = function () {
                    loadNotif(function (cnt, list) {

                        // ช่วยสร้าง GridPanel
                        function createGrid(rows) {
                            var store = new Ext.data.JsonStore({
                                data: {rows: rows || []},
                                root: 'rows',
                                fields: ['title', 'time', 'desc', 'id', 'status']
                            });
                            return new Ext.grid.GridPanel({
                                store: store,
                                stripeRows: true,
                                autoExpandColumn: 'colTitle',
                                columns: [
                                    new Ext.grid.RowNumberer(),
                                    {id: 'colTitle', header: 'หัวข้อ', dataIndex: 'title'},
                                    {header: 'เวลา', width: 140, dataIndex: 'time'},
                                    {header: 'สถานะ', width: 160, dataIndex: 'status'}
                                ]
                            });
                        }

                        // === Dynamic Tabs ===
                        var tabsArr = [];

                        // แยกตาม status
                        var statusMap = {};
                        (list || []).forEach(function (rec) {
                            if (!statusMap[rec.status])
                                statusMap[rec.status] = [];
                            statusMap[rec.status].push(rec);
                        });

                        // สร้าง tab ตาม status
                        Ext.iterate(statusMap, function (status, rows) {
                            tabsArr.push({
                                title: status,
                                layout: 'fit',
                                items: createGrid(rows)
                            });
                        });

                        // *** ใส่แท็บ "ทั้งหมด" ไว้ท้ายสุด ***
                        tabsArr.push({
                            title: 'ทั้งหมด',
                            layout: 'fit',
                            items: createGrid(list)
                        });
                        // แสดง window
                        new Ext.Window({
                            title: 'รายการแจ้งเตือน (' + cnt + ')',
                            width: 750,
                            height: 450,
                            layout: 'fit',
                            modal: true,
                            border: false,
                            items: new Ext.TabPanel({
                                border: false,
                                activeTab: 0, // ค่าเริ่มต้นยังคงเป็นแท็บแรก (status แรก)
                                items: tabsArr
                            }),
                            bbar: ['->', {
                                    text: 'ปิด',
                                    handler: function (btn) {
                                        btn.ownerCt.ownerCt.close();
                                    }
                                }]
                        }).show();

                    });
                };
                // ปุ่มรีเฟรช iframe ของแท็บที่เลือกอยู่
                var refreshBtn = new Ext.Button({
                    text: 'รีเฟรชแท็บ',
                    id: 'refresh-parentID',
                    iconCls: 'x-tbar-loading',
                    handler: function () {
                        var active = tabs.getActiveTab();
                        var ifr = getTabIframe(active);
                        if (ifr) {
                            // รีโหลดแบบไม่เปลี่ยนค่า src (คง query string ไว้)
                            try {
                                ifr.contentWindow.location.reload();
                            } catch (e) {
                                ifr.src = ifr.src;
                            }
                        }
                    }
                });
                Ext.spTypeStatusStore = new Ext.data.ArrayStore({
                    fields: ['value', 'text'],
                    data: [
                        [1, 'เฉพาะเจาะจง'],
                        [2, 'e-market'],
                        [3, 'คัดเลือก'],
                        [4, 'e-bidding']
                    ]
                });

                Ext.getText = function (store, val) {
                    var result = '';
                    (store.data.items || []).forEach(function (rec) {
                        if (rec.get('value') == val) {
                            result = rec.get('text').toUpperCase();
                        }
                    });
                    return "[" + result + "]";
                };
                // ปุ่มเปิดในหน้าต่างใหม่
                var popoutBtn = new Ext.Button({
                    text: 'เปิดหน้าต่างใหม่',
                    handler: function () {
                        var active = tabs.getActiveTab();
                        var ifr = getTabIframe(active);
                        if (ifr && ifr.src) {
                            window.open(ifr.src, '_blank');
                        }
                    }
                });
                // === helper: POST แบบ promise
                function postJSON(url, params) {
                    return new Promise(function (resolve, reject) {
                        Ext.Ajax.request({
                            url: url,
                            method: 'POST',
                            params: params || {},
                            success: function (resp) {
                                try {
                                    var obj = Ext.decode(resp.responseText);
                                    resolve(obj);
                                } catch (e) {
                                    reject(e);
                                }
                            },
                            failure: function (resp) {
                                reject(new Error('HTTP ' + resp.status));
                            }
                        });
                    });
                }

                /**
                 * check(pr_code, tor_type_id)
                 * - เรียกไปที่ PHP เพื่อตรวจสอบ/สร้างโฟลเดอร์และ tabjson1/2/3
                 * - คืน Promise ที่ resolve เป็นรายละเอียดไฟล์
                 */

                Ext.globValue = null; 
                Ext.processTab = function () {
                    function check(pr_code, tor_type_id) {
                        return postJSON('./tab_init.php', {
                            pr_code: pr_code,
                            tor_type_id: tor_type_id
                        });
                    }
                    if (!Ext.globValue || !Ext.globValue.pr_code || !Ext.globValue.tor_type_id) {
                        Ext.Msg.alert('ข้อมูลไม่ครบ', 'กรุณาเลือกรายการ PR/วิธีดำเนินการให้ครบก่อน');
                        return;
                    }

                    var pr = Ext.globValue.pr_code;
                    var tor = Ext.globValue.tor_type_id;
              

                    Ext.getCmp('tbSettingID').setText('ตั้งค่าการลงนามเอกสาร ' + pr);

                    // เรียกตรวจสอบ/สร้างไฟล์
                    Ext.getBody().mask('กำลังตรวจสอบไฟล์...', 'x-mask-loading');
                    check(pr, tor).then(function (res) {
                        Ext.getBody().unmask();
                        if (!res || !res.ok) {
                            Ext.Msg.alert('ผิดพลาด', (res && res.message) ? res.message : 'ไม่สามารถตรวจสอบไฟล์ได้');
                            return;
                        }

                        // ตั้งชื่อไฟล์ตามรูปแบบ
                        var tbjson1 = 'tabjson1_' + pr + '_' + tor + '.json';
                        var tbjson2 = 'tabjson2_' + pr + '_' + tor + '.json';
                        var tbjson3 = 'tabjson3_' + pr + '_' + tor + '.json';

                        // (ถ้าต้องการ) เก็บเป็น global เพื่อแท็บอื่นนำไปใช้ต่อ
                        Ext.tabJsonInfo = {
                            dir: res.dir, // absolute directory on server
                            ad_year: res.ad_year,
                            pr_code: pr,
                            tor_type_id: tor,
                            tbjson1: tbjson1,
                            tbjson2: tbjson2,
                            tbjson3: tbjson3,
                            files: res.files      // รายละเอียดไฟล์ที่ PHP ส่งกลับ
                        };

                        // ตัวอย่าง log แสดงว่ามีการสร้างไฟล์ใหม่หรือมีอยู่แล้ว
                        try {
//                            console.log('tabjson1:', res.files.tbjson1);
//                            console.log('tabjson2:', res.files.tbjson2);
//                            console.log('tabjson3:', res.files.tbjson3);
                        } catch (e) {
                        }

                        // TODO: ถ้าคุณต้อง “โหลด” ไฟล์เหล่านี้เข้าแท็บอื่น ๆ ก็ทำต่อจากนี้ได้เลย
                        // เช่น genTab1(pr, tbjson1) / genTab2(pr, tbjson2) / genTab3(pr, tbjson3)
                        // โดยฝั่ง PHP endpoint สำหรับโหลด/บันทึกควรชี้ไปยังไฟล์ใน res.dir

                        Ext.Msg.show({
                            title: 'เสร็จสิ้น',
                            msg: 'ตรวจสอบไฟล์สำเร็จ ' +
                                    '<br>โฟลเดอร์: <b>' + Ext.util.Format.htmlEncode(res.dir) + '</b>' +
                                    '<br>ไฟล์: ' + [tbjson1, tbjson2, tbjson3].join(', '),
                            buttons: Ext.Msg.OK,
                            icon: Ext.Msg.INFO
                        });
                    }).catch(function (err) {
                        Ext.getBody().unmask();
                        Ext.Msg.alert('ผิดพลาด', 'เชื่อมต่อเซิร์ฟเวอร์ไม่สำเร็จ: ' + err.message);
                    });
                };
                // ====== สร้าง TabPanel ======
                var tabs = new Ext.TabPanel({
                    id: 'tabs-panel-sign',
                    activeTab: 0,
                    enableTabScroll: true,
                    border: true,
                    defaults: {layout: 'fit', autoScroll: false, border: false},
//                    tbar: [refreshBtn, '-', popoutBtn, '->', {xtype: 'tbtext', text: 'PR / TOR TYPE / Sign / Auditor'}],
                    tbar: [refreshBtn, {xtype: 'button', id: 'tbSettingID', text: 'ตั้งค่าการลงนามเอกสาร ', handler: function () {
                                Ext.tabSettingSign && Ext.tabSettingSign();
                            }}, '->', {xtype: 'tbtext', text: 'รายการ PR / วิธีดำเนินการ /ตรวจสอบเอกสาร/ ลงนามเอกสาร '}],
                    items: [
                        {
                            title: 'รายการ PR',
                            id: 'tab-pr',
                            html: iframeHtml(PR_URL),
                            iconCls: 'icon-pr'
                        },
                        {
                            title: 'ชุดเอกสาร/วิธีการดำเนินงาน',
                            id: 'tab-template',
                            html: iframeHtml(TOR_TYPE),
                            iconCls: 'icon-audit'

                        },
                        {
                            title: 'ตรวจสอบเอกสาร Auditor',
                            id: 'tab-auditor',
                            html: iframeHtml(AUDITOR_URL),
                            iconCls: 'icon-audit'
                        },
                        {
                            title: 'ลงนามเอกสาร Sign',
                            id: 'tab-sign',
                            html: iframeHtml(SIGN_URL),
                            iconCls: 'icon-sign'
                        }
                    ],
                    listeners: {
                        tabchange: function (tp, newTab) {
                            // ถ้าอยาก reload iframe ตอนสลับ tab
                            var ifr = getTabIframe(newTab);
                            if (ifr) {
                                try {
                                    ifr.contentWindow.location.reload();
                                } catch (e) {
                                    ifr.src = ifr.src;
                                }
                            }
                        }
                    }
                });

// ====== Viewport เต็มจอ ======
                var App = new Ext.Viewport({
                    layout: "fit", // fit layout = ขยายเต็ม
                    items: [tabs]
                });

// set tab แรกให้ active
                tabs.setActiveTab('tab-pr');

            });

        </script>
    </body>
</html>
