Ext.onReady(function () {
  Ext.QuickTips.init();

  /* =============================================== */
  Ext.title_panel = "รายงานสรุปประจำเดือน";
  /* =============================================== */

  //storeMonth
  Ext.store_month	= new Ext.data.JsonStore({
    fields: [ "id", "c_name" ],
    data : [
            { id : "01", c_name : "มกราคม" },
            { id : "02", c_name : "กุมภาพันธ์" },
            { id : "03", c_name : "มีนาคม" },
            { id : "04", c_name : "เมษายน" },
            { id : "05", c_name : "พฤษภาคม" },
            { id : "06", c_name : "มิถุนายน" },
            { id : "07", c_name : "กรกฎาคม" },
            { id : "08", c_name : "สิงหาคม" },
            { id : "09", c_name : "กันยายน" },
            { id : "10", c_name : "ตุลาคม" },
            { id : "11", c_name : "พฤศจิกายน" },
            { id : "12", c_name : "ธันวาคม" }
          ]
  });

  // storeYear
  let years = [];
  let currentTime = new Date();
  let startTime = new Date(2020,1,1);
  let now = currentTime.getFullYear() + 1;
  let id = startTime.getFullYear();
  while (id <= now) {
    let c_name = id + 543;
    years.push({
      id,
      c_name,
    });
    id++;
  }

  Ext.store_year = new Ext.data.JsonStore({
    fields: ["id", "c_name"],
    data: years,
  });
Ext.sp_user = new Ext.data.JsonStore({
    autoDestroy: false,
    autoLoad: true,
    url: "api/All_RepSpTorPAuser.php",
    baseParams: { type: "sp_emp", all: "all" },
    root: "data",
    idProperty: "id",
    fields: ["id", "c_name"],
    listeners: {
      load: function (t, records, options) {
//        Ext.getCmp("sp_emp_idID").setValue("0");
      },
    },
  });
  LookReport = function (type) {
    var msg = "";

    href = type == "chart" ? "reports/Rep_RepBIPr.php" : "";

    var resultUrl = "";

    resultUrl += "&type=" + type;
    resultUrl += "&i_mm=" + Ext.getCmp("i_mm").getValue();
    resultUrl += "&i_year=" + Ext.getCmp("i_year").getValue();
    resultUrl += "&sp_emp_id="+ Ext.getCmp("sp_emp_idID").getValue();

    resultUrl = resultUrl != "" ? "?" + resultUrl.substring(1) : "";

    window.open(href + resultUrl, href);
    window.focus();
  };

  const panelForm = new Ext.Panel({
    region: "center",
    title: Ext.title_panel,
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
                title: "เมนู " + Ext.title_panel,
                RemoveCls: "x-box-item",
                defaults: {
                  labelStyle: "width:200px;",
                  allowBlank: true,
                },
                items: [
                  
                new Ext.ux.form.LovCombo({
                        id : "sp_emp_idID",
                        fieldLabel : "ชื่อพนักงาน",
                        width :300,
                        mode : "local",
                        store : new Ext.data.JsonStore({
                            autoDestroy: false,
                            autoLoad: true,
                            url: "api/All_RepSpTorPAuser.php",
                            baseParams: { type: "sp_emp", all: "all" },
                            root: "data",
                            idProperty: "id",
                            fields: ["id", "c_name"],
                            listeners: {
                              load: function (t, records, options) {
//                                Ext.getCmp("sp_emp_idID").setValue("0");
                              },
                            },
                          }),
                        valueField : "id",
                        displayField : "c_name",
                        triggerAction : "all",
                        forceSelection : true,
                        selectOnFocus : true,
                        typeAhead : false,
                        emptyText : "เลือกทั้งหมด.."
                }),
                  {
                    xtype: "compositefield",
                    fieldLabel: "ระหว่างเดือน",
                    msgTarget: "under",
                    items: [
                      new Ext.form.ComboBox({
                        id: "i_mm",
                        width: 100,
                        store: Ext.store_month,
                        valueField: "id",
                        displayField: "c_name", 
                        value: new Date().getMonth()+1, 
                        typeAhead: true,
                        mode: "local",
                        triggerAction: "all",
                        emptyText: 'กรุณาเลือก...',
                        forceSelection: true,
                        selectOnFocus: true, 
                        listeners: {
                        "change": function (combo, newValue) {
                          if (newValue == "") { combo.setValue(0); }
                        }
                      }
                      }), {
                        xtype : 'displayfield',
                        value : 'ปี',
                        align : 'right'
                      },
                      new Ext.form.ComboBox({
                        id: "i_year",
                        mode: "local",
                        store: Ext.store_year,
                        valueField: "id",
                        displayField: "c_name",
                        triggerAction: "all",
                        forceSelection: true,
                        selectOnFocus: true,
                        typeAhead: false,
                        emptyText: "กรุณาเลือก...",
                        width: 100,
                        value: new Date().getMonth() > 10 ? new Date().getFullYear()+1 : new Date().getFullYear(),
                        
                      }),
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
            text: Ext.GLOBAL_BU_SHOW_TH + " Chart",
            iconCls: "icon-chart-pie",
            handler: function () {
              LookReport("chart");
            }, // End Handle
          },
        ],
      },
    ],
  }); // panelForm

  /* ====================== CENTER ====================== */
  var center = new Ext.TabPanel({
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
