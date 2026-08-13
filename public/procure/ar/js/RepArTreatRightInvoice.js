Ext.onReady(function () {
  Ext.QuickTips.init();

  /* =============================================== */
  title_panel = "สรุปรายได้ค้างรับ (แยกตามสิทธิ์การรักษา)";
  /* =============================================== */

  Ext.ar_treat_right_group = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: true,
    url: "api/All_RepAccruedIncomeRightGroup.php",
    baseParams: { type: "ar_treat_right_group", all: "all" },
    root: "data",
    idProperty: "id",
    fields: ["id", "c_name"],
  });

  LookReport = function (type) {
    var msg = "";
    if (Ext.getCmp("d_date_start").getValue() == "" || Ext.getCmp("d_date_end").getValue() == "") {
      msg += "- กรุณาเลือก วันที่ให้ถูกต้อง<br>";
    }
    if (Ext.getCmp("ar_treat_right_group_id").getValue() == "") {
      msg += "- กรุณาเลือกกลุ่มสิทธิ์การรักษา<br>";
    }

    if (msg == "") {
      href = "report/Rep_ArTreatRightInvoice.php";
      var resultUrl = "";
      resultUrl += "&type=" + type;
      resultUrl += "&i_status=" + Ext.getCmp("i_status").getValue().inputValue;
      resultUrl += "&ar_treat_right_group_id=" + Ext.getCmp("ar_treat_right_group_id").getValue();
      resultUrl += "&d_date_start=" + Ext.util.Format.date(Ext.getCmp("d_date_start").getValue(), "Y-m-d");
      resultUrl += "&d_date_end=" + Ext.util.Format.date(Ext.getCmp("d_date_end").getValue(), "Y-m-d");
      resultUrl = resultUrl != "" ? "?" + resultUrl.substring(1) : "";
      window.open(href + resultUrl, href);
      window.focus();
    } else {
      Ext.MessageBox.alert("แจ้งเตือน", msg);
    }
  };

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
                  {
                    xtype: "compositefield",
                    fieldLabel: "สรุปยอดค้างรับระหว่างวันที่",
                    msgTarget: "under",
                    items: [
                      {
                        xtype: "datefield",
                        id: "d_date_start",
                        width: 127,
                        value: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                      },
                      {
                        xtype: "displayfield",
                        value: "ถึงวันที่",
                        width: 36,
                        align: "center",
                      },
                      {
                        xtype: "datefield",
                        id: "d_date_end",
                        width: 127,
                        value: addY(543),
                      },
                    ],
                  },
                  new Ext.ux.form.LovCombo({
                    id: "ar_treat_right_group_id",
                    fieldLabel: "กลุ่มสิทธิ์การรักษา",
                    width: 300,
                    mode: "local",
                    store: Ext.ar_treat_right_group,
                    valueField: "id",
                    displayField: "c_name",
                    triggerAction: "all",
                    forceSelection: true,
                    selectOnFocus: true,
                    typeAhead: false,
                    emptyText: "กรุณาเลือก...",
                  }),
                  {
                    fieldLabel: "สถานะรายการ",
                    xtype: "radiogroup",
                    id: "i_status",
                    columns: [130, 115, 65],
                    items: [
                      {
                        boxLabel: "ตรวจสอบรายการแล้ว",
                        name: "i_status",
                        inputValue: 1,
                        checked: true,
                      },
                      {
                        boxLabel: "ยังไม่ได้ตรวจสอบ",
                        name: "i_status",
                        inputValue: 0,
                      },
                      {
                        boxLabel: "ทั้งหมด",
                        name: "i_status",
                        inputValue: 99,
                      },
                    ],
                  },
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
