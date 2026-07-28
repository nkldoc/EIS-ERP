Ext.onReady(function () {
  Ext.QuickTips.init();

  /* =============================================== */
  title_panel = "รายงานครุภัณฑ์ถยอยรับรู้";
  /* =============================================== */

  // storeYear
  var years = [];
  var currentTime = new Date();
  var now = currentTime.getFullYear() + 1;
  var yy_en = Ext.START_YEAR_ACC;
  while (yy_en <= now) {
    years.push({ id: yy_en, c_name: yy_en + 543 });
    yy_en++;
  }

  Ext.store_year = new Ext.data.JsonStore({
    fields: ["id", "c_name"],
    data: years,
  });

 

  Ext.store_month = new Ext.data.JsonStore({
    fields: ["id", "c_name"],
    data: [
      // { id: "00", c_name: "- ทั้งหมด -" },
     
      { id: "01", c_name: "ม.ค. "  },
      { id: "02", c_name: "ก.พ. "  },
      { id: "03", c_name: "มี.ค. "  },
      { id: "04", c_name: "เม.ย. "  },
      { id: "05", c_name: "พ.ค. "  },
      { id: "06", c_name: "มิ.ย. "  },
      { id: "07", c_name: "ก.ค. "  },
      { id: "08", c_name: "ส.ค. "  },
      { id: "09", c_name: "ก.ย. "  },
      { id: "10", c_name: "ต.ค. "  },
      { id: "11", c_name: "พ.ย. "  },
      { id: "12", c_name: "ธ.ค. "  },
    ],
  });

  LookReport = function (type) {
    var msg = "";

    if (msg == "") {
      href = "report/Rep_AssetDonate.php";
      var resultUrl = "";
      resultUrl += "&type=" + type;
      resultUrl += "&i_year=" + Ext.getCmp("i_year").getValue();
      resultUrl += "&i_month=" + Ext.getCmp("i_month").getValue();
      resultUrl += "&mm_start=" + Ext.getCmp("mm_start").getValue();
      resultUrl += "&yyyy_start=" + Ext.getCmp("yyyy_start").getValue();
      resultUrl += "&mm_end=" + Ext.getCmp("mm_end").getValue();
      resultUrl += "&yyyy_end=" + Ext.getCmp("yyyy_end").getValue();
      resultUrl += "&i_qualify=" + Ext.getCmp("i_qualify").getValue().inputValue;
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
                  {
                    xtype: "compositefield",
                    fieldLabel: "ค่าเสื่อมประจำเดือน",
                    msgTarget: "under",
                    items: [
                      new Ext.form.ComboBox({
                        id: "i_month",
                        width: 50,
                        mode: "local",
                        store: Ext.store_month,
                        valueField: "id",
                        displayField: "c_name",
                        triggerAction: "all",
                        forceSelection: true,
                        selectOnFocus: true,
                        typeAhead: false,
                        emptyText: "กรุณาเลือก...",
                        value: "10",
                        
                      }),
                      
                      {
                        xtype: "displayfield",
                        value: "&nbsp;ปี",
                        width: 10,
                        align: "center",
                      },
                      new Ext.form.ComboBox({
                        id: "i_year",
                        width: 70,
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
                        
                      }),
                    ],
                  },
                  ///////////////////////////////////////////////////////////
                  {
                    xtype: "radiogroup",
                    id: "i_qualify",
                    fieldLabel: "สถานะ",
                    columns: [100, 100, 80],
                    items: [
                      
                      {
                        boxLabel: "เดือนถึงเดือน",
                        name: "i_qualify",
                        inputValue: 1,
                        checked: true,
                      },
                      {
                        boxLabel: "เริ่มได้ถึง",
                        name: "i_qualify",
                        inputValue: 0,
                        
                      },
                    ],listeners: {
                      
                      beforerender:function(){
                        this.fn = function(){
                          if(Ext.getCmp('i_qualify').getValue().inputValue == 0){
                            Ext.getCmp('mm_end').hide();
                            Ext.getCmp('tto').hide();
                            Ext.getCmp('yeara').hide();
                            Ext.getCmp('yyyy_end').hide();
                          } else  if(Ext.getCmp('i_qualify').getValue().inputValue == 1){
                            Ext.getCmp('mm_end').show();
                            Ext.getCmp('tto').show();
                            Ext.getCmp('yeara').show();
                            Ext.getCmp('yyyy_end').show();
                         
                          }
                        //  alert(Ext.getCmp('i_purchaseID').getValue().inputValue);
                        } 
                       }, 
                       change: function () {
                        this.fn();
                      },
                      afterrender:function(){  
                        Ext.getCmp('i_qualify').fn();
                       }
                  },  
                  },
                   {
                    xtype: "compositefield",
                    fieldLabel: "เดือน",
                    msgTarget: "under",
                    items: [
                      new Ext.form.ComboBox({
                        id: "mm_start",
                        width: 50,
                        mode: "local",
                        store: Ext.store_month,
                        valueField: "id",
                        displayField: "c_name",
                        triggerAction: "all",
                        forceSelection: true,
                        selectOnFocus: true,
                        typeAhead: false,
                        emptyText: "กรุณาเลือก...",
                        value: "10",
                        listeners: {
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
                      
                      {
                        xtype: "displayfield",
                        value: "&nbsp;ปี",
                        width: 10,
                        align: "center",
                      },
                      new Ext.form.ComboBox({
                        id: "yyyy_start",
                        width: 70,
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
                      {
                        xtype: "displayfield",
                        value: "&nbsp;ถึง",
                        id:"tto",
                        width: 20,
                        align: "center",
                      },
                      new Ext.form.ComboBox({
                        id: "mm_end",
                        width: 50,
                        mode: "local",
                        store: Ext.store_month,
                        valueField: "id",
                        displayField: "c_name",
                        triggerAction: "all",
                        forceSelection: true,
                        selectOnFocus: true,
                        typeAhead: false,
                        emptyText: "กรุณาเลือก...",
                        value: ("0" + (new Date().getMonth() + 1)).slice(-2),
                        listeners: {
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
                      {
                        xtype: "displayfield",
                        value: "&nbsp;ปี",
                        id: "yeara",
                        width: 10,
                        align: "center",
                      },
                      new Ext.form.ComboBox({
                        id: "yyyy_end",
                        width: 70,
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
          {
            text: "รายงาน Excel *(รองรับข้อมูลจำนวนมาก)",
            iconCls: "icon-excel",
            handler: function () {
              LookReport("excel2007");
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
