Ext.onReady(function () {

  Ext.QuickTips.init();
  var bi_report = Ext.get("work-bi-win-shortcut");
  // var bi = Ext.get('work-bi-win-shortcut');
  var processmonth = Ext.get("work-process-month-win-shortcut");
  var reportsmonth = Ext.get("work-reports-month-win-shortcut");
  var reportsyear = Ext.get("work-reports-year-win-shortcut");

  var rightlogo = Ext.get("right-logo-win-shortcut");
  var readme = Ext.get("work-readme-win-shortcut");
  var desktop = Ext.get("x-desktop");
  //-----------------------------------------

  //-----------------------------------------
  function WinDash1(id, txt, items, w, h, x, y, icon) {
    var iconCsl = icon ? icon : "icon-graph";
    return new Ext.Window({
      collapsible: true,
      maximizable: true,
      title: txt,
      iconCls: iconCsl,
      id: id,
      width: w,
      height: h,
      layout: "fit",
      modal: false,
      plain: true,
      initCenter: false,
      x: x,
      y: y,
      items: items,
      listeners: {
        beforrender: function () {},
        afterrender: function () {
          Ext.getCmp(id).getEl().mask("Please wait...", "x-mask-loading");
          var tt = 0;
          switch (id) {
            case "reportsmonthFrmID":
              tt = 0;
              break;
            case "win-1":
              tt = 0;
              break;
            case "win-2":
              tt = 1000;
              break;
            case "win-3":
              tt = 1500;
              break;
          }
          setTimeout(function () {
            Ext.getCmp(id).getEl().unmask();
          }, tt);
        },
      },
    });
  }

  readme.on("click", function (e) {
    //window.open('../alert/period.php?_dc=' + Math.floor(Math.random() * 1000000000), 'Monitoring', 'fullscreen="yes"');
  });

  rightlogo.on("click", function (e) {
    Ext.MessageBox.show({
      title: "Address",
      msg: "Please enter your address:",
      width: 300,
      buttons: Ext.MessageBox.OKCANCEL,
      multiline: true,
      fn: function (buttons) {
        if (buttons) alert(buttons + " == ");
        console.log(this);
      },
      animEl: "right-logo-win-shortcut",
    });
  });

  //-----------------------------------------reports/Rep_RepBgProType2_1.php
  //    Ext.getCmp("dis1ID").update('<iframe src="/reports/Rep_RepBgProType2_1.php" frameborder="0" width="100%" height="100%"></iframe>');

  var item1 = { xtype: "displayfield", id: "dis1ID", html: '<iframe src="./reports/Rep_RepBgProType2_1.php" frameborder="0" width="100%" height="100%"></iframe>' };
  var item2 = { xtype: "displayfield", html: '<div id="html2" style="width:100%; text-align: center; font-size:28"> 2 </div>' };
  var item3 = { xtype: "displayfield", html: '<div id="html3" style="width:100%; text-align: center; font-size:28"> 3 </div>' };

  // bi.on(
  //   "click",
  //   function () {
  //     if (!Ext.get("win-1")) var wn1 = WinDash1("win-1", "Pie ซื้อครุภัณฑ์ประจำเดือน", item1, 800, 400, 95, 32).show();
  //     else Ext.getCmp("win-1").destroy();
  //     if (!Ext.get("win-2")) var wn2 = WinDash1("win-2", "กราฟ2", item2, 400, 400, 915, 32).show();
  //     else Ext.getCmp("win-2").destroy();
  //     if (!Ext.get("win-3")) var wn2 = WinDash1("win-3", "กราฟ3", item3, 400, 400, 915, 432).show();
  //     else Ext.getCmp("win-3").destroy();
  //   },
  //   this
  // );
  processmonth.on(
    "click",
    function () {
      var dt = new Date();
      var items = [
        new Ext.FormPanel({
          id: "reportsmonthFrmID",
          columnWidth: 1,
          url: "api/?",
          frame: true,
          labelAlign: "left",
          bodyStyle: "padding:1px",
          labelWidth: 120,
          items: [
            {
              xtype: "textfield",
              fieldLabel: "วันที่",
              readOnly: true,
              value: new Date().add("Y", 543).dateFormat("d-m-Y"),
              name: "d_update_dt",
            },
            {
              xtype: "textfield",
              readOnly: true,
              fieldLabel: "เดือนที่ประมวลผล",
              value: new Date().add("Y", 543).dateFormat("m-Y"),
              name: "yyyymm",
            },
            {
              xtype: "component",
              autoEl: {
                tag: "blockquote",
                html: "การประมวลผลประจำเดือน",
              },
            },
            {
              xtype: "container",
              autoEl: "ul",
              cls: "ux-unordered-list",
              items: [
                {
                  xtype: "component",
                  autoEl: "li",
                  html: "เพื่อสรุปข้อมูลประจำเดือน",
                },
                {
                  xtype: "component",
                  autoEl: "li",
                  html: "และเรียกข้อมูลล่าสุดของเดือนนี้",
                },
              ],
            },
          ],
          buttonAlign: "center",
          buttons: [
            {
              text: "ประมวลผลระบบพัสดุซื้อ/จ้าง",
              icon: "./../images/icons/cog_start.png",
              handler: function () {
                Ext.getCmp("win-1-report").getEl().mask("กำลังประมวลผล โปรดรอ...", "x-mask-loading");
                Ext.Ajax.request({
                  url: "api/processMnMonthly.php",
                  method: "POST",
                  params: {
                    mode: "BIPROCESSMONTHLY",
                    id: 0,
                    bg_type_id: 0,
                  },
                  success: function (result, request) {
                    var jsonData = Ext.util.JSON.decode(result.responseText); //decode json
                    //                                                console.log(jsonData.yyymm);
                    Ext.Msg.alert("แจ้งเตือน", " บันทึกเรียบร้อย " + jsonData.yyymm);
                    Ext.getCmp("win-1-report").destroy();
                  },
                });
              },
            },
          ],
        }),
      ];
      console.log(items);
      if (!Ext.get("win-1-report")) var wn1 = WinDash1("win-1-report", "รายงานประจำเดือน", items, 700, 400, 30, 300, "icon-start").show();
      else Ext.getCmp("win-1-report").destroy();
      wn1.show();
    },
    this
  );
  var biMenu = function (e) {
    e.stopEvent();
    new Ext.menu.Menu({
      items: [
        {
          text: "รายงานพัสดุซื้อจ้างประจำเดือนตาม PR",
          icon: "../images/icons/report.png",
          handler: function (e) {
            window.open("./RepBiPrMonthly.php?_dc=" + Math.floor(Math.random() * 1000000000));
          },
          scope: this,
        },
        {
          text: "รายงานซื้อครุภัณฑ์ประจำเดือนตามแหล่งเงิน",
          icon: "../images/icons/report.png",
          handler: function (e) {
            window.open("./RepBgPrMonthly.php?_dc=" + Math.floor(Math.random() * 1000000000));
          },
          scope: this,
        },
        {
          text: "รายงานพัสดุ",
          hidden:true,
          handler: function () {
            const form = createAssetReportForm({
              id: "assetForm1",
              buttonText: "แสดงรายงานพัสดุ",
              onSubmit: function () {
                const f = Ext.getCmp("assetForm1").getForm();
                if (f.isValid()) {
                  const vals = f.getValues();
                  window.open(`./Rep_AssetReport.php?type=${vals.asset_type}&date=${vals.d_update_dt}`);
                }
              },
            });
            WinDash1("win-asset-form", "รายงานพัสดุ", [form], 700, 300, 100, 200).show();
          },
        },
      ],
    }).showAt(e.getXY());
  };
  var birepor = function (e) {
    e.stopEvent();
    window.open("./reports/Rep_RepBIPrType.php?_dc=" + Math.floor(Math.random() * 1000000000));

    // new Ext.menu.Menu({
    //     items: [
    //         {
    //             text: "รายงานพัสดุซื้อจ้างประจำเดือนตาม PR",
    //             icon: "../images/icons/report.png",
    //             handler: function (e) {
    //                 window.open('./RepBiPrMonthly.php?_dc=' + Math.floor(Math.random() * 1000000000));
    //             },
    //             scope: this,
    //         }, {
    //             text: "รายงานซื้อครุภัณฑ์ประจำเดือนตามแหล่งเงิน",
    //             icon: "../images/icons/report.png",
    //             handler: function (e) {
    //                  window.open('./RepBgPrMonthly.php?_dc=' + Math.floor(Math.random() * 1000000000));
    //             },
    //             scope: this,
    //         }],
    // }).showAt(e.getXY());
  };
  var biMenuYear = function (e) {
    e.stopEvent();
    new Ext.menu.Menu({
      items: [
        {
          text: "รายงานเปรียบเทียบ PR",
          icon: "../images/icons/book_magnify.png",
          handler: function (e) {
            //                        window.open('./RepBICutAnalysisPeriod.php?_dc=' + Math.floor(Math.random() * 1000000000));
          },
          scope: this,
        },
      ],
    }).showAt(e.getXY());
  };

  reportsmonth.on("contextmenu", biMenu, this);
  reportsmonth.on("click", biMenu, this);

  bi_report.on("contextmenu", birepor, this);
  bi_report.on("click", birepor, this);

  reportsyear.on("contextmenu", biMenuYear, this);
  reportsyear.on("click", biMenuYear, this);
// bi_report
  /*
    bi.on("contextmenu", function (e) {
        e.stopEvent();
        new Ext.menu.Menu({
            items: [
                {
                    text: "รายการสถานะของ PR",
                    icon: "../images/icons/book_magnify.png",
                    handler: function (e) {
                        window.open('../alert/index.php', 'Monitoring', 'fullscreen="yes"');
                    },
                    scope: this,
                }, {
                    text: "รายการสถานะ PO / งวด/รับของ/วางบิง/ตรวจรับ/เบิก",
                    icon: "../images/icons/book_magnify.png",
                    handler: function (e) {
                        window.open('../alert/period.php?_dc=' + Math.floor(Math.random() * 1000000000), 'Monitoring', 'fullscreen="yes"');
                    },
                    scope: this,

                }
            ],
        }).showAt(e.getXY());
    }, this);*/

  destopfn = function (e) {
    e.stopEvent();
    new Ext.menu.Menu({
      items: [
        {
          text: "Properties",
          disabled: true,
        },
        {
          text: "โหลดหน้าใหม่",
          icon: "../images/icons/page_white_refresh.png",
          handler: function (e) {
            window.location.reload();
          },
          scope: this,
        },
      ],
    }).showAt(e.getXY());
  };
  desktop.on("contextmenu", destopfn, this);
});
