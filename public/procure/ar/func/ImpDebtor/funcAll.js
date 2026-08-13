Ext.objChk = [];

function checkAll(ele) {
  for (var i = 1; i < Ext.objChk.length; i++) {
    var ind = Ext.objChk[i];
    if (ind != "") {
      if (document.getElementById(ind)) {
        document.getElementById(ind).checked = ele;
      }
    }
  }
}

Ext.store_fund = new Ext.data.JsonStore({
  autoDestroy: false,
  autoLoad: true,
  chkMask: false,
  url: "../dc/api/All_DcDebtorClaim.php",
  baseParams: { type: "arr_fund" },
  root: "data",
  idProperty: "id",
  fields: [{ name: "id" }, { name: "c_name" }]
});

// ประเภทลูกหนี้
Ext.storeDebtorTypeChk = new Ext.data.JsonStore({
  autoLoad: false,
  url: "api/List_ImpDebtor.php",
  baseParams: { type: "chk_dc_debtor_type" },
  root: "data",
  idProperty: "id",
  totalProperty: "totalCount",
  fields: [{ name: "no" }, { name: "id" }, { name: "c_name" }]
});

// สิทธิ์การรักษา
Ext.storeDebtorClaimChk = new Ext.data.JsonStore({
  autoLoad: false,
  url: "api/List_ImpDebtor.php",
  baseParams: { type: "chk_dc_debtor_claim" },
  root: "data",
  idProperty: "id",
  totalProperty: "totalCount",
  fields: [{ name: "no" }, { name: "id" }, { name: "c_name" }]
});

// หน่วยงานลูกหนี้
Ext.storeCostDebtorChk = new Ext.data.JsonStore({
  autoLoad: false,
  url: "api/List_ImpDebtor.php",
  baseParams: { type: "chk_dc_cost_debtor" },
  root: "data",
  idProperty: "id",
  totalProperty: "totalCount",
  fields: [{ name: "no" }, { name: "id" }, { name: "c_name" }]
});

const saveConfig = function(type) {
  let msg = "";
  let check = false;
  let jsonArr = [];

  $("input[id^=chkConfig]").each(function(i, val) {
    if (val.checked == true) {
      let index = val.value;
      check = true;
      if (type == "dc_debtor_claim") {
        let i_fund = $("#i_fund\\[" + index + "\\]").val();
        if (i_fund != "" && i_fund != undefined) {
        } else {
          msg += "<span style='white-space: nowrap;'>- กรุณา เลือกกองทุน (" + index + ")</span><br>";
        }
        jsonArr.push({
          c_name: $("#chkConfigName\\[" + index + "\\]").val(),
          i_fund: i_fund
        });
      } else {
        jsonArr.push({ c_name: $("#chkConfigName\\[" + index + "\\]").val() });
      }
    }
  });
  if (check == false) {
    msg += "<span style='white-space: nowrap;'>- กรุณา เลือกรายการก่อน!</span><br>";
  }
  if (msg == "") {
    Ext.getCmp("contenterCenter")
      .getEl()
      .mask("Please wait...", "x-mask-loading");
    Ext.Ajax.request({
      url: "api/mn_ImpDebtor.php",
      method: "POST",
      params: {
        mode: type,
        data: JSON.stringify(jsonArr)
      },
      success: function(result, request) {
        Ext.getCmp("contenterCenter")
          .getEl()
          .unmask();
        let json = Ext.util.JSON.decode(result.responseText); //decode json
        if (json.success == true) {
          Ext.getCmp("win-pop-edit").destroy();
          Ext.Msg.alert("แจ้งเตือน", "<span style='white-space: nowrap;'>บันทึกรายการเรียบร้อย</span>", function(btn) {
            let sto1 = null;
            let sto2 = null;
            if (type == "dc_debtor_type") {
              sto1 = Ext.storeDebtorTypeChk;
              sto2 = Ext.dc_debtor_type;
            } else if (type == "dc_debtor_claim") {
              sto1 = Ext.storeDebtorClaimChk;
              sto2 = Ext.dc_debtor_claim;
            } else if (type == "dc_cost_debtor") {
              sto1 = Ext.storeCostDebtorChk;
              sto2 = Ext.dc_cost_debtor;
            }

            Ext.getCmp("contenterCenter")
              .getEl()
              .mask("Please wait...", "x-mask-loading");
            sto1.load({
              callback: function(records, operation, success) {
                sto2.load({
                  callback: function(records, operation, success) {
                    Ext.getCmp("contenterCenter")
                      .getEl()
                      .unmask();
                    let sr = arrS.find(({ success }) => success === false || success === undefined);
                    sr.success = true;
                    chkConfig();
                  }
                });
              }
            });
          });
        }
      },
      failure: function(result, request) {
        Ext.MessageBox.alert("Failed", result.responseText); // connect error
      }
    });
  } else {
    Ext.Msg.alert("แจ้งเตือน", msg);
  }
}; // saveConfig

// Pop new Panel
const popConfig = function(type) {
  let sto = null;
  let c_title = "";
  if (type == "dc_debtor_type") {
    sto = Ext.storeDebtorTypeChk;
    c_title = "ประเภทลูกหนี้";
  } else if (type == "dc_debtor_claim") {
    sto = Ext.storeDebtorClaimChk;
    c_title = "สิทธิ์การรักษา";
  } else if (type == "dc_cost_debtor") {
    sto = Ext.storeCostDebtorChk;
    c_title = "หน่วยงานลูกหนี้";
  }

  if (sto.totalLength > 0) {
    new Ext.Window({
      title: "เลือกข้อมูล",
      id: "win-pop-edit",
      layout: "fit",
      modal: true,
      border: true,
      closable: false,
      height: Ext.getBody().getViewSize().height * 0.7,
      width: Ext.getBody().getViewSize().width * 0.7,
      items: [
        new Ext.grid.EditorGridPanel({
          border: false,
          stripeRows: true,
          loadMask: true,
          store: sto,
          clicksToEdit: 1,
          viewConfig: {
            emptyText: "ไม่มีข้อมูล..",
            deferEmptyText: false
          },
          columns: [
            new Ext.grid.RowNumberer({
              header: "ที่",
              width: 30,
              renderer: function(value, metaData, record, row, col, store, gridView) {
                metaData.attr = "style= 'cursor:pointer; text-align:center;';";
                return record.get("no");
              }
            }),
            {
              header: "<div class='topAlign'><input id='checkAll' type='checkbox' onclick='checkAll(this.checked)'></div>",
              sortable: false,
              align: "center",
              width: 50,
              dataIndex: "no",
              renderer: function(value, metaData, record, row, col, store, gridView) {
                let check = record.data.undefined != "" && record.data.undefined != undefined ? "checked" : "";
                Ext.objChk[value] = "chkConfig[" + value + "]";
                return "<input type='checkbox' id='chkConfig[" + value + "]' value='" + value + "' " + check + "><input type='hidden' id='chkConfigName[" + value + "]' value='" + record.data.c_name + "'>";
              }
            },
            {
              id: "c_name",
              header: "ชื่อ" + c_title,
              sortable: true,
              align: "center",
              dataIndex: "c_name",
              renderer: function(value, metaData, record, rowIndex, colIndex, store) {
                metaData.attr = "style='text-align:left;'";
                return value;
              }
            },
            {
              header: "กองทุน",
              align: "center",
              width: 200,
              hidden: type == "dc_debtor_claim" ? false : true,
              editor: new Ext.form.ComboBox({
                mode: "local",
                store: Ext.store_fund,
                valueField: "id",
                displayField: "c_name",
                triggerAction: "all",
                forceSelection: true,
                selectOnFocus: true,
                typeAhead: false,
                emptyText: "กรุณาเลือก...",
                listeners: {
                  afterrender: function() {
                    this.fn = function() {};
                  },
                  Change: function() {
                    this.fn();
                  },
                  beforequery: function(q) {
                    if (q.query) {
                      var length = q.query.length;
                      q.query = new RegExp(Ext.escapeRe(q.query));
                      q.query.length = length;
                    }
                  },
                  blur: function() {
                    this.getStore().clearFilter();
                  }
                }
              }),
              renderer: function(value, metaData, record, rowIndex, colIndex, store) {
                let c_name = "<font color=red>กรุณาระบุรายการ</font>";
                let vv = "";
                if (value != "" && value != undefined) {
                  let name = getStoreItems(Ext.store_fund, value, "c_name");
                  c_name = name;
                  vv = value;
                }
                return "<input type='hidden' id='i_fund[" + record.data.no + "]' value='" + vv + "'>" + c_name;
              }
            }
          ],
          autoExpandColumn: "c_name"
        })
      ],
      buttonAlign: "left",
      buttons: [
        {
          text: "&nbsp;บันทึกรายการ&nbsp;",
          iconCls: "icon-save",
          handler: function() {
            saveConfig(type);
          }
        },
        {
          text: "&nbsp;ไม่บันทึกรายการ&nbsp;",
          handler: function() {
            Ext.getCmp("win-pop-edit").destroy();
            let sr = arrS.find(({ success }) => success === false || success === undefined);
            sr.success = true;
            chkConfig();
          }
        }
      ]
    }).show();
  } else {
    let sr = arrS.find(({ success }) => success === false || success === undefined);
    sr.success = true;
    chkConfig();
  }
}; // popConfig
