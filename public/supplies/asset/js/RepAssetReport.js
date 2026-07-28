Ext.onReady(function () {
  Ext.QuickTips.init();

  /* =============================================== */
  title_panel = "รายงานสินทรัพย์ประกอบงบการเงิน";
  /* =============================================== */

  // storeYear
  var years = [];
  var currentTime = new Date();
  var now = currentTime.getFullYear() + 1;
  var yy_en = 2022;
  while (yy_en <= now) {
    years.push({ id: yy_en, c_name: yy_en + 543 });
    yy_en++;
  }

  Ext.store_year = new Ext.data.JsonStore({
    fields: ["id", "c_name"],
    data: years,
  });

  LookReport = function (type) {
    var msg = "";

    if (msg == "") {
      href = "report/Rep_AssetReport.php";
      var resultUrl = "";
      resultUrl += "&type=" + type;
      resultUrl += "&i_year=" + Ext.getCmp("i_year").getValue();
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
                      select: function () {
                        var i_year = Ext.getCmp("i_year").getValue() + 543;
                        Ext.store_month = new Ext.data.JsonStore({
                          fields: ["id", "c_name"],
                          data: [
                            // { id: "00", c_name: "- ทั้งหมด -" },
                            { id: "10", c_name: "ต.ค. " + (i_year - 1) },
                            { id: "11", c_name: "พ.ย. " + (i_year - 1) },
                            { id: "12", c_name: "ธ.ค. " + (i_year - 1) },
                            { id: "01", c_name: "ม.ค. " + i_year },
                            { id: "02", c_name: "ก.พ. " + i_year },
                            { id: "03", c_name: "มี.ค. " + i_year },
                            { id: "04", c_name: "เม.ย. " + i_year },
                            { id: "05", c_name: "พ.ค. " + i_year },
                            { id: "06", c_name: "มิ.ย. " + i_year },
                            { id: "07", c_name: "ก.ค. " + i_year },
                            { id: "08", c_name: "ส.ค. " + i_year },
                            { id: "09", c_name: "ก.ย. " + i_year },
                          ],
                        });
                        Ext.getCmp("mm_start").bindStore(Ext.store_month);
                        Ext.getCmp("mm_end").bindStore(Ext.store_month);
                        Ext.getCmp("mm_start").setValue(Ext.getCmp("mm_start").getValue());
                        Ext.getCmp("mm_end").setValue(Ext.getCmp("mm_end").getValue());
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
