Ext.DTL_ID = null;

const LoadData = function(Search) {
  // Create Row
  $("#Ext_table > tbody").empty();
  let dtl_value = "";
  let dtl_filter = "";
  let dtl_i_cheque = "";

  if (Search) {
    dtl_value = Search.value ? Search.value : "";
    dtl_filter = Search.filter ? Search.filter : "";
    dtl_i_cheque = Search.i_cheque ? Search.i_cheque : "";
  }

  Ext.getCmp("contenterCenter")
    .getEl()
    .mask("Please wait...", "x-mask-loading");
  $.ajax({
    url: "api/List_ImportExpenseCheque.php",
    type: "POST",
    data: {
      type: type_List + "_dtl",
      table: type_List,
      id: Ext.HDR_ID,
      value: dtl_value,
      filter: dtl_filter,
      i_cheque: dtl_i_cheque
    },
    success: function(result) {
      let obj = $.parseJSON(result);
      if (obj.success == true) {
        Ext.getCmp("contenterCenter")
          .getEl()
          .unmask();
        $.each(obj.data, function(index, v) {
          let addBody = "";
          // GEN TBODY
          // ======== รายละเอียดค่าใช้จ่าย ========//
          if (v.i_level == 1) {
            addBody += "<tr style='background:#f0ff9e;'>";
            addBody += "<td nowrap colspan='7'><b>" + v.dc_expense_budget_type_name + "</b></td>";
            addBody += "</tr>";
            $("#Ext_table > tbody").append(addBody);
          } else if (v.i_level == 2) {
            let c_name = v.c_approve + " :: " + v.c_acc_item;
            let cc = v.cheque_count > 0 ? "#CFD5C2" : "#ff3737";
            addBody += "<tr style='background:" + cc + ";'>";
            addBody += "<td nowrap id='Ext_add[" + v.id + "]'></td>";
            addBody += "<td colspan='2'><b>" + c_name + "</b></td>";
            addBody += "<td nowrap align='center'><b>" + v.c_cheque + "</b></td>";
            addBody += "<td nowrap align='center'><b>" + v.d_cheque_dtl + "</b></td>";
            addBody += "<td nowrap align='right'><b>" + v.f_inv_show + "</b></td>";
            addBody += "<td nowrap align='center'><img id='tip2[" + v.id + "]' src='../images/icons/page_magnify.png' alt='แสดง' style='cursor:pointer;'></td>";
            addBody += "</tr>";
            $("#Ext_table > tbody").append(addBody);
            new Ext.Button({
              id: "add[" + v.id + "]",
              icon: "../images/icons/drop-add.gif",
              tooltip: "เพิ่มรายการ",
              width: 28,
              height: 26,
              handler: function() {
                Ext.getCmp("contenterCenter").remove(Ext.getCmp("PanelCheque"), true) || {}; // null obj not errer
                Ext.DTL_ID = v.id;
                // ============ PanelCheque ============ //
                let PanelCheque = new formPanelCheque();
                Ext.getCmp("contenterCenter").add(PanelCheque);
                Ext.getCmp("contenterCenter").setActiveTab(PanelCheque);
                Ext.getCmp("total_bank").setValue(floatRenderer(v.f_inv.toFixed(2)));
              },
              renderTo: "Ext_add[" + v.id + "]"
            });
            new Ext.ToolTip({
              target: "tip2[" + v.id + "]",
              anchor: "left",
              html: v.c_dtl_show
            });
          } else if (v.i_level == 3) {
            addBody += "<tr>";
            addBody += "<td colspan='2'></td>";
            addBody += "<td align='center'>" + v.no + "</td>";
            addBody += "<td align='center'>" + v.dc_cheque_name + "</td>";
            addBody += "<td align='center'>" + v.d_cheque + "</td>";
            addBody += "<td align='right'>" + v.f_cheque + "</td>";
            addBody += "</tr>";
            $("#Ext_table > tbody").append(addBody);
          } else if (v.i_level == 4) {
            addBody += "<tr style='background-color: " + (v.i_chk ? "#b2ff99" : "#ffaeae") + ";'>";
            addBody += "<td align='right' colspan='5'><b>รวมทั้งหมด</b></td>";
            addBody += "<td align='right'><b>" + v.f_cheque + "</b></td>";
            addBody += "</tr>";
            $("#Ext_table > tbody").append(addBody);
          }
          // ============================= //
        });
      }
    }
  });
}; // LoadData

// Class Extend
formPanelDtl = function(args) {
  formPanelDtl.superclass.constructor.call(this, {
    title: "รายละเอียด" + Ext.title_panel,
    id: "PanelDtl",
    iconCls: "icon-application-view-list",
    region: "center",
    layout: "fit",
    border: false,
    stripeRows: true,
    loadMask: true,
    listeners: {
      afterrender: function(obj, eOpts) {
        // check loading store
        Ext.dc_cheque.setBaseParam("dc_bank_acc_company_id_source", Ext.getCmp("dc_bank_acc_company_id_source").getValue());
        let myComboStores = [Ext.dc_cheque];
        // function เช็คโหลด store ทั้งหมดก่อนทำ step ถัดไป
        chkLoadingStore(myComboStores, "contenterCenter", function() {});
      }
    },
    items: [
      new Ext.Panel({
        id: "GRID_DTL",
        autoScroll: true,
        listeners: {
          afterrender: function(component) {
            LoadData({});
          }
        },
        tbar: [
          {
            xtype: "buttongroup",
            title: "ระบุเงื่อนไขในการค้นหาข้อมูล",
            columns: 1,
            defaults: { scale: "small", style: "float: right; width: 320px;" },
            items: [
              {
                xtype: "buttongroup",
                frame: false,
                items: [
                  { xtype: "label", text: "ค้นหาโดย : " },
                  { xtype: "tbspacer", width: 4 },
                  {
                    id: "dtl-filter",
                    xtype: "combo",
                    width: 100,
                    mode: "local",
                    store: new Ext.data.SimpleStore({
                      fields: ["id", "c_name"],
                      data: [
                        ["c_approve", "เลขที่ฎีกา"],
                        ["c_acc_item", "รายการ"]
                      ]
                    }),
                    value: "c_approve",
                    valueField: "id",
                    displayField: "c_name",
                    allowBlank: false,
                    editable: false,
                    triggerAction: "all",
                    typeAhead: false
                  },
                  { xtype: "tbspacer", width: 4 },
                  {
                    xtype: "textfield",
                    id: "dtl-value-box",
                    width: 150,
                    fieldLabel: "fieldLabel",
                    emptyText: "คำที่ต้องการค้นหา"
                  }
                ]
              },
              {
                xtype: "buttongroup",
                frame: false,
                items: [
                  { xtype: "label", text: "สถานะเช็ค : " },
                  { xtype: "tbspacer", width: 4 },
                  {
                    id: "i_cheque",
                    xtype: "combo",
                    width: 254,
                    mode: "local",
                    store: new Ext.data.SimpleStore({
                      fields: ["id", "c_name"],
                      data: [
                        ["0", "- เลือกทั้งหมด -"],
                        ["1", "ยังไม่ระบุเลขที่เช็ค"],
                        ["2", "ระบุเลขที่เช็คแล้ว"]
                      ]
                    }),
                    value: "0",
                    valueField: "id",
                    displayField: "c_name",
                    allowBlank: false,
                    editable: false,
                    triggerAction: "all",
                    typeAhead: false
                  }
                ]
              }
            ],
            buttonAlign: "left",
            buttons: [
              {
                text: "ค้นหา",
                iconCls: "icon-magnifier",
                handler: function() {
                  var msg = "";
                  var fldSearch = {}; // ประกาศตัวแปรเป็น obj
                  if (msg == "") {
                    if (Ext.getCmp("dtl-value-box").getValue() != "") {
                      fldSearch["value"] = Ext.getCmp("dtl-value-box").getValue();
                      fldSearch["filter"] = Ext.getCmp("dtl-filter").getValue();
                    } else {
                      fldSearch["value"] = "";
                      fldSearch["filter"] = "";
                    }
                    fldSearch["i_cheque"] = Ext.getCmp("i_cheque").getValue();
                    LoadData(fldSearch);
                  } else {
                    Ext.Msg.alert("แจ้งเตือน", msg);
                  }
                }
              },
              { xtype: "tbfill" },
              {
                text: "โหลดเช็คค่าใช้จ่าย",
                iconCls: "x-tbar-loading",
                handler: function() {
                  new Ext.Window({
                    id: "win-msg-load",
                    title: "แจ้งเตือน",
                    modal: true,
                    width: 250,
                    height: 130,
                    html: "ท่านต้องการที่จะโหลดข้อมูล ?",
                    buttons: [
                      {
                        text: "Confirm",
                        handler: function() {
                          Ext.getCmp("win-msg-load")
                            .getEl()
                            .mask("Please wait...", "x-mask-loading");
                          Ext.Ajax.request({
                            url: "api/mn_ImportExpenseCheque.php",
                            method: "POST",
                            params: {
                              mode: "ImportCheque",
                              table: type_List,
                              id: Ext.HDR_ID
                            },
                            success: function(result, request) {
                              var jsonData = Ext.util.JSON.decode(result.responseText); // decode json
                              if (jsonData.success == true && jsonData.msg != "") {
                                Ext.MessageBox.alert("แจ้งเตือน", jsonData.msg); // alert massage success
                              } else if (jsonData.success == false) {
                                Ext.MessageBox.alert("แจ้งเตือน", "บันทึกไม่สมบูรณ์"); // alert massage error
                              }
                              Ext.getCmp("win-msg-load").hide(); // hidden window-panel
                              Ext.getCmp("win-msg-load").destroy(); // clear memory :: garbage collection
                              LoadData({});
                            },
                            failure: function(result, request) {
                              Ext.MessageBox.alert("Failed", result.responseText); // connect error
                            }
                          });
                        }
                      },
                      {
                        text: Ext.GLOBAL_BU_BACK_TH,
                        handler: function() {
                          Ext.getCmp("win-msg-load").hide();
                          Ext.getCmp("win-msg-load").destroy();
                        }
                      }
                    ]
                  }).show();
                }
              }
            ]
          }
        ],
        html:
          "<div class='form_table'>" +
          "<style>" +
          ".form_table .x-btn-tl, .form_table .x-btn-tc, .form_table .x-btn-tr" +
          ",.form_table .x-btn-ml, .form_table .x-btn-mc, .form_table .x-btn-mr" +
          ",.form_table .x-btn-bl, .form_table .x-btn-bc, .form_table .x-btn-br" +
          "{border:0px;}" +
          "</style>" +
          "<form method='POST'>" +
          "<table id='Ext_table' class='table_report' border='0' cellspacing='1' cellpadding='0' width='100%'>" +
          // headder
          "<thead class='x-grid3-header'>" +
          "<tr class='x-grid3-hd-row' height='20'>" +
          "<th nowrap style='text-align: center;' width='20'><b></b></th>" +
          "<th nowrap colspan='2' style='text-align: center;' width='800'><b>รายการ</b></th>" +
          "<th nowrap rowspan='2' style='text-align: center;'><b>เลขที่เช็ค</b></th>" +
          "<th nowrap rowspan='2' style='text-align: center;'><b>วันที่เช็ค</b></th>" +
          "<th nowrap rowspan='2' style='text-align: center;'><b>จำนวนเงิน</b></th>" +
          "<th nowrap rowspan='2' style='text-align: center;'><b>#</b></th>" +
          "</tr>" +
          "<tr>" +
          "<th nowrap style='text-align: center;' colspan='2'><b></b></th>" +
          "<th nowrap style='text-align: center;' width='50'><b>ลำดับที่</b></th>" +
          "</tr>" +
          "</thead>" +
          // body
          "<tbody></tbody>" +
          "</table>" +
          "</form>" +
          "</div>"
      })
    ]
  });
}; // formPanelDtl
Ext.extend(formPanelDtl, Ext.Panel, {});
