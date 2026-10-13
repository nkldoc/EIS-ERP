/* global Ext */
Ext.onReady(function () {
  Ext.QuickTips.init();
  Ext.idRep = "frm-repTor";
  //Spring Boot cross context
  Ext.urlReport = true ? "../../reports/repSpTorExp" : "../../reports/printr.php?get=true"; //DEBUG
  // Ext.urlReport = false ? "../../reports/repSpTorExp" : "../../reports/printr.php?get=true"; //DEBUG
  // Spring Boot
    Ext.titleReport = "การจับคู่บัญชีเจ้าหนี้และค่าใช้จ่ายด้วนวัสดุ";
    Ext.storeAccInv = new Ext.data.JsonStore({
        storeId: 'myStore1',
        autoLoad: true,
        url: './api/All_DcExpense.php',
        root: 'data',
        baseParams: {type: 'storeAccSpAccInv'}, //Permission i_read
        idProperty: 'id',
        totalProperty: 'totalCount',
        fields: ['id', 'dc_acc_id', 'dc_acc_inv_id', 'txtdc_acc_inv_idID', 'txtdc_acc_idID']
    });
    /*dc_acc_id: "1"
     dc_acc_inv_id: "2"
     id: "1"
     txtdc_acc_id1ID: "10100000000 สินทรัพย์หมุนเวียน"
     txtdc_acc_idID: "10000000000 สินทรัพย์"*/
    Ext.storeAccExpense = new Ext.data.JsonStore({
        storeId: 'myStore1',
        autoLoad: true,
        url: './api/All_DcExpense.php',
        root: 'data',
        baseParams: {type: 'storeAccExpense'}, //Permission i_read
        idProperty: 'id',
        totalProperty: 'totalCount',
        fields: ['id', 'c_code', 'c_name']
    });
    var columnMini = [
        {header: "ID System", sortable: true, hidden: true, dataIndex: 'id'},
        {header: "รหัส", sortable: true, dataIndex: 'c_code', },
        {header: "ชื่อ"
            , sortable: true
            , id: 'c_name'
            , dataIndex: 'c_name',
            renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                metaData.attr = "style='cursor:pointer';";
                return value;
            }
        }
    ];
    Ext.PopAccForm = new Ext.ux.Poplov({
        text: 'บัญชีเจ้าหนี้',
        id: 'dc_acc_idID', //go to relation	
        iconCls: 'page_magnify',
        valueHidden: 'dc_acc_id', //go to hidden
        store: Ext.storeAccExpense,
        headerGrid: columnMini,
        widthText: 500,
        fieldLabel: 'บัญชีเจ้าหนี้ '
    });
    Ext.PopAcc1Form = new Ext.ux.Poplov({
        text: 'บัญชีค่าค่าใช้จ่ายด้านวัสดุ',
        id: 'dc_acc_inv_idID', //go to relation	
        iconCls: 'page_magnify',
        valueHidden: 'dc_acc_inv_id', //go to hidden
        store: Ext.storeAccExpense,
        headerGrid: columnMini,
        widthText: 500,
        fieldLabel: 'บัญชีค่าค่าใช้จ่ายด้านวัสดุ ',
        hidden : true
    });
  var panelForm = new Ext.Panel({
    region: "center",
    title: Ext.titleReport,
    border: false,
    stripeRows: true,
    loadMask: true,
    items: [
      {
        xtype: "form",
                id: Ext.idRep,
                url: "tor/api/mnExpenseController.php",
                frame: true,
                id: 'frm-acc1ID',
        labelAlign: "right",
        labelWidth: 200,
        bodyStyle: { padding: "10px 20px" },
        defaults: { anchor: "100%", msgTarget: "side", allowBlank: false },
        items: [
          {
            xtype: "container",
            layout: "hbox",
            align: "stretch",
            RemoveHeight: true,
            defaults: { xtype: "fieldset", flex: 1, margins: "0px 3px", autoHeight: true },
            items: [
              {
                                title: "บันทึกค่าการจับคู่บัญชี",
                RemoveCls: "x-box-item",
                defaults: { labelStyle: "width:200px;", allowBlank: true },
                                items: [{
                                        xtype: 'hidden',
                                        name: 'id'
                                    }, Ext.PopAccForm.mini, Ext.PopAcc1Form.mini, ],
              },
            ],
          },
                ],
                listeners: {
                    afterrender: function () {

                        Ext.storeAccInv.reload({
                            callback: function (records, operation, success) {
                                if (success) {
//                                    console.log(records[0]);
                                    Ext.getCmp('frm-acc1ID').getForm().loadRecord(records[0]);
                                }
                            },
                        });

                    }
                },
        buttonAlign: "left",
                buttons: [{
                        text: 'บันทึกคู่บัญชี',
                        handler: function () {
                            var form = Ext.getCmp('frm-acc1ID').getForm();
                            form.submit({
                                waitMsg: "Saving Data...",
                                success: function (form, action) {
                                    Ext.Msg.alert("Success", action.result.msg, function (form, action) {
                                        Ext.storeAccInv.reload({
                                            callback: function (records, operation, success) {
                                                if (success) {
                                                    console.log(records[0]);
                                                    Ext.getCmp('frm-acc1ID').getForm().loadRecord(records[0]);
                                                }
                                            },
                                        });
                                    });
                                },
                                failure: function (form, action) {
                                    switch (action.failureType) {
                                        case Ext.form.Action.CLIENT_INVALID:
                                            Ext.Msg.alert("Failure", "Form fields may not be submitted with invalid values");
                                            break;
                                        case Ext.form.Action.CONNECT_FAILURE:
                                            Ext.Msg.alert("Failure", "พบข้อผิดพลาดในการเชื่อต่อเครือข่าย");
                                            break;
                                        case Ext.form.Action.SERVER_INVALID:
                                            Ext.Msg.alert("Failure", action.result.msg);
                                    }
                                },
                            });

                        },
                    }] //setButtonReport(),
      },
        ],

  });
  new Ext.Viewport({
    layout: "border",
    items: panelForm,
  });
});
