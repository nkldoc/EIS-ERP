//===================== Function
//jsondata Dtl
function saveGrid(stores) {
  var jsonData = "";
  for (i = 0; i < stores.getCount(); i++) {
    record = stores.getAt(i);
    jsonData += Ext.util.JSON.encode(record.data) + ",";
  }
  if (jsonData.length > 1) {
    jsonData = jsonData.substring(0, jsonData.length - 1);
  }
  return "[" + jsonData + "]";
}

setChecked = function (v, row, col, ss) {
  Ext.storePermissionRight.data.items[row].data[ss] = v;
};
i_showFunc = function (value, metaData, record, row, col, store, gridView) {
  metaData.attr = 'style="background-color: #DFF0D8;"';
  Ext.storePermissionRight = store;
  return '<label><div><input onclick="setChecked(this.checked,' + row + "," + col + ',\'i_show\')" type="checkbox" ' + (value ? "checked" : "") + ">";
};

i_read_selfFunc = function (value, metaData, record, row, col, store, gridView) {
  metaData.attr = 'style="background-color: #e1e4ff;"';
  var isLeaf = store.getAt(row).data["_is_leaf"];
  if (!isLeaf) return "";
  else return '<label><div><input onclick="setChecked(this.checked,' + row + "," + col + ',\'i_read_self\')" type="checkbox" ' + (value ? "checked" : "") + ">";
};

i_read_costFunc = function (value, metaData, record, row, col, store, gridView) {
  metaData.attr = 'style="background-color: #e1e4ff;"';
  var isLeaf = store.getAt(row).data["_is_leaf"];
  if (!isLeaf) return "";
  else return '<label><div><input onclick="setChecked(this.checked,' + row + "," + col + ',\'i_read_cost\')" type="checkbox" ' + (value ? "checked" : "") + ">";
};
i_read_allFunc = function (value, metaData, record, row, col, store, gridView) {
  metaData.attr = 'style="background-color: #e1e4ff;"';
  var isLeaf = store.getAt(row).data["_is_leaf"];
  if (!isLeaf) return "";
  else return '<label><div><input onclick="setChecked(this.checked,' + row + "," + col + ',\'i_read_all\')" type="checkbox" ' + (value ? "checked" : "") + ">";
};
i_read_overallFunc = function (value, metaData, record, row, col, store, gridView) {
  metaData.attr = 'style="background-color: #e1e4ff;"';
  var isLeaf = store.getAt(row).data["_is_leaf"];
  if (!isLeaf) return "";
  else return '<label><div><input onclick="setChecked(this.checked,' + row + "," + col + ',\'i_read_overall\')" type="checkbox" ' + (value ? "checked" : "") + ">";
};
i_per_addFunc = function (value, metaData, record, row, col, store, gridView) {
  metaData.attr = 'style="background-color: #ffe8e8;"';
  var isLeaf = store.getAt(row).data["_is_leaf"];
  if (!isLeaf) return "";
  else return '<label><div><input onclick="setChecked(this.checked,' + row + "," + col + ',\'i_per_add\')" type="checkbox" ' + (value ? "checked" : "") + ">";
};
i_per_updateFunc = function (value, metaData, record, row, col, store, gridView) {
  metaData.attr = 'style="background-color: #ffe8e8;"';
  var isLeaf = store.getAt(row).data["_is_leaf"];
  if (!isLeaf) return "";
  else return '<label><div><input onclick="setChecked(this.checked,' + row + "," + col + ',\'i_per_update\')" type="checkbox" ' + (value ? "checked" : "") + ">";
};
i_per_deleteFunc = function (value, metaData, record, row, col, store, gridView) {
  metaData.attr = 'style="background-color: #ffe8e8;"';
  var isLeaf = store.getAt(row).data["_is_leaf"];
  if (!isLeaf) return "";
  else return '<label><div><input onclick="setChecked(this.checked,' + row + "," + col + ',\'i_per_delete\')" type="checkbox" ' + (value ? "checked" : "") + ">";
};

//===================== On Load
Ext.onReady(function () {
  Ext.QuickTips.init();

  //create the data store
  var record = Ext.data.Record.create([
    {
      name: "dc_menu_id",
      type: "int",
    },
    {
      name: "menu",
    },
    {
      name: "i_show",
      type: "bool",
    },
    {
      name: "i_read_self",
      type: "bool",
    },
    {
      name: "i_read_cost",
      type: "bool",
    },
    {
      name: "i_read_all",

      type: "bool",
    },
    {
      name: "i_read_overall",
      type: "bool",
    },
    {
      name: "i_per_add",
      type: "bool",
    },
    {
      name: "i_per_update",
      type: "bool",
    },
    {
      name: "i_per_delete",
      type: "bool",
    },
    {
      name: "_id",
      type: "int",
    },
    {
      name: "_level",
      type: "int",
    },
    {
      name: "_lft",
      type: "int",
    },
    {
      name: "_rgt",
      type: "int",
    },
    {
      name: "_is_leaf",
      type: "bool",
    },
  ]);

  var storePermission = new Ext.ux.maximgb.tg.NestedSetStore({
    autoLoad: true,
    storeId: "storePermission",
    url: "api/mnDcUserDcGroupMenu.php?mode=right",

    reader: new Ext.data.JsonReader(
      {
        id: "_id",
        root: "data",
        totalProperty: "total",
        successProperty: "success",
      },
      record
    ),
  });

  var store = new Ext.data.JsonStore({
    storeId: "myStore",
    autoDestroy: true,
    autoLoad: true,
    url: "api/ListDcUser.php",
    baseParams: {
      i_read: user_right_read,
    }, //Permission i_read
    root: "data",
    idProperty: "id",
    totalProperty: "totalCount",
    fields: [
      { name: "no", type: "int" },
      { name: "id" },
      { name: "menu_hdr_id" },
      { name: "dc_emp_id" },
      { name: "c_full_name" },
      { name: "dc_cost_id" },
      { name: "c_user_name" },
      { name: "c_password" },
      { name: "c_comment" },
      { name: "i_type_user" },
      { name: "i_enable" },
      { name: "i_delete" },
      { name: "dc_user_create_id" },
      { name: "dc_user_create_cost_id" },
      { name: "d_create" },
      { name: "dc_user_update_id" },
      { name: "dc_user_update_cost_id" },
      { name: "d_update" },
    ],
  });

  //กลุ่มการใช้งานเมนู
  var dc_group_menu = new Ext.data.JsonStore({
    autoDestroy: true,
    autoLoad: true,
    url: "api/ListDcCombo.php",
    root: "data",
    idProperty: "id",
    fields: [
      {
        name: "id",
      },
      {
        name: "c_name",
        type: "string",
      },
    ],
    listeners: {
      load: function (t, records, options) {},
    },
    baseParams: {
      mode: 2,
      fldID: "dc_menu_hdr_id",
      table: "dc_menu_hdr",
      filter: "i_delete",
      value: 2,
    },
  });

  // // ศูนย์ต้นทุน
  // var dc_cost = new Ext.data.JsonStore({
  //   autoDestroy: true,
  //   autoLoad: true,
  //   url: "api/ListDcCombo.php",
  //   root: "data",
  //   fields: [{ name: "id" }, { name: "c_name", type: "string" }],
  //   baseParams: { mode: 2, fldID: "dc_cost_id", table: "dc_cost" },
  // });

  // ศูนย์ต้นทุน
  var dc_cost = new Ext.data.JsonStore({
    autoDestroy: true,
    autoLoad: true,
    url: "api/ListDcCombo.php",
    root: "data",
    fields: [{ name: "id" }, { name: "c_name", type: "string" }, { name: "dc_cost_lv2_id" }, { name: "c_name_lv2" }],
    baseParams: { mode: "DC_COST", fldID: "dc_cost_id", table: "dc_cost" },
  });

  // store พนักงานผู้รับผิดชอบ
  var dc_emp = new Ext.data.JsonStore({
    autoDestroy: true,
    autoLoad: true,
    url: "api/ListDcCombo.php",
    root: "data",
    fields: [{ name: "id" }, { name: "c_name", type: "string" }],
    baseParams: { mode: 1, fldID: "dc_emp_id", table: "dc_emp" },
  });

  // ผู้ใช้งานต้นแบบ (โหลดเมนู)
  var dc_emp_load = new Ext.data.JsonStore({
    autoDestroy: true,
    autoLoad: true,
    url: "api/ListDcCombo.php",
    root: "data",
    fields: [{ name: "id" }, { name: "c_name", type: "string" }],
    baseParams: { mode: "DC_EMP_LOAD", fldID: "dc_emp_id", table: "dc_emp" },
  });

  /*====================== TabShow Intelization ======================*/
  Ext.runx = function (menu_hdr_idx, idx) {
    var win = new Ext.Window({
      id: "win-msg-updatemenu",
      title: "Remove",
      modal: true,
      width: 250,
      height: 130,
      html: "อัพเดทเมนูยูสเซอร์ ?",
      buttons: [
        {
          text: "Confirm",
          handler: function () {
            Ext.Ajax.request({
              url: "api/mnDcUser.php",
              params: {
                mode: "UPDATEMENU",
                id: idx,
                menu_hdr_id: menu_hdr_idx,
              },
              method: "POST", //POST
              success: function (result, request) {
                var jsonData = Ext.util.JSON.decode(result.responseText); //decode json
                if (jsonData.success) {
                } else {
                  Ext.MessageBox.alert("Failed", jsonData.msg); // alert massage error
                }
                Ext.getCmp("win-msg-updatemenu").hide(); // hidden window-panel
                Ext.getCmp("win-msg-updatemenu").destroy(); // clear memory :: garbage collection
                Ext.getCmp("tabpanel1").getStore().reload();
              },
              failure: function (result, request) {
                Ext.MessageBox.alert("Failed", result.responseText); // connect error
              },
            });
          },
        },
        {
          text: "Cancel",
          handler: function () {
            Ext.getCmp("win-msg-updatemenu").hide();
            Ext.getCmp("win-msg-updatemenu").destroy();
            Ext.getCmp("tabpanel1").getStore().reload();
          },
        },
      ],
    }).show();
  };
  var gridMain = {
    region: "center",
    title: "แสดงข้อมูลผู้ใช้งานระบบ",
    xtype: "grid",
    id: "tabpanel1",
    border: false,
    stripeRows: true,
    loadMask: true,
    store: store,
    tbar: [ 
      {
        xtype: "tbfill",
      },
      "",
      "",
      "-",
      {
        id: "filter",
        xtype: "combo",
        width: 130,
        mode: "local",
        store: new Ext.data.SimpleStore({
          fields: ["value", "text"],
          data: [
            ["c_full_name", "ชื่อพนักงาน"],
            ["c_user_name", "ชื่อผู้ใช้งานระบบ"],
          ],
        }),
        valueField: "value",
        displayField: "text",
        allowBlank: false,
        editable: false,
        triggerAction: "all",
        typeAhead: false,
        value: "c_full_name",
      },
      "-",
      {
        id: "value-box",
        xtype: "textfield",
        width: 130,
        fieldLabel: "fieldLabel",
        emptyText: "คำที่ต้องการค้นหา",
      },
      "",
      "-",
      {
        text: "ค้นหา",
        iconCls: "icon-magnifier",
        handler: function () {
          if (Ext.getCmp("value-box").getValue() != "") {
            store.setBaseParam("mode", "SEARCH");
            store.setBaseParam("filter", Ext.getCmp("filter").getValue());
            store.setBaseParam("value", Ext.getCmp("value-box").getValue());
            Ext.getCmp("tabpanel1").getStore().load();
          } else {
            store.setBaseParam("mode", "");
            Ext.getCmp("tabpanel1").getStore().load();
          }
        },
      },
      "",
      "-",
    ],
    columns: [
      new Ext.grid.RowNumberer({
        width: 35,
        header: " No ",
        renderer: function (value, metaData, record, row, col, store, gridView) {
          return record.get("no");
        },
      }),
      {
        header: "ID System",
        sortable: true,
        hidden: true,
        dataIndex: "id",
      },
      {
        header: "อัพเดทเมนู",
        sortable: true,
        dataIndex: "id",
        renderer: function (value, metaData, record, row, col, store, gridView) {
          return record.get("menu_hdr_id") > 0 ? '<button id="buUpdaeMenu" onclick="Ext.runx(' + record.get("menu_hdr_id") + "," + record.get("id") + ')">updateMenu</button>' : "";
        },
      },
      {
        header: "ชื่อผู้ใช้งานระบบ",
        sortable: true,
        dataIndex: "c_user_name",
      },

      {
        id: "c_full_name",
        header: "ชื่อพนักงาน",
        sortable: true,
        dataIndex: "c_full_name",
      },
      {
        header: "Status",
        sortable: false,
        width: 50,
        align: "center",
        renderer: function (value, metaData, record, row, col, store, gridView) {
          return record.get("i_enable") ? '<img src="../images/icons/yes.gif");/>' : '<img src="../images/icons/no.gif");/>';
        },
      },
    ],

    autoExpandColumn: "c_full_name",
    bbar: (pagingBar = new Ext.PagingToolbar({
      pageSize: 20,
      store: store,
      displayInfo: true,
      displayMsg: "Displaying topics {0} - {1} of {2}",
    })),
  };

  function cellClick(grid, rowIndex, columnIndex, e) {
    var record = grid.getStore().getAt(rowIndex);

    if (columnIndex == grid.getColumnModel().getIndexById("view")) {
      Ext.getCmp("role-form-mode").setValue("EDIT");
      Ext.getCmp("buSave").setDisabled(true);
      Ext.getCmp("tabpanel2").setDisabled(false);
      Ext.getCmp("fieldsetID").hide();
      Ext.getCmp("contenterCenter").setActiveTab("tabpanel2");
      Ext.getCmp("form-widgets").getForm().loadRecord(record);

      storePermission.setBaseParam("id", record.get("id"));
      storePermission.setBaseParam("groupId", 0);
      storePermission.load();
    } else if (columnIndex == grid.getColumnModel().getIndexById("edit")) {
      Ext.getCmp("c_password").setValue("");
      Ext.getCmp("comfirm_pass").setValue("");
      Ext.getCmp("fieldsetID").show();
      if (Ext.getCmp("gridPermission").selModel.last) storePermission.removeAll();
      //   storePermission.reload({
      //     params: { id: record.get("id"), groupId: 0 },
      //     callback: function(recordx, operation, success) {
      //       if (success) {
      //         Ext.getCmp("role-form-mode").setValue("EDIT");
      //         Ext.getCmp("buSave").setDisabled(false);
      //         Ext.getCmp("tabpanel2").setDisabled(false);
      //         Ext.getCmp("contenterCenter").setActiveTab("tabpanel2");
      //         Ext.getCmp("form-widgets")
      //           .getForm()
      //           .loadRecord(record);
      //       }
      //     }
      //   });

      Ext.getCmp("role-form-mode").setValue("EDIT");
      Ext.getCmp("buSave").setDisabled(false);
      Ext.getCmp("tabpanel2").setDisabled(false);
      Ext.getCmp("contenterCenter").setActiveTab("tabpanel2");
      Ext.getCmp("form-widgets").getForm().loadRecord(record);

      storePermission.setBaseParam("id", record.get("id"));
      storePermission.setBaseParam("groupId", 0);
      storePermission.load();

      if (Ext.getCmp("dc_cost_code").getValue() > 0) {
        var dc_cost_lv2 = dc_cost.getById(Ext.getCmp("dc_cost_code").getValue());
        Ext.getCmp("dc_cost_lv2").setValue(dc_cost_lv2.data.c_name_lv2);
      }
      /*
						storePermission.setBaseParam("id", record.get('id'));
						storePermission.setBaseParam("groupId", 0);
						storePermission.load();*/
    } else if (columnIndex == grid.getColumnModel().getIndexById("remove")) {
      var win = new Ext.Window({
        id: "win-msg-delete",
        title: "Remove",
        modal: true,
        width: 250,
        height: 130,
        html: "ท่านต้องการที่จะลบข้อมูล ?",
        buttons: [
          {
            text: "Confirm",
            handler: function () {
              Ext.Ajax.request({
                url: "api/mnDcUser.php",
                params: {
                  mode: "DELETE",
                  id: record.get("id"),
                },
                method: "GET", //POST
                success: function (result, request) {
                  var jsonData = Ext.util.JSON.decode(result.responseText); //decode json
                  if (jsonData.success) {
                    Ext.getCmp("win-msg-delete").hide(); // hidden window-panel
                    Ext.getCmp("win-msg-delete").destroy(); // clear memory :: garbage collection
                    Ext.getCmp("tabpanel1").getStore().reload(); // reload grid & store
                    Ext.getCmp("tabpanel2").setDisabled(true);
                  } else {
                    Ext.MessageBox.alert("Failed", jsonData.msg); // alert massage error
                  }
                },
                failure: function (result, request) {
                  Ext.MessageBox.alert("Failed", result.responseText); // connect error
                },
              });
            },
          },
          {
            text: "Cancel",
            handler: function () {
              storePermission.setBaseParam("id", -1);
              storePermission.setBaseParam("groupId", 0);
              storePermission.load();
              Ext.getCmp("form-widgets").getForm().reset();
              Ext.getCmp("tabpanel2").setDisabled(true);
              Ext.getCmp("contenterCenter").setActiveTab("tabpanel1");
            },
          },
        ],
      }).show();
    }
  }
  /*====================== End Tabs ====================*/

  var panelForm = {
    region: "center",
    title: "ข้อมูลผู้ใช้งานระบบ",
    xtype: "panel",
    id: "tabpanel2",
    border: false,
    disabled: true,
    stripeRows: true,
    loadMask: true,
    store: store,
    items: [
      {
        xtype: "form",
        id: "form-widgets",
        url: "api/mnDcUser.php",
        frame: true,
        labelWidth: 200,
        bodyStyle: {
          padding: "10px 20px",
        },
        defaults: {
          anchor: "100%",
          msgTarget: "side",
        },
        items: [
          {
            id: "role-form-mode",
            xtype: "hidden",
            name: "mode",
            readOnly: true,
          },
          {
            xtype: "hidden",
            name: "id",
            id: "idID",
            readOnly: true,
          },
          new Ext.form.ComboBox({
            id: "dc_emp_id",
            width: 130,
            fieldLabel: "พนักงานผู้รับผิดชอบ",
            store: dc_emp,
            valueField: "id",
            displayField: "c_name",
            submitValue: true,
            hiddenName: "emp_id",
            typeAhead: false,
            mode: "local",
            triggerAction: "all",
            emptyText: "กรุณาเลือก...",
            forceSelection: true,
            selectOnFocus: true,
            readOnly: true,
            style: {
              background: "#EEEEEE",
              color: "#333",
              border: "1px solid #ADADAD",
            },
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
              // keyup: function (combo) {
              //   Ext.getCmp("btn_load_group").hide();
              // },
              // select: function () {
              //   if (Ext.getCmp("dc_menu_user").getValue() != 0) {
              //     Ext.getCmp("btn_load_group").show();
              //   } else {
              //     Ext.getCmp("btn_load_group").hide();
              //   }
              // },
            },
          }),
          {
            fieldLabel: "ชื่อ-สกุล",
            emptyText: "* เช่น นายเสถียร แก้วจงกูล",
            xtype: "textfield",
            name: "c_full_name",
            anchor: "80%",
            readOnly: true,
            style: {
              background: "#EEEEEE",
              color: "#333",
              border: "1px solid #ADADAD",
            },
          },
          new Ext.form.ComboBox({
            id: "dc_cost_code",
            fieldLabel: "หน่วยงาน",
            store: dc_cost,
            valueField: "id",
            displayField: "c_name",
            submitValue: true,
            hiddenName: "dc_cost_id",
            typeAhead: false,
            mode: "local",
            triggerAction: "all",
            emptyText: "กรุณาเลือก...",
            autoSelect: true,
            forceSelection: true,
            selectOnFocus: true,
            readOnly: true,
            style: {
              background: "#EEEEEE",
              color: "#333",
              border: "1px solid #ADADAD",
            },
            listeners: {
              change: function (combo, newValue) {
                if (newValue == "") {
                  combo.reset();
                }
              },
              select: function (combo, newValue) {
                var newValue = newValue.id;
                if (newValue == "") {
                  combo.reset();
                } else {
                  var dc_cost_lv2 = dc_cost.getById(newValue);
                  Ext.getCmp("dc_cost_lv2").setValue(dc_cost_lv2.data.c_name_lv2);
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
            fieldLabel: "คณะ/ส่วนงาน",
            xtype: "textfield",
            id: "dc_cost_lv2",
            // name: "",
            anchor: "100%",
            readOnly: true,
            style: {
              // "text-align": "center",
              background: "#EEEEEE",
              color: "#333",
              border: "1px solid #ADADAD",
            },
          },
          {
            fieldLabel: "Username",
            xtype: "textfield",
            name: "c_user_name",
            anchor: "80%",
            readOnly: true,
            style: {
              background: "#EEEEEE",
              color: "#333",
              border: "1px solid #ADADAD",
            },
          },
          {
            fieldLabel: "Password",
            xtype: "textfield",
            name: "c_password",
            id: "c_password",
            anchor: "80%",
            hidden: true,
          },
          {
            fieldLabel: "Confirm Password",
            xtype: "textfield",
            name: "comfirm_pass",
            id: "comfirm_pass",
            anchor: "80%",
            hidden: true,
          },
          {
            fieldLabel: "คำอธิบายเพิ่มเติม",
            xtype: "textfield",
            name: "c_comment",
            anchor: "80%",
            hidden: true,
          },
          {
            fieldLabel: "ประเภทผู้ใช้งาน",
            xtype: "radiogroup",
            columns: [80, 100, 100, 100],
            hidden: true,
            items: [
              {
                boxLabel: "พนักงาน",
                checked: true,
                name: "i_type_user",
                inputValue: "1",
              },
              {
                boxLabel: "Administrator",
                name: "i_type_user",
                inputValue: "2",
              },
              {
                boxLabel: "หน่วยงาน",
                name: "i_type_user",
                inputValue: "3",
              },
            ],
          },
          {
            fieldLabel: "สถานะการใช้งาน",
            xtype: "radiogroup",
            columns: [80, 100],
            hidden: true,
            items: [
              {
                boxLabel: "ใช้งาน",
                checked: true,
                name: "i_enable",
                inputValue: "1",
              },
              {
                boxLabel: "ไม่ใช้งาน",
                name: "i_enable",
                inputValue: "2",
              },
            ],
          },
          {
            bodyStyle: "padding-left:0px;",
            items: {
              width: 720,
              xtype: "fieldset",
              id: "fieldsetID",
              title: "โหลดข้อมูลเมนู ",
              autoHeight: true,
              // defaultType: 'radio', // each item will be a radio button
              items: [
                {
                  fieldLabel: "รูปแบบการโหลดเมนู",
                  id: "load_manuID",
                  xtype: "radiogroup",
                  columns: [150, 180],
                  items: [
                    {
                      boxLabel: "โหลดจากผู้ใช้งานอื่น",
                      checked: true,
                      name: "load_manu",
                      inputValue: "1",
                    },
                    {
                      boxLabel: "โหลดจากกลุ่มการใช้งานเมนู",
                      name: "load_manu",
                      inputValue: "2",
                    },
                  ],
                  listeners: {
                    change: function () {
                      if (Ext.getCmp("load_manuID").getValue().inputValue == 1) {
                        Ext.getCmp("dc_user_load").show();
                        Ext.getCmp("dc_menu_user").hide();
                        Ext.getCmp("btn_load_group").hide();
                        Ext.getCmp("dc_menu_user").reset();
                      } else if (Ext.getCmp("load_manuID").getValue().inputValue == 2) {
                        Ext.getCmp("dc_menu_user").show();
                        Ext.getCmp("dc_user_load").hide();
                        Ext.getCmp("btn_load_user_manu").hide();
                        Ext.getCmp("dc_user_load").reset();
                      }
                    },
                  },
                },
                new Ext.form.ComboBox({
                  id: "dc_user_load",
                  fieldLabel: "ผู้ใช้งานต้นแบบ",
                  anchor: "100%",
                  store: dc_emp_load,
                  valueField: "id",
                  displayField: "c_name",
                  // hiddenName: "dc_menu_hdr_id",
                  typeAhead: false,
                  mode: "local",
                  triggerAction: "all",
                  emptyText: "กรุณาเลือกผู้ใช้งานต้นแบบ...",
                  autoSelect: true,
                  forceSelection: true,
                  selectOnFocus: true,
                  enableKeyEvents: true,
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
                    keyup: function (combo) {
                      if (combo.getRawValue() == "") {
                        Ext.getCmp("btn_load_user_manu").hide();
                      }
                    },
                    select: function () {
                      if (Ext.getCmp("dc_user_load").getValue() != 0) {
                        Ext.getCmp("btn_load_user_manu").show();
                      } else {
                        Ext.getCmp("btn_load_user_manu").hide();
                      }
                    },
                  },
                }),
                new Ext.form.ComboBox({
                  id: "dc_menu_user",
                  fieldLabel: "ต้นแบบกลุ่มการใช้งานระบบ",
                  anchor: "100%",
                  store: dc_group_menu,
                  valueField: "id",
                  displayField: "c_name",
                  hiddenName: "dc_menu_hdr_id",
                  hidden: true,
                  typeAhead: false,
                  mode: "local",
                  triggerAction: "all",
                  emptyText: "กรุณาเลือกต้นแบบกลุ่มการใช้งานระบบ...",
                  autoSelect: true,
                  forceSelection: true,
                  selectOnFocus: true,
                  enableKeyEvents: true,
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
                    keyup: function (combo) {
                      if (combo.getRawValue() == "") {
                        Ext.getCmp("btn_load_group").hide();
                      }
                    },
                    select: function () {
                      if (Ext.getCmp("dc_menu_user").getValue() != 0) {
                        Ext.getCmp("btn_load_group").show();
                      } else {
                        Ext.getCmp("btn_load_group").hide();
                      }
                    },
                  },
                }),
                {
                  xtype: "spacer",
                },
                {
                  buttonAlign: "left",
                  buttons: [
                    { xtype: "tbfill" },
                    {
                      id: "btn_load_user_manu",
                      text: "<img src='../images/icons/build.png'); style='cursor:pointer'/><b>&nbsp;โหลดข้อมูลจากผู้ใช้งานต้นแบบ&nbsp;</b>",
                      hidden: true,
                      handler: function () {
                        if (Ext.getCmp("dc_user_load").getValue() > 0) {
                          storePermission.setBaseParam("dc_user_manu_load", Ext.getCmp("dc_user_load").getValue());
                          storePermission.setBaseParam("groupId", 0);
                          storePermission.setBaseParam("dc_user_id", Ext.getCmp("idID").getValue());
                          storePermission.load();
                        } else alert("ต้นแบบกลุ่มการใช้งานระบบ");
                      },
                    },
                    {
                      id: "btn_load_group",
                      text: "<img src='../images/icons/build.png'); style='cursor:pointer'/><b>&nbsp;โหลดข้อมูลจากกลุ่มการใช้งานเมนู&nbsp;</b>",
                      hidden: true,
                      handler: function () {
                        if (Ext.getCmp("dc_menu_user").getValue() > 0) {
                          storePermission.setBaseParam("dc_user_manu_load", 0);
                          storePermission.setBaseParam("groupId", Ext.getCmp("dc_menu_user").getValue());
                          storePermission.setBaseParam("dc_user_id", Ext.getCmp("idID").getValue());
                          storePermission.load();
                        } else alert("กรุณาเลือกกลุ่มการใช้งานเมนูก่อน");
                      },
                    },
                  ],
                },
                // {
                //   xtype: "button",
                //   docked: 'right',
                //   id: "btn_load_user_manu",
                //   text: "<img src='../images/icons/build.png'); style='cursor:pointer'/><b>&nbsp;โหลดข้อมูลจากผู้ใช้งานต้นแบบ&nbsp;</b>",
                //   hidden: true,
                //   handler: function () {
                //     if (Ext.getCmp("dc_user_load").getValue() > 0) {
                //       storePermission.setBaseParam("dc_user_manu_load", Ext.getCmp("dc_user_load").getValue());
                //       storePermission.setBaseParam("groupId", 0);
                //       storePermission.setBaseParam("dc_user_id", Ext.getCmp("idID").getValue());
                //       storePermission.load();
                //     } else alert("ต้นแบบกลุ่มการใช้งานระบบ");
                //   },
                // },
                // {
                //   xtype: "button",
                //   anchor: "100%",
                //   id: "btn_load_group",
                //   text: "<img src='../images/icons/build.png'); style='cursor:pointer'/><b>&nbsp;โหลดข้อมูลจากกลุ่มการใช้งานเมนู&nbsp;</b>",
                //   hidden: true,
                //   handler: function () {
                //     if (Ext.getCmp("dc_menu_user").getValue() > 0) {
                //       storePermission.setBaseParam("dc_user_manu_load", 0);
                //       storePermission.setBaseParam("groupId", Ext.getCmp("dc_menu_user").getValue());
                //       storePermission.setBaseParam("dc_user_id", Ext.getCmp("idID").getValue());
                //       storePermission.load();
                //     } else alert("กรุณาเลือกกลุ่มการใช้งานเมนูก่อน");
                //   },
                // },
              ],
            },
          },

          {
            xtype: "button",
            fieldLabel: "ต้นแบบกลุ่มการใช้งานระบบ",
            hidden: true,
            anchor: "20%",
            text: "[ บันทึก กลุ่มข้อมูล ]",
            /*handler: function () {

						if (Ext.getCmp("dc_menu_user").getValue() > 0) {
							storePermission.setBaseParam("saveGroupMenu", true);
							storePermission.setBaseParam("groupId", Ext.getCmp("dc_menu_user").getValue());
							storePermission.setBaseParam("dc_user_id", Ext.getCmp("idID").getValue());
							storePermission.load();

						} else
							alert("กรุณาเลือกกลุ่มการใช้งานเมนูก่อน");
					}*/
            handler: function () {
              var form = Ext.getCmp("form-widgets").getForm();
              if (form.isValid()) {
                form.submit({
                  url: "api/mnDcUserDcGroupMenu.php",
                  params: {
                    saveGroupMenu: true,
                    groupId: Ext.getCmp("dc_menu_user").getValue(),
                    dc_user_id: Ext.getCmp("idID").getValue(),
                  },
                  success: function (form, action) {
                    storePermission.reload();
                    store.reload();
                    Ext.getCmp("role-form-mode").setValue();
                    Ext.getCmp("tabpanel1").getStore().reload();
                    Ext.getCmp("contenterCenter").setActiveTab("tabpanel1");
                    Ext.getCmp("tabpanel2").setDisabled(true);
                  },
                  failure: function (form, action) {
                    switch (action.failureType) {
                      case Ext.form.Action.CLIENT_INVALID:
                        Ext.Msg.alert("Failure", "Form fields may not be submitted with invalid values");
                        break;
                      case Ext.form.Action.CONNECT_FAILURE:
                        Ext.Msg.alert("Failure", "Ajax communication failed");
                        break;
                      case Ext.form.Action.SERVER_INVALID:
                        Ext.Msg.alert("Failure", action.result.msg);
                    }
                  },
                });
              } else {
                Ext.Msg.alert("Failure", "Failure");
              }
            },
          },

          new Ext.ux.maximgb.tg.GridPanel({
            store: storePermission,
            id: "gridPermission",
            master_column_id: "menu",
            height: 450,
            deferRowRender: false,
            tools: [
              {
                id: "down",
                on: {
                  click: function () {
                    storePermission.expandAll();
                  },
                },
              },
              {
                id: "up",
                on: {
                  click: function () {
                    storePermission.collapseAll();
                  },
                },
              },
            ],
            cm: new Ext.grid.ColumnModel({
              defaults: {
                width: 120,
                sortable: true,
              },
              columns: [
                {
                  id: "menu",
                  header: "MENU",
                  width: 360,
                  sortable: true,
                  dataIndex: "menu",
                },
                {
                  header: "แสดง",
                  align: "center",
                  width: 100,
                  sortable: true,
                  id: "i_show",
                  dataIndex: "i_show",
                  renderer: i_showFunc,
                },
                {
                  header: "ดูข้อมูลตัวเอง",
                  width: 100,
                  align: "center",
                  sortable: true,
                  id: "i_read_self",
                  dataIndex: "i_read_self",
                  renderer: i_read_selfFunc,
                },
                {
                  header: "ดูข้อมูลตามหน่วยงาน",
                  width: 100,
                  align: "center",
                  sortable: true,
                  id: "i_read_cost",
                  dataIndex: "i_read_cost",
                  renderer: i_read_costFunc,
                },
                {
                  header: "ดูข้อมูลตามคณะ/ส่วนงาน",
                  align: "center",
                  width: 100,
                  sortable: true,
                  id: "i_read_all",
                  dataIndex: "i_read_all",
                  renderer: i_read_allFunc,
                },
                {
                  header: "ดูข้อมูลทั้งหมด",
                  align: "center",
                  width: 100,
                  sortable: true,
                  id: "i_read_overall",
                  dataIndex: "i_read_overall",
                  renderer: i_read_overallFunc,
                },
                {
                  header: "เพิ่ม",
                  align: "center",
                  width: 40,
                  sortable: true,
                  id: "i_per_add",
                  dataIndex: "i_per_add",
                  renderer: i_per_addFunc,
                },
                {
                  header: "แก้ไข",
                  align: "center",
                  width: 40,
                  sortable: true,
                  id: "i_per_update",
                  dataIndex: "i_per_update",
                  renderer: i_per_updateFunc,
                },
                {
                  header: "ลบ",
                  align: "center",
                  width: 40,
                  sortable: true,
                  id: "i_per_delete",
                  dataIndex: "i_per_delete",
                  renderer: i_per_deleteFunc,
                },
                { width: 25, dataIndex: "" },
              ],
            }),

            stripeRows: true,
            autoExpandColumn: "menu",
            title: "สิทธิ์ผู้ใช้งาน",
            viewConfig: {
              enableRowBody: true,
            },
          }),
        ],
        buttons: [
          {
            text: Ext.GLOBAL_BU_SAVE_TH,
            id: "buSave",
            handler: function () {
              var msg = "";
              if (Ext.getCmp("c_password").getValue() != Ext.getCmp("comfirm_pass").getValue()) {
                msg += "<span style='white-space: nowrap;'> Password ไม่ตรงกัน </span><br>";
              }
              if (msg == "") {
                var form = Ext.getCmp("form-widgets").getForm();
                Ext.getCmp("role-form-mode").setValue("Save");
                if (form.isValid()) {
                  form.submit({
                    params: {
                      jsonDtl: saveGrid(storePermission),
                    },
                    success: function (form, action) {
                      Ext.getCmp("role-form-mode").setValue();
                      Ext.getCmp("tabpanel1").getStore().reload();
                      Ext.getCmp("contenterCenter").setActiveTab("tabpanel1");
                      Ext.getCmp("tabpanel2").setDisabled(true);
                      storePermission.removeAll();
                    },
                    failure: function (form, action) {
                      switch (action.failureType) {
                        case Ext.form.Action.CLIENT_INVALID:
                          Ext.Msg.alert("Failure", "Form fields may not be submitted with invalid values");
                          break;
                        case Ext.form.Action.CONNECT_FAILURE:
                          Ext.Msg.alert("Failure", "Ajax communication failed");
                          break;
                        case Ext.form.Action.SERVER_INVALID:
                          Ext.Msg.alert("Failure", action.result.msg);
                      }
                    },
                  });
                } else {
                  Ext.Msg.alert("Failure", "Failure");
                }
              } else {
                Ext.Msg.alert("แจ้งเตือน", msg);
              }
            },
          },
          {
            text: "Cancel",
            handler: function () {
              Ext.getCmp("contenterCenter").setActiveTab("tabpanel1");
              Ext.getCmp("tabpanel2").setDisabled(true);
            },
          },
        ],
      },
    ],
  }; // form
  Ext.showLoadingMask();
  /*====================== CENTER ======================*/
  new Ext.Viewport({
    layout: "border",
    items: [
      new Ext.TabPanel({
        region: "center",
        border: false,
        activeTab: 1, //default Tab
        id: "contenterCenter",
        defaults: {
          autoScroll: true,
        },
        items: [gridMain, panelForm],
        listeners: {
          tabchange: function (panel, tab) {
            // console.log(panel.getActiveTab().id); //GET Event ID Tab
          },
        },
      }),
    ],
  });

  /*================ Event Handle ==================*/

  Ext.getCmp("tabpanel1").on("cellclick", cellClick, this);
  Ext.getCmp("contenterCenter").setActiveTab("tabpanel1");
  InfoMainGrid("tabpanel1", true, true, true, true, true, true);
  storePermission.on("load", function (e) {
    storePermission.expandAll();
  });
});
