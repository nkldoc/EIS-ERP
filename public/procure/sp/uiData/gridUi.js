//Ext.reg('triggerEdit', Ext.form.TriggerField); from configStoreUi.js
Ext.leftSearch = function (tb) {
 
    return [tb, '->',
        new Ext.form.TwinTriggerField({
            xtype: 'triggerEdit',
            trigger1Class: 'x-form-clear-trigger',
            trigger2Class: 'x-form-search-trigger',
            width: 400,
            id: "leftSearchID",
            emptyText: 'ค้นหา',
            onClick: function () {
                var position = Ext.get('leftSearchID').getXY();


                if (Ext.isEmpty(Ext.getCmp("leftSearchAutoCompleteID")))
                {
                    var msgSearch = "<img src='../images/contextMenu.jpg'>";
                    var wind = new Ext.Window({
                        id: "leftSearchAutoCompleteID",
//                        iconCls: "icon-application-view-list",
                        modal: false,
                        collapsible: false,
                        closable: false,
                        border: false,
                        resizable: false,
                        layout: 'fit',
                        width: 386,
                        x: position[0],
                        y: position[1] + 20,
                        items: [{
                                xtype: 'panel',
//                                id: 'resSearchID', 
                                html: "<div onClick='Ext.focus();' style='white-space: nowrap;backgroud:gray !important; ;width:100%; height:300px; border:2px !important; '>" + msgSearch + "</div>",
                                listeners: {
                                    beforerender: function () {
                                        wind.on("click", function (e) {
                                            Ext.nofocus();
                                        }, this);
                                        wind.on("blure", function (e) {
                                            Ext.nofocus();
                                        }, this);
                                        Ext.focus = function () {
                                            console.log('focus');
                                        };
                                        Ext.nofocus = function () {
                                            console.log('nofocus');
                                        };

                                    },
                                    afterrender: function () {
                                    }
                                }
                            }],

                    });

//                    if (!Ext.isEmpty(Ext.getCmp("winSearchFrm")))
//                        Ext.getCmp("winSearchFrm").destroy();
//                    var s1 = Ext.SearchFrm();
//
//                    s1.show();

                    //  wind.show();
                }

            },
            onTrigger1Click: function () {
                this.setValue(null);
                Ext.getCmp('leftSearchAutoCompleteID').destroy();

            },
            onTrigger2Click: function () {
                var store = Ext.getCmp('tabpanel1').getStore(); //id: "tabpanel1",
                store.setBaseParam("value", this.getValue());
                store.setBaseParam("act", "SEARCH");
                store.reload({
                    callback: function (record, operation, success)
                    {
                        if (success)
                        {

                        }
                    }
                });
            },
        })];
};

Ext.copyToClipboard = (str) => {
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
};
Ext.contextMenu = function () {
    var headerGroup = [{
            text: "Alt+n จัดการข้อมูลในฟอร์ม",
            icon: "../images/icons/application_edit.png",
            handler: function (e) {
                Ext.buAct = "update";
                Ext.loadStore("edit", true); // app,data.load
            },
            scope: this,
        }, {
            text: "Cltr+f ค้นหา ",
            icon: "../images/icons/application_form_magnify.png",
            handler: function (e) {
                if (!Ext.isEmpty(Ext.getCmp("winSearchFrm")))
                    Ext.getCmp("winSearchFrm").destroy();
                var s1 = Ext.SearchFrm();
                s1.show();
            }
        }, {
            text: "Cltr+C คัดลอก grid cell ",
            icon: "../images/icons/page_copy.png",
            handler: function (e) {
                Ext.copyRowSel();
            }
        }, {
            text: "Cltr+v Text Document ",
            icon: "../images/icons/page_copy.png",
            handler: function (e) {
                if (Ext.isEmpty(window.parent.Ext.getCmp('winMsgID')))
                    window.parent.Ext.textEditor();
                else {
                    Ext.MessageBox.alert("Failed", "<span style='white-space: nowrap;'>การเปิดอยู่ในรูปแบบไม่สมบูรณ์</span>");
                }


            }
        }, {
            text: "ตรวจสอบเอกสาร",
            icon: "../images/icons/icon_pdf.png",
            handler: function (e) {
                Ext.buAct = "FlowcartLv1";
                Ext.linkDownload = window.location.protocol + '//' + window.location.hostname + '/sp_mn/api/upload_ap/';
                if (Ext.isEmpty(Ext.selectRow))
                    Ext.MessageBox.alert("แจ้งเตือน", "กรุณากดเลือกข้อมูลที่จะแสดง/ออกเลข PR ก่อน");
                window.open(Ext.linkDownload + Ext.selectRow.get('upload_name') + '?T=Tap_' + Math.floor(Math.random() * 100000), 'Monitoring', 'fullscreen="yes"');
            }, scope: this}];


    this.contextMenu = new Ext.menu.Menu({
        items: headerGroup,
    });
};
Ext.hotKeyGrid = function () {
    //global Ext.colmnn,Ext.selectRow
    new Ext.KeyMap(Ext.getBody(), [{
            key: "f",
            ctrl: true,
            fn: function (e, ele) {
                ele.preventDefault();
                if (!Ext.isEmpty(Ext.getCmp("winSearchFrm")))
                    Ext.getCmp("winSearchFrm").destroy();
                var s1 = Ext.SearchFrm();
                s1.show();
            }
        }]);
    var clrC = new Ext.KeyMap(Ext.getBody(), [{
            key: "c",
            ctrl: true,
            fn: function (e, ele) {
                ele.preventDefault();
                Ext.copyRowSel();
            }
        }]);
    new Ext.KeyMap(Ext.getBody(), [{
            key: "v",
            ctrl: true,
            fn: function (e, ele) {
                ele.preventDefault();
                window.parent.Ext.textEditor();

            }
        }]);
    new Ext.KeyMap(Ext.getBody(), [{
            key: "n",
            alt: true,
            fn: function (e, ele) {
                ele.preventDefault();
                Ext.formPanelMain(Ext.selectObj());
            }
        }]);
};
Ext.copyRowSel = function () {
    //global Ext.colmnn,Ext.selectRow
    var arrDataCopy = Ext.colmnn;
    var rowx = Ext.selectRow;
    if (!Ext.isEmpty(rowx) && !Ext.isEmpty(arrDataCopy))
        Ext.CopyToClipboard(rowx, arrDataCopy);
};