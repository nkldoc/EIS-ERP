Ext.onReady(function () {
  Ext.QuickTips.init();

  /* =============================================== */
  title_panel = "รายงานสินทรัพย์ตัดจำหน่ายแต่ละประเภท";
  /* =============================================== */

  // storeYear
  var years = [];
  var currentTime = new Date();
  var now = currentTime.getFullYear() + 1;
  var yy_en = 2020;
  while (yy_en <= now) {
    years.push({ id: yy_en, c_name: yy_en + 543 });
    yy_en++;
  }

  Ext.store_year = new Ext.data.JsonStore({
    fields: ["id", "c_name"],
    data: years,
  });

  Ext.dc_acc = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: true,
    url: "api/All_BiAmCutOff.php",
    baseParams: { type: "dc_acc", all: "all" },
    root: "data",
    idProperty: "id",
    fields: ["id", "c_name"],
    listeners: {
      load: function (t, records, options) {
        // Ext.getCmp("dc_acc_id").setValue("0");
      },
    },
  });

  LookReport = function (type) {
    var msg = "";
    let dc_acc_id = "";

    if (Ext.getCmp("dc_acc_id").getValue() == "") {
      msg += "- กรุณาเลือก ประเภทสินทรัพย์ 1 รายการ<br>";
    } else {
      dc_acc_id = Ext.getCmp("dc_acc_id").getValue();
    }
    if (msg == "") {
      href = "report/Bi_AmCutOff.php";
      var resultUrl = "";
      resultUrl += "&type=" + type;
      resultUrl += "&i_year=" + Ext.getCmp("i_year").getValue();
      resultUrl += "&dc_acc_id=" + (dc_acc_id[0] == "0" ? "0" : dc_acc_id);
      resultUrl = resultUrl != "" ? "?" + resultUrl.substring(1) : "";
      if (type == "excel2007") {
        download(href + resultUrl, title_panel + ".xlsx");
      } else {
        window.open(href + resultUrl, href);
      }
      window.focus();
    } else {
      Ext.MessageBox.alert("แจ้งเตือน", msg);
    }
  };

  function download(url, filename) {
    Ext.Msg.wait("downloading...");
    fetch(url)
      .then((response) => response.blob())
      .then((blob) => {
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
      })
      .then((success) => {
        Ext.Msg.wait("downloading...").hide();
        console.log(success);
      })
      .catch(console.error);
  }

  const panelForm = new Ext.Panel({
    region: "center",
    title: title_panel,
    border: false,
    stripeRows: true,
    loadMask: true,
    items: [
      {
        xtype: "form",
        frame: true,
        labelAlign: "right",
        labelWidth: 200,
        bodyStyle: { padding: "10px 20px" },
        defaults: {
          anchor: "100%",
          msgTarget: "side",
          allowBlank: false,
        },
        items: [
          {
            xtype: "container",
            layout: "hbox",
            align: "stretch",
            RemoveHeight: true,
            defaults: {
              xtype: "fieldset",
              flex: 1,
              margins: "0px 3px",
              autoHeight: true,
            },
            items: [
              {
                title: "เมนู " + title_panel,
                RemoveCls: "x-box-item",
                defaults: {
                  labelStyle: "width:200px;",
                  allowBlank: true,
                },
                items: [
                  new Ext.form.ComboBox({
                    id: "i_year",
                    fieldLabel: "ปีงบประมาณ",
                    width: 163,
                    mode: "local",
                    store: Ext.store_year,
                    valueField: "id",
                    displayField: "c_name",
                    triggerAction: "all",
                    forceSelection: true,
                    selectOnFocus: true,
                    typeAhead: false,
                    emptyText: "กรุณาเลือก...",
                    value: new Date().getFullYear(),
                    listeners: {
                      select: function () {},
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
                  new Ext.ux.form.LovCombo({
                    id: "dc_acc_id",
                    fieldLabel: "ประเภทสินทรัพย์",
                    width: 400,
                    mode: "local",
                    store: Ext.dc_acc,
                    valueField: "id",
                    displayField: "c_name",
                    triggerAction: "all",
                    forceSelection: true,
                    selectOnFocus: true,
                    typeAhead: false,
                    emptyText: "กรุณาเลือก...",
                  }),
                ],
              },
            ],
          },
        ],
        buttonAlign: "left",
        buttons: [
          {
            text: Ext.GLOBAL_BU_SHOW_TH + "สำหรับ HTML",
            iconCls: "page_magnify",
            handler: function () {
              LookReport("html");
            }, // End Handle
          },
          {
            text: Ext.GLOBAL_BU_SHOW_TH + "สำหรับ Excel",
            iconCls: "icon-excel",
            handler: function () {
              LookReport("excel");
            }, // End Handle
          },
          // {
          //   text: "รายงาน Excel *(รองรับข้อมูลจำนวนมาก)",
          //   iconCls: "icon-excel",
          //   handler: function () {
          //     LookReport("excel2007");
          //   }, // End Handle
          // },
        ],
      },
    ],
  }); // panelForm

  /* ====================== CENTER ====================== */
  const center = new Ext.TabPanel({
    region: "center",
    border: false,
    activeTab: 0, // default Tab
    id: "contenterCenter",
    defaults: { autoScroll: true },
    items: [panelForm],
  });

  /* ====================== RENDER ====================== */
  new Ext.Viewport({
    layout: "border",
    items: [center],
  });
});
