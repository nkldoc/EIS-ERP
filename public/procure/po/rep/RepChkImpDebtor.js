Ext.onReady(function() {
  Ext.QuickTips.init();

  /* =============================================== */
  let title_panel = "รายงาน ตรวจสอบรายการเรียกเก็บ";

  LookReport = function(type) {
    let msg = "";


    if (msg == "") {
      let href = "./rep/Rep_ChkImpDebtor.php";
      let resultUrl = "";
      resultUrl += "&type=" + type;
      //       resultUrl += "&i_rep=" + bank_month;
      //       resultUrl += "&dc_bank_id=" + Ext.getCmp("dc_bank_id").getValue();
      //       resultUrl += "&dc_bank_acc_company_id=" + Ext.getCmp("dc_bank_acc_company_id").getValue();
      //       resultUrl += "&i_cheque=" + Ext.getCmp("i_cheque").getValue();
      //       resultUrl += "&month_s=" + Ext.getCmp("month_s").getValue();
      //       resultUrl += "&year_s=" + Ext.getCmp("year_s").getValue();
      //       resultUrl += "&month_e=" + Ext.getCmp("month_e").getValue();
      //       resultUrl += "&year_e=" + Ext.getCmp("year_e").getValue();
      resultUrl = resultUrl != "" ? "?" + resultUrl.substring(1) : "";
      window.open(href + resultUrl, href);
      window.focus();
    } else {
      Ext.MessageBox.alert("แจ้งเตือน", msg);
    }
  };

  let panelForm = new Ext.Panel({
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
          allowBlank: false
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
              autoHeight: true
            },
            items: [
              {
                title: "เมนู " + title_panel,
                RemoveCls: "x-box-item",
                defaults: {
                  labelStyle: "width:200px;",
                  allowBlank: true
                },
                                  items : [ ]
              }
            ]
          }
        ],
        buttonAlign: "left",
        buttons: [
          {
            text: Ext.GLOBAL_BU_SHOW_TH + "สำหรับ HTML",
            iconCls: "page_magnify",
            handler: function() {
              LookReport("html");
            } // End Handle
          },
          {
            text: Ext.GLOBAL_BU_SHOW_TH + "สำหรับ Excel",
            iconCls: "icon-excel",
            handler: function() {
              LookReport("excel");
            } // End Handle
          }
        ]
      }
    ]
  }); // panelForm

  /* ====================== CENTER ====================== */
  let center = new Ext.TabPanel({
    region: "center",
    border: false,
    activeTab: 0, // default Tab
    id: "contenterCenter",
    defaults: { autoScroll: true },
    items: [panelForm]
  });

  /* ====================== RENDER ====================== */
  new Ext.Viewport({
    layout: "border",
    items: [center]
  });
});
