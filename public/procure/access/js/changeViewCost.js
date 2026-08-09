Ext.onReady(function () {
  Ext.QuickTips.init();
  console.log("i_type_user : " + Ext.i_type_user);
  console.log(Ext.session);

  Ext.dc_cost = new Ext.data.JsonStore({
    autoLoad: false,
    url: "api/All_changeViewCost.php",
    baseParams: { type: "dc_cost", all: "all" },
    root: "data",
    idProperty: "id",
    fields: [{ name: "id" }, { name: "c_name" }],
  });

  Ext.dc_user = new Ext.data.JsonStore({
    autoLoad: false,
    url: "api/All_changeViewCost.php",
    baseParams: { type: "dc_user", all: "all" },
    root: "data",
    idProperty: "id",
    fields: [{ name: "id" }, { name: "c_name" }],
  });

  Ext.submitForm = function () {
    var msg = "";
    if (Ext.getCmp("i_view_by").getValue().inputValue == 1) {
      if (msg == "") {
        Ext.Ajax.request({
          url: "api/mn_changeViewCost.php",
          method: "POST",
          params: {
            dc_cost_id: Ext.getCmp("dc_cost_id").getValue(),
            dc_cost_name: Ext.getCmp("dc_cost_id").lastSelectionText,
          },
          success: function (result, request) {
            let jsonData = Ext.util.JSON.decode(result.responseText); //decode json
            if (jsonData.success == true) {
              Ext.Msg.alert("แจ้งเตือน", "เรียบร้อย");
            } else {
              Ext.MessageBox.alert("แจ้งเตือน", jsonData.msg);
            }
          },
          failure: function (result, request) {},
        });
      } else {
        Ext.Msg.alert("แจ้งเตือน", msg);
      }
    } else {
      var dc_user_id = Ext.getCmp("dc_user_id").getValue() == 0 ? 1 : Ext.getCmp("dc_user_id").getValue();
      Ext.Ajax.request({
        url: "login_1.php",
        method: "POST",
        params: {
          ss_user_id: dc_user_id,
        },
        success: function (result, request) {
          /*** NMU_PERMISSION ***/
          var iframe = document.createElement("iframe");
          iframe.style.visibility = "hidden";
          iframe.src = Ext.HostServer.ost_host + "://" + Ext.HostServer.nmu_permission_host + "/access/login_1.php?ss_user_id=" + dc_user_id;
          Ext.getCmp("login-form").getEl().dom.appendChild(iframe);

          /*** FM-NMU ***/
          var iframe = document.createElement("iframe");
          iframe.style.visibility = "hidden";
          iframe.src = Ext.HostServer.ost_host + "://" + Ext.HostServer.fm_nmu_host + "/access/login_1.php?ss_user_id=" + dc_user_id;
          Ext.getCmp("login-form").getEl().dom.appendChild(iframe);

          /*** NMU ***/
          var iframe = document.createElement("iframe");
          iframe.style.visibility = "hidden";
          iframe.src = Ext.HostServer.ost_host + "://" + Ext.HostServer.nmu_host + "/access/login_1.php?ss_user_id=" + dc_user_id;
          Ext.getCmp("login-form").getEl().dom.appendChild(iframe);

          // /*** NMU_EIS ***/
          // var iframe = document.createElement("iframe");
          // iframe.style.visibility = "hidden";
          // iframe.src = Ext.HostServer.ost_host + "://" + Ext.HostServer.nmu_eis_host + "/access/login_1.php?ss_user_id=" + dc_user_id;
          // Ext.getCmp("login-form").getEl().dom.appendChild(iframe);
          // let jsonData = Ext.util.JSON.decode(result.responseText); //decode json
          // if (jsonData.success == true) {
          Ext.Msg.alert("แจ้งเตือน", "เรียบร้อย");
          // } else {
          //   Ext.MessageBox.alert("แจ้งเตือน", jsonData.msg);
          // }
        },
        failure: function (result, request) {},
      });
    }
  };

  /* Listeners Enter	 */
  Ext.enterSubmit = {
    specialkey: function (f, e) {
      if (e.getKey() == e.ENTER) {
        Ext.submitForm();
      }
    },
  };

  var window = new Ext.Window({
    title: "กำหนดการเช้าใช้ระบบ",
    y: 150,
    width: 550,
    height: 150,
    layout: "fit",
    closeAction: "hide",
    closable: false,
    plain: true,
    bodyStyle: "padding:10px;",
    buttonAlign: "center",
    items: new Ext.form.FormPanel({
      id: "login-form",
      baseCls: "x-plain",
      items: [
        {
          xtype: "radiogroup",
          id: "i_view_by",
          fieldLabel: "",
          columns: [170, 170],
          items: [
            {
              boxLabel: "เข้าใช้โดย Admin",
              name: "i_view_by",
              inputValue: 1,
              checked: true,
            },
            {
              boxLabel: "เข้าใช้โดย User",
              name: "i_view_by",
              inputValue: 2,
            },
          ],
          listeners: {
            change: function (combo, newValue) {
              if (Ext.getCmp("i_view_by").getValue().inputValue == 1) {
                Ext.getCmp("dc_cost_id").show();
                Ext.getCmp("dc_user_id").hide();
              } else {
                Ext.getCmp("dc_cost_id").hide();
                Ext.getCmp("dc_user_id").show();
              }
            },
          },
        },
        new Ext.form.ComboBox({
          id: "dc_cost_id",
          fieldLabel: "หน่วยงาน",
          store: Ext.dc_cost,
          valueField: "id",
          displayField: "c_name",
          mode: "local",
          triggerAction: "all",
          emptyText: "กรุณาเลือก...",
          width: 400,
          forceSelection: true,
          selectOnFocus: true,
          typeAhead: false,
          // value: "0",
          listeners: {
            change: function (combo, newValue) {
              if (newValue == "") {
                combo.setValue(0);
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
        new Ext.form.ComboBox({
          id: "dc_user_id",
          fieldLabel: "เลือกผู้ใช้งาน",
          store: Ext.dc_user,
          valueField: "id",
          displayField: "c_name",
          mode: "local",
          triggerAction: "all",
          emptyText: "กรุณาเลือก...",
          width: 400,
          forceSelection: true,
          selectOnFocus: true,
          typeAhead: false,
          hidden: true,
          // value: "0",
          listeners: {
            change: function (combo, newValue) {
              if (newValue == "") {
                combo.setValue(0);
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
      defaults: { allowBlank: false },
      listeners: {
        afterrender: function (formPanel) {
          Ext.dc_cost.load({
            callback: function (records, operation, success) {
              if (success) {
                Ext.getCmp("dc_cost_id").setValue(Ext.session.dc_cost_id == 3 ? 0 : Ext.session.dc_cost_id);
              }
            },
          });
          Ext.dc_user.load({
            callback: function (records, operation, success) {
              if (success) {
                Ext.getCmp("dc_user_id").setValue(Ext.session.user_id == 1 ? 0 : Ext.session.user_id);
              }
            },
          });
        },
      },
    }),
    buttons: [
      {
        text: "ยันยืน",
        formBind: false,
        handler: function () {
          Ext.submitForm();
        },
      },
    ],
    listeners: {
      afterrender: function (window) {
        // Ext.getCmp("dc_cost_id").setValue("115");
      },
    },
  }).show();
});
