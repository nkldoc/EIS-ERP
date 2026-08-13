Ext.onReady(function() {
  Ext.QuickTips.init();

  /* =============================================== */
  title_panel = "แยกรายละเอียดใบเบิก (E-Phis)";
  /* =============================================== */

  store = new Ext.data.JsonStore({
    id: "store",
    autoDestroy: true,
    autoLoad: false,
    url: "api/List_ImpRequestItemEphis.php",
    baseParams: { type: "imp_request_ephis_dtl", i_read: user_right_read },  
    root: "data",
    idProperty: "id",
    totalProperty: "totalCount",
    fields: [
      { name: "no" },
      { name: "id" },
      { name: "hdr_id" },
      { name: "c_gx_code" },
      { name: "c_code" },
      { name: "c_request" },
      { name: "c_request_desc" }, 
      { name: "d_doc_date" },
      { name: "c_comment" },
      { name: "f_dr" }, 
      { name: "f_cr" },
      { name: "f_inv" },
      { name: "f_vat" },
      { name: "f_tax_personal" },
      { name: "f_tax_corporate" },
      { name: "f_social_security" },
      { name: "f_fine" },
      { name: "c_creditor" }
    ]
  });
 
  Ext.store_dc_acc_last = new Ext.data.JsonStore({
    autoLoad: true, 
    url: "api/All_ImpRequestItemEphis.php",
    baseParams: { type: "dc_acc" },
    root: "data",
    idProperty: "id",
    fields: ["id", "acc_full"]
  });      

// storeYear
let years = [];
let currentTime = new Date();
let now = currentTime.getFullYear() + 1;
let id = currentTime.getFullYear() - 3;
while (id <= now) {
  let c_name = id + 543;
  years.push({ id, c_name });
  id++;
}

Ext.store_year = new Ext.data.JsonStore({
  fields: ["id", "c_name"],
  data: years
});

Ext.store_type_year = new Ext.data.JsonStore({
  fields: ["id", "c_name"],
  data: [
    { id: "1", c_name: "ปีงบประมาณ" },
    { id: "2", c_name: "เหลื่อมปี" }
  ]
});

Ext.store_cal_gl = new Ext.data.JsonStore({
  fields: ["id", "c_name"],
  data: [
    { id: "1", c_name: "เงินเดือนจ่ายพนักงาน" },
    { id: "2", c_name: "จ่ายให้บริษัท" }
  ]
});


  // pagingBar
  pagingBar = new Ext.PagingToolbar({
    pageSize: 20,
    store: store,
    displayInfo: true,
    displayMsg: "Displaying topics {0} - {1} of {2}"
  });

  function controllTab(record, butt) {
    if (butt == "edit") {

      formRequestItems(record);

    } else if (butt == "delete") {
      new Ext.Window({
        id: "win-msg-delete",
        title: "แจ้งเตือน",
        modal: true,
        width: 250,
        height: 130,
        html: "ท่านต้องการที่จะลบข้อมูล ?",
        buttons: [
          {
            text: "Confirm",
            handler: function() {
              Ext.getCmp("win-msg-delete")
                .getEl()
                .mask("Please wait...", "x-mask-loading");
              Ext.Ajax.request({
                url: "api/mn_ImpRequestItemEphis.php",
                method: "POST",
                params: {
                  mode: "DELETE",
                  imp_request_ephis_dtl_id: record.data.id
                },
                success: function(result, request) {
                  var jsonData = Ext.util.JSON.decode(result.responseText); // decode json
                  Ext.getCmp("win-msg-delete").destroy();
                  store.reload();
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
              Ext.getCmp("win-msg-delete").destroy();
            }
          }
        ]
      }).show();
    }
  } // controllTab

  formRequestItems = function(vv) {

    var dc_expense_acc_vsn = [];
    var store_dc_acc_last = [];
    var ChangePrice = function() {
      var dd = new Object();

     // alert('IN DB Money DR='+vv.data.f_dr+' CR='+vv.data.f_cr+' INV='+vv.data.f_inv); 

      dd.f_dr               = parseInt(0);
      dd.f_cr               = parseInt(0);
      dd.f_inv              = parseInt(0);
      dd.f_vat              = parseInt(0);
      dd.f_tax_personal     = parseInt(0);
      dd.f_tax_corporate    = parseInt(0);
      dd.f_social_security  = parseInt(0);
      dd.f_fine             = parseInt(0);

      $("input[id^=no]").each(function(i, val) {
        // ROW RUN
        var index = val.value;
        if (Ext.getCmp("f_dr[" + index + "]").getValue() != "") {
          dd.f_dr += parseFloat(
            Ext.getCmp("f_dr[" + index + "]")
              .getValue()
              .replace(/,/g, ""),
            2
          );
        }

        if (Ext.getCmp("f_cr[" + index + "]").getValue() != "") {
          dd.f_cr += parseFloat(
            Ext.getCmp("f_cr[" + index + "]")
              .getValue()
              .replace(/,/g, ""),
            2
          );
        }

        if (Ext.getCmp("f_inv[" + index + "]").getValue() != "") {
          dd.f_inv += parseFloat(
            Ext.getCmp("f_inv[" + index + "]")
              .getValue()
              .replace(/,/g, ""),
            2
          );
        }
        
        if (Ext.getCmp("f_vat[" + index + "]").getValue() != "") {
          dd.f_vat += parseFloat(
            Ext.getCmp("f_vat[" + index + "]")
              .getValue()
              .replace(/,/g, ""),
            2
          );
        }

        if (Ext.getCmp("f_tax_personal[" + index + "]").getValue() != "") {
          dd.f_tax_personal += parseFloat(
            Ext.getCmp("f_tax_personal[" + index + "]")
              .getValue()
              .replace(/,/g, ""),
            2
          );
        }

        if (Ext.getCmp("f_tax_corporate[" + index + "]").getValue() != "") {
          dd.f_tax_corporate += parseFloat(
            Ext.getCmp("f_tax_corporate[" + index + "]")
              .getValue()
              .replace(/,/g, ""),
            2
          );
        }

        if (Ext.getCmp("f_social_security[" + index + "]").getValue() != "") {
          dd.f_social_security += parseFloat(
            Ext.getCmp("f_social_security[" + index + "]")
              .getValue()
              .replace(/,/g, ""),
            2
          );
        }

        if (Ext.getCmp("f_fine[" + index + "]").getValue() != "") {
          dd.f_fine += parseFloat(
            Ext.getCmp("f_fine[" + index + "]")
              .getValue()
              .replace(/,/g, ""),
            2
          );
        }

  
      });

      $("#Ext_dd.f_dr").html(floatRenderer(dd.f_dr.toFixed(2)));
      $("#Ext_dd.f_cr").html(floatRenderer(dd.f_cr.toFixed(2))); 
      $("#Ext_dd.f_inv").html(floatRenderer(dd.f_inv.toFixed(2)));
      $("#Ext_dd.f_vat").html(floatRenderer(dd.f_vat.toFixed(2)));
      $("#Ext_dd.f_tax_personal").html(floatRenderer(dd.f_tax_personal.toFixed(2)));
      $("#Ext_dd.f_tax_corporate").html(floatRenderer(dd.f_tax_corporate.toFixed(2)));
      $("#Ext_dd.f_social_security").html(floatRenderer(dd.f_social_security.toFixed(2)));
      $("#Ext_dd.f_fine").html(floatRenderer(dd.f_fine.toFixed(2)));
      ChangeTotal(dd);
    };

    var ChangeTotal = function(dd) {
      var sum_f_dr_t              = parseFloat(dd.f_dr) - parseFloat(vv.data.f_dr);
      var sum_f_cr_t              = parseFloat(dd.f_cr) - parseFloat(vv.data.f_cr);
      var sum_f_inv_t             = parseFloat(dd.f_inv) - parseFloat(vv.data.f_inv); 
      var sum_f_vat_t             = parseFloat(dd.f_vat) - parseFloat(vv.data.f_vat);
      var sum_f_tax_personal_t    = parseFloat(dd.f_tax_personal) - parseFloat(vv.data.f_tax_personal);
      var sum_f_tax_corporate_t   = parseFloat(dd.f_tax_corporate) - parseFloat(vv.data.f_tax_corporate);
      var sum_f_social_security_t = parseFloat(dd.f_social_security) - parseFloat(vv.data.f_social_security);
      var sum_f_fine_t            = parseFloat(dd.f_fine) - parseFloat(vv.data.f_fine);

      
      // จำนวนรวมทั้งหมด
      $("#Ext_sum_f_dr").html(floatRenderer(parseFloat(dd.f_dr).toFixed(2)));
      $("#Ext_sum_f_cr").html(floatRenderer(parseFloat(dd.f_cr).toFixed(2)));
      $("#Ext_sum_f_inv").html(floatRenderer(parseFloat(dd.f_inv).toFixed(2))); 
      $("#Ext_sum_f_vat").html(floatRenderer(parseFloat(dd.f_vat).toFixed(2))); 
      $("#Ext_sum_f_tax_personal").html(floatRenderer(parseFloat(dd.f_tax_personal).toFixed(2)));  
      $("#Ext_sum_f_tax_corporate").html(floatRenderer(parseFloat(dd.f_tax_corporate).toFixed(2)));  
      $("#Ext_sum_f_social_security").html(floatRenderer(parseFloat(dd.f_social_security).toFixed(2)));
      $("#Ext_sum_f_fine").html(floatRenderer(parseFloat(dd.f_fine).toFixed(2)));
	
      // จำนวนรวมใบเบิก
      $("#Ext_sum_f_dr_Exp").html(floatRenderer(parseFloat(vv.data.f_dr).toFixed(2)));
      $("#Ext_sum_f_cr_Exp").html(floatRenderer(parseFloat(vv.data.f_cr).toFixed(2)));
      $("#Ext_sum_f_inv_Exp").html(floatRenderer(parseFloat(vv.data.f_inv).toFixed(2)));
	    $("#Ext_sum_f_vat_Exp").html(floatRenderer(parseFloat(vv.data.f_vat).toFixed(2)));
      $("#Ext_sum_f_tax_personal_Exp").html(floatRenderer(parseFloat(vv.data.f_tax_personal).toFixed(2)));
	    $("#Ext_sum_f_tax_corporate_Exp").html(floatRenderer(parseFloat(vv.data.f_tax_corporate).toFixed(2)));
	    $("#Ext_sum_f_social_security_Exp").html(floatRenderer(parseFloat(vv.data.f_social_security).toFixed(2)));
      $("#Ext_sum_f_fine_Exp").html(floatRenderer(parseFloat(vv.data.f_fine).toFixed(2)));

 
      // หักลบยอด
      $("#Ext_sum_f_dr_t").html(floatRenderer(parseFloat(sum_f_dr_t).toFixed(2)));
      $("#Ext_sum_f_cr_t").html(floatRenderer(parseFloat(sum_f_cr_t).toFixed(2)));
      $("#Ext_sum_f_inv_t").html(floatRenderer(parseFloat(sum_f_inv_t).toFixed(2)));
      $("#Ext_sum_f_vat_t").html(floatRenderer(parseFloat(sum_f_vat_t).toFixed(2)));
      $("#Ext_sum_f_tax_personal_t").html(floatRenderer(parseFloat(sum_f_tax_personal_t).toFixed(2)));   
      $("#Ext_sum_f_tax_corporate_t").html(floatRenderer(parseFloat(sum_f_tax_corporate_t).toFixed(2)));
      $("#Ext_sum_f_social_security_t").html(floatRenderer(parseFloat(sum_f_social_security_t).toFixed(2)));
      $("#Ext_sum_f_fine_t").html(floatRenderer(parseFloat(sum_f_fine_t).toFixed(2)));

 
    };

    // ============================ myFunc ============================ //
    var myFunc = function(index, v = null) {
 // console.log(v);console.log(index);
 
      new Ext.form.ComboBox({
        id: "i_type_year[" + index + "]",
        mode: "local",
        width: 120,
        store: Ext.store_type_year,
        valueField: "id",
        displayField: "c_name",
        triggerAction: "all",
        forceSelection: true,
        selectOnFocus: true,
        typeAhead: false,
        editable: false,
        emptyText: "กรุณาเลือก...", 
        renderTo: "Ext_i_type_year[" + index + "]"
      });

      new Ext.form.ComboBox({
        id: "c_budget_year[" + index + "]",
        mode: "local",
        width: 100,
        store: Ext.store_year,
        valueField: "id",
        displayField: "c_name",
        triggerAction: "all",
        forceSelection: true,
        selectOnFocus: true,
        typeAhead: false,
        emptyText: "กรุณาเลือก...", 
        renderTo: "Ext_c_budget_year[" + index + "]"
      })

      new Ext.form.ComboBox({
        id: "i_cal_gl[" + index + "]",
        mode: "local",
        width: 150,
        store: Ext.store_cal_gl,
        valueField: "id",
        displayField: "c_name",
        triggerAction: "all",
        forceSelection: true,
        selectOnFocus: true,
        typeAhead: false,
        editable: false,
        emptyText: "กรุณาเลือก...", 
        renderTo: "Ext_i_cal_gl[" + index + "]"
      })

      new Ext.form.ComboBox({
        id: "dc_acc_id[" + index + "]",
        mode: "local",
        width: 500,
        store:Ext.store_dc_acc_last,
        loadMask: true,
        valueField: "id",
        displayField: "acc_full",
        triggerAction: "all",
        forceSelection: true,
        selectOnFocus: true,
        typeAhead: false,
        emptyText: "กรุณาเลือก...", 
        renderTo: "Ext_dc_acc_id[" + index + "]"
      }); 


      new Ext.form.TextField({ 
        id: "f_dr[" + index + "]",
        style: "text-align: right",
        width: 100,
        listeners: {
          afterrender: function() {
            this.fn = function() {
              this.setValue(floatRenderer(floatMinus(this.getValue().replace(/,/g, ""), 2)));
              ChangePrice();
            };
          },
          Change: function(value) {
            this.fn();
          }
        },
        renderTo: "Ext_f_dr[" + index + "]"
      });

      new Ext.form.TextField({ 
        id: "f_cr[" + index + "]",
        style: "text-align: right",
        width: 100,
        listeners: {
          afterrender: function() {
            this.fn = function() {
              this.setValue(floatRenderer(floatMinus(this.getValue().replace(/,/g, ""), 2)));
              ChangePrice();
            };
          },
          Change: function(value) {
            this.fn();
          }
        },
        renderTo: "Ext_f_cr[" + index + "]"
      });

      new Ext.form.TextField({ 
        id: "f_inv[" + index + "]",
        style: "text-align: right",
        width: 100,
        listeners: {
          afterrender: function() {
            this.fn = function() {
              this.setValue(floatRenderer(floatMinus(this.getValue().replace(/,/g, ""), 2)));
              ChangePrice();
            };
          },
          Change: function(value) {
            this.fn();
          }
        },
        renderTo: "Ext_f_inv[" + index + "]"
      });

      new Ext.form.TextField({ 
        id: "f_vat[" + index + "]",
        style: "text-align: right",
        width: 100,
        listeners: {
          afterrender: function() {
            this.fn = function() {
              this.setValue(floatRenderer(floatMinus(this.getValue().replace(/,/g, ""), 2)));
              ChangePrice();
            };
          },
          Change: function(value) {
            this.fn();
          }
        },
        renderTo: "Ext_f_vat[" + index + "]"
      });

      new Ext.form.TextField({ 
        id: "f_tax_personal[" + index + "]",
        style: "text-align: right",
        width: 100,
        listeners: {
          afterrender: function() {
            this.fn = function() {
              this.setValue(floatRenderer(floatMinus(this.getValue().replace(/,/g, ""), 2)));
              ChangePrice();
            };
          },
          Change: function(value) {
            this.fn();
          }
        },
        renderTo: "Ext_f_tax_personal[" + index + "]"
      });

      new Ext.form.TextField({ 
        id: "f_tax_corporate[" + index + "]",
        style: "text-align: right",
        width: 100,
        listeners: {
          afterrender: function() {
            this.fn = function() {
              this.setValue(floatRenderer(floatMinus(this.getValue().replace(/,/g, ""), 2)));
              ChangePrice();
            };
          },
          Change: function(value) {
            this.fn();
          }
        },
        renderTo: "Ext_f_tax_corporate[" + index + "]"
      });

      new Ext.form.TextField({ 
        id: "f_social_security[" + index + "]",
        style: "text-align: right",
        width: 100,
        listeners: {
          afterrender: function() {
            this.fn = function() {
              this.setValue(floatRenderer(floatMinus(this.getValue().replace(/,/g, ""), 2)));
              ChangePrice();
            };
          },
          Change: function(value) {
            this.fn();
          }
        },
        renderTo: "Ext_f_social_security[" + index + "]"
      });

      new Ext.form.TextField({ 
        id: "f_fine[" + index + "]",
        style: "text-align: right",
        width: 100,
        listeners: {
          afterrender: function() {
            this.fn = function() {
              this.setValue(floatRenderer(floatMinus(this.getValue().replace(/,/g, ""), 2)));
              ChangePrice();
            };
          },
          Change: function(value) {
            this.fn();
          }
        },
        renderTo: "Ext_f_fine[" + index + "]"
      });
 

      // new Ext.form.TextField({ 
      //   id: "c_acc_code_imp[" + index + "]",
      //   style: "text-align: left",
      //   width: 100,
      //   listeners: {
      //     afterrender: function() {
      //       this.fn = function() { 
      //       };
      //     },
      //     Change: function(value) {
      //       this.fn();
      //     }
      //   },
      //   renderTo: "Ext_c_acc_code_imp[" + index + "]"
      // });

      // new Ext.form.TextField({ 
      //   id: "c_acc_name_imp[" + index + "]",
      //   style: "text-align: left",
      //   width: 300,
      //   listeners: {
      //     afterrender: function() {
      //       this.fn = function() { 
      //       };
      //     },
      //     Change: function(value) {
      //       this.fn();
      //     }
      //   },
      //   renderTo: "Ext_c_acc_name_imp[" + index + "]"
      // });
      
      // ลบ
      new Ext.Button({
        id: "delete[" + index + "]",
        icon: "../images/icons/bin.gif",
        tooltip: "ลบรายการ",
        handler: function() {
          $("#myTable > tbody > #no\\[" + index + "\\]").remove();
          ChangePrice();
        },
        renderTo: "Ext_delete[" + index + "]"
      });

      if (v != null) {
        if (v.dc_acc_id > 0) {
          Ext.getCmp("win-pop-dtl")
            .getEl()
            .mask("Please wait...", "x-mask-loading"); 

            Ext.getCmp("i_type_year[" + index + "]").setValue(v.i_type_year);
            Ext.getCmp("c_budget_year[" + index + "]").setValue(v.c_budget_year);
            Ext.getCmp("i_cal_gl[" + index + "]").setValue(v.i_cal_gl);
            Ext.getCmp("dc_acc_id[" + index + "]").setValue(v.dc_acc_id);
            // Ext.getCmp("c_acc_code_imp[" + index + "]").setValue(v.c_acc_code_imp);
            // Ext.getCmp("c_acc_name_imp[" + index + "]").setValue(v.c_acc_name_imp);
          
            
        }

        if (v.f_dr != "") {
          Ext.getCmp("f_dr[" + index + "]").setValue(v.f_dr);
          Ext.getCmp("f_dr[" + index + "]").fn();
        }

        if (v.f_cr != "") {
          Ext.getCmp("f_cr[" + index + "]").setValue(v.f_cr);
          Ext.getCmp("f_cr[" + index + "]").fn();
        }

        if (v.f_inv != "") {
          Ext.getCmp("f_inv[" + index + "]").setValue(v.f_inv);
          Ext.getCmp("f_inv[" + index + "]").fn();
        }        
 
        if (v.f_vat != "") {
          Ext.getCmp("f_vat[" + index + "]").setValue(v.f_vat);
          Ext.getCmp("f_vat[" + index + "]").fn();
        }     

        if (v.f_tax_personal != "") {
          Ext.getCmp("f_tax_personal[" + index + "]").setValue(v.f_tax_personal);
          Ext.getCmp("f_tax_personal[" + index + "]").fn();
        }     

        if (v.f_tax_corporate != "") {
          Ext.getCmp("f_tax_corporate[" + index + "]").setValue(v.f_tax_corporate);
          Ext.getCmp("f_tax_corporate[" + index + "]").fn();
        }     

        if (v.f_social_security != "") {
          Ext.getCmp("f_social_security[" + index + "]").setValue(v.f_social_security);
          Ext.getCmp("f_social_security[" + index + "]").fn();
        }     

        if (v.f_fine != "") {
          Ext.getCmp("f_fine[" + index + "]").setValue(v.f_fine);
          Ext.getCmp("f_fine[" + index + "]").fn();
        }     
 

      }
    }; // myFunc

    SaveDtl = function() {
      var msg = "";
      var jsonArr = [];

      $("input[id^=no]").each(function(i, val) {
        var dd = "";
        var index = val.value;

        if (Ext.getCmp("dc_acc_id[" + index + "]").getValue() == "") {
          dd += ", ผังบัญชี";
        }
  
        if (dd != "") {
          msg += "ลำดับที่ " + (parseInt(index) + 1) + " กรุณาตรวจสอบ ( " + dd.substring(2) + " )<br>";
        }

        jsonArr.push({
          f_dr: Ext.getCmp("f_dr[" + index + "]")
            .getValue()
            .replace(/,/g, ""),
          f_cr: Ext.getCmp("f_cr[" + index + "]")
            .getValue()
            .replace(/,/g, ""),
          f_inv: Ext.getCmp("f_inv[" + index + "]")
            .getValue()
            .replace(/,/g, ""),
          f_vat: Ext.getCmp("f_vat[" + index + "]")
            .getValue()
            .replace(/,/g, ""),
          f_tax_personal: Ext.getCmp("f_tax_personal[" + index + "]")
            .getValue()
            .replace(/,/g, ""),
          f_tax_corporate: Ext.getCmp("f_tax_corporate[" + index + "]")
            .getValue()
            .replace(/,/g, ""),
          f_social_security: Ext.getCmp("f_social_security[" + index + "]")
            .getValue()
            .replace(/,/g, ""),
          f_fine: Ext.getCmp("f_fine[" + index + "]")
            .getValue()
            .replace(/,/g, ""),
          i_type_year: Ext.getCmp("i_type_year[" + index + "]").getValue(),
          c_budget_year: Ext.getCmp("c_budget_year[" + index + "]").getValue(),
          i_cal_gl: Ext.getCmp("i_cal_gl[" + index + "]").getValue(),
          dc_acc_id: Ext.getCmp("dc_acc_id[" + index + "]").getValue() 
        });
      });

      if (msg == "") {
        Ext.getCmp("win-pop-dtl")
          .getEl()
          .mask("Please wait...", "x-mask-loading");
        $.ajax({
          url: "api/mn_ImpRequestItemEphis.php",
          type: "POST",
          data: {
            mode: "ADD_ITEM",
            imp_request_ephis_hdr_id: vv.data.hdr_id,
            imp_request_ephis_dtl_id: vv.data.id,
            data: JSON.stringify(jsonArr)
          },
          success: function(result) {
            Ext.getCmp("win-pop-dtl")
              .getEl()
              .unmask();
            var data = $.parseJSON(result);
            if (data.success == true) {
              Ext.Msg.alert("แจ้งเตือน", "บันทึกรายการเรียบร้อย");
              store.load();
              Ext.getCmp("win-pop-dtl").destroy();
            }
          }
        });
      } else {
        Ext.Msg.alert("แจ้งเตือน", msg);
      }
    }; // saveDtl

    new Ext.Window({
      title: "แสดง" + title_panel,
      id: "win-pop-dtl",
      modal: true,
      preventBodyReset: true,
      closable: true,
      autoScroll: true,
      maximizable: true,
      // maximized: true, // เต็มจอ auto
      height: Ext.getBody().getViewSize().height * 0.99,
      width: Ext.getBody().getViewSize().width * 0.99,
      listeners: {
        afterrender: function(component) {
          // Create Row
          var tbody = "";

          Ext.getCmp("win-pop-dtl")
            .getEl()
            .mask("Please wait...", "x-mask-loading");
          $.ajax({
            url: "api/List_ImpRequestItemEphis.php",
            type: "POST",
            data: {
              type: "imp_request_ephis_item",
              imp_request_ephis_dtl_id: vv.data.id
            },
            success: function(result) {
              var obj = $.parseJSON(result);               

              if (obj.debug == true) {
                $.each(obj.data, function(index, v) {
                  var addBody = "";

                  // GEN TBODY
                  if (vv.data.c_gx_code != "") {
                    addBody += "<input id='no[" + index + "]' type='hidden' value='" + index + "'>";
                    addBody += "<td nowrap align='center' style='font-size:12px;'>" + (index + 1) + "</td>"; 
                    addBody += "<td align='right' style='font-size:12px;'>" + floatRenderer(v.f_dr) + "</td>";
                    addBody += "<td align='right' style='font-size:12px;'>" + floatRenderer(v.f_cr) + "</td>"; 

                    $("#myTable > tbody:last").append("<tr id='no[" + index + "]'>" + addBody + "</tr>");
                  } else {
                    addBody += "<input id='no[" + index + "]' type='hidden' value='" + index + "'>";
                    addBody += "<input id='item_id[" + index + "]' type='hidden' value='" + obj.data.imp_request_ephis_item_id + "'>";
                    addBody += "<td nowrap align='center'>" + (index + 1) + "</td>";
                    addBody += "<td id='Ext_i_type_year[" + index + "]' align='center'></td>";
                    addBody += "<td id='Ext_c_budget_year[" + index + "]' align='center'></td>";
                    addBody += "<td id='Ext_i_cal_gl[" + index + "]' align='center'></td>";
                    addBody += "<td id='Ext_dc_acc_id[" + index + "]' align='center'></td>";
                    addBody += "<td id='Ext_f_dr[" + index + "]' align='center'></td>";
                    addBody += "<td id='Ext_f_cr[" + index + "]' align='center'></td>";
                    addBody += "<td id='Ext_f_inv[" + index + "]' align='center'></td>";
                    addBody += "<td id='Ext_f_vat[" + index + "]' align='center'></td>";
                    addBody += "<td id='Ext_f_tax_personal[" + index + "]' align='center'></td>";
                    addBody += "<td id='Ext_f_tax_corporate[" + index + "]' align='center'></td>";
                    addBody += "<td id='Ext_f_social_security[" + index + "]' align='center'></td>";
                    addBody += "<td id='Ext_f_fine[" + index + "]' align='center'></td>";                    
                    // addBody += "<td id='Ext_c_acc_code_imp[" + index + "]' align='center'></td>";
                    // addBody += "<td id='Ext_c_acc_name_imp[" + index + "]' align='center'></td>";
                    addBody += "<td id='Ext_delete[" + index + "]' align='center'></td>";

                    $("#myTable > tbody:last").append("<tr id='no[" + index + "]'>" + addBody + "</tr>");

                    myFunc(index, v);
                    ChangePrice();
                  }
                });

                // SUM
                if (vv.data.c_gx_code != "") {
                  ChangeTotal(obj.arr);
                }

                Ext.getCmp("win-pop-dtl")
                  .getEl()
                  .unmask();
              }
            }
          });
        }
      },
      tbar: [
        { xtype: "label", text: "จำนวนแถว : " },
        "-",
        {
          id: "row-dtl",
          xtype: "idcardfield",
          width: 70,
          value: 1,
          autoCreate: { tag: "input", type: "text", autocomplete: "off", maxLength: 2 },
          emptyText: "จำนวนแถว",
          listeners: {
            change: function(obj, value) {
              if (value == "") {
                obj.setValue(1);
              }
            }
          }
        },
        "-",
        {
          text: "เพิ่มแถว",
          iconCls: "icon-add",
          disabled: vv.data.c_gx_code == "" ? false : true,
          handler: function(grid, rowIndex, colIndex) {
            var msg = "";

            if (msg == "") {
              for (var i = 1; i <= Ext.getCmp("row-dtl").getValue(); i++) {
                var addBody = "";
                var addFoot = "";

                var beforeIndex = parseInt($("#myTable > tbody > tr:last > input[id^=no]").val());
                var index = isNaN(beforeIndex) ? 0 : parseInt(beforeIndex) + 1;

                // TBODY
                addBody += "<input id='no[" + index + "]' type='hidden' value='" + index + "'>";
                addBody += "<input id='item_id[" + index + "]' type='hidden' value='0'>";
                addBody += "<td nowrap align='center' style='font-size:12px;'>" + (index + 1) + "</td>";
                addBody += "<td id='Ext_i_type_year[" + index + "]' align='center'></td>";
                addBody += "<td id='Ext_c_budget_year[" + index + "]' align='center'></td>";
                addBody += "<td id='Ext_i_cal_gl[" + index + "]' align='center'></td>";
                addBody += "<td id='Ext_dc_acc_id[" + index + "]' align='center'></td>";
                addBody += "<td id='Ext_f_dr[" + index + "]' align='center'></td>";
                addBody += "<td id='Ext_f_cr[" + index + "]' align='center'></td>";
                addBody += "<td id='Ext_f_inv[" + index + "]' align='center'></td>";
                addBody += "<td id='Ext_f_vat[" + index + "]' align='center'></td>";
                addBody += "<td id='Ext_f_tax_personal[" + index + "]' align='center'></td>";
                addBody += "<td id='Ext_f_tax_corporate[" + index + "]' align='center'></td>";
                addBody += "<td id='Ext_f_social_security[" + index + "]' align='center'></td>";
                addBody += "<td id='Ext_f_fine[" + index + "]' align='center'></td>";                       
                // addBody += "<td id='Ext_c_acc_code_imp[" + index + "]' align='center'></td>";
                // addBody += "<td id='Ext_c_acc_name_imp[" + index + "]' align='center'></td>";

                $("#myTable > tbody:last").append("<tr id='no[" + index + "]'>" + addBody + "</tr>");

                myFunc(index);
              }
            } else {
              Ext.MessageBox.alert("แจ้งเตือน", msg);
            }
          }
        },
        { xtype: "tbfill" },
        {
          xtype: "panel",
          html: '<div style="font-weight:bold; background:#f5f5f5; padding:5px;">' 
                  + "<div style='font-size: 15px; text-align: left;'><b>เลขที่ใบเบิก</b> : " + vv.data.c_request 
                  + "<br><b>เลขที่ตั้งหนี้</b> : " + vv.data.c_request_desc
                  + "<br><b>รายการ</b> : " + vv.data.c_comment
                  + "<br><b>ชื่อผู้รับเงิน</b> : " + vv.data.c_creditor + "</div>" 
                + "</div>"
        }
      ],
      html:
        "<div style='background:#fff; overflow:auto;'>" +
        "<style> #myTable > tfoot > tr > td { font-weight: bold; } </style>" +
        "<form id='form_save_dtl' name='form_save_dtl' method='POST'>" +
        "<table id='myTable' border='0' cellspacing='1' cellpadding='0' width='100%'>" +
        // headder
        "<thead class='x-grid3-header'>" +
        "<tr class='x-grid3-hd-row' height='20'>" +
        "<td nowrap>ลำดับที่</td>" + 
        "<td nowrap>เงื่อนไขงบประมาณ</td>" +
        "<td nowrap>ปีงบประมาณ</td>" +
        "<td nowrap>สถานะการบันทึกบัญชี</td>" +
        "<td nowrap>ผังบัญชี</td>" +
        "<td width=100 nowrap>จำนวนเงิน DR <br><font color=\'#9900CC\'>(* บันทึกบัญชี)</font></td>" +
        "<td width=100 nowrap>จำนวนเงิน CR <br><font color=\'#9900CC\'>(* บันทึกบัญชี)</font></td>" + 
        "<td nowrap>จำนวนขอเบิกทั้งสิ้น <br><font color=red>(** รายงานใบเบิก/ตั้งหนี้)</font></td>" +        
        "<td nowrap>จำนวนเงินภาษีมูลค่าเพิ่ม <br><font color=red>(** รายงานใบเบิก/ตั้งหนี้)</font></td>" +
        "<td nowrap>ภาษีเงินได้บุคคลธรรมดา <br><font color=red>(** รายงานใบเบิก/ตั้งหนี้)</font></td>" +
        "<td nowrap>ภาษีเงินได้นิติบุคคล <br><font color=red>(** รายงานใบเบิก/ตั้งหนี้)</font></td>" +
        "<td nowrap>ค่าประกันสังคม <br><font color=red>(** รายงานใบเบิก/ตั้งหนี้)</font></td>" +
        "<td nowrap>ค่าปรับ <br><font color=red>(** รายงานใบเบิก/ตั้งหนี้)</font></td>" +
        "<td nowrap width='40'>-</td>" +
        "</tr>" +
        "</thead>" +
        // body
        "<tbody></tbody>" +
        "<tfoot>" +
        "<tr>" +
        "<td></td>" +
        "<td></td>" +
        "<td></td>" +
        "<td></td>" +
        "<td nowrap align='right' style='font-size:12px;'><font color=blue>จำนวนรวมทั้งหมด</font></td>" +
        "<td nowrap id='Ext_sum_f_dr' align='right' style='font-size:12px;'></td>" +
        "<td nowrap id='Ext_sum_f_cr' align='right' style='font-size:12px;'></td>" + 
        "<td nowrap id='Ext_sum_f_inv' align='right' style='font-size:12px;'></td>" + 
        "<td nowrap id='Ext_sum_f_vat' align='right' style='font-size:12px;'></td>" +
        "<td nowrap id='Ext_sum_f_tax_personal' align='right' style='font-size:12px;'></td>" +
        "<td nowrap id='Ext_sum_f_tax_corporate' align='right' style='font-size:12px;'></td>" +
        "<td nowrap id='Ext_sum_f_social_security' align='right' style='font-size:12px;'></td>" +
        "<td nowrap id='Ext_sum_f_fine' align='right' style='font-size:12px;'></td>" + 
        "<td></td>" +
        "</tr>" +
        "<tr>" +
        "<td></td>" +
        "<td></td>" +
        "<td></td>" +
        "<td></td>" +
        "<td nowrap align='right' style='font-size:12px;'><font color=red>จำนวนรวมใบเบิก</font></td>" +
        "<td nowrap id='Ext_sum_f_dr_Exp' align='right' style='font-size:12px;'></td>" +
        "<td nowrap id='Ext_sum_f_cr_Exp' align='right' style='font-size:12px;'></td>" + 
        "<td nowrap id='Ext_sum_f_inv_Exp' align='right' style='font-size:12px;'></td>" +  
        "<td nowrap id='Ext_sum_f_vat_Exp' align='right' style='font-size:12px;'></td>" + 
        "<td nowrap id='Ext_sum_f_tax_personal_Exp' align='right' style='font-size:12px;'></td>" + 
        "<td nowrap id='Ext_sum_f_tax_corporate_Exp' align='right' style='font-size:12px;'></td>" + 
        "<td nowrap id='Ext_sum_f_social_security_Exp' align='right' style='font-size:12px;'></td>" + 
        "<td nowrap id='Ext_sum_f_fine_Exp' align='right' style='font-size:12px;'></td>" +  
        "<td></td>" +
        "</tr>" +
        "<tr>" +
        "<td></td>" +
        "<td></td>" +
        "<td></td>" +
        "<td></td>" +
        "<td nowrap align='right' style='font-size:12px;'>หักลบยอด</td>" +
        "<td nowrap id='Ext_sum_f_dr_t' align='right' style='font-size:12px;'></td>" +
        "<td nowrap id='Ext_sum_f_cr_t' align='right' style='font-size:12px;'></td>" + 
        "<td nowrap id='Ext_sum_f_inv_t' align='right' style='font-size:12px;'></td>" +  
        "<td nowrap id='Ext_sum_f_vat_t' align='right' style='font-size:12px;'></td>" + 
        "<td nowrap id='Ext_sum_f_tax_personal_t' align='right' style='font-size:12px;'></td>" + 
        "<td nowrap id='Ext_sum_f_tax_corporate_t' align='right' style='font-size:12px;'></td>" + 
        "<td nowrap id='Ext_sum_f_social_security_t' align='right' style='font-size:12px;'></td>" + 
        "<td nowrap id='Ext_sum_f_fine_t' align='right' style='font-size:12px;'></td>" +  
        "<td></td>" +
        "</tr>" +
        "</tfoot>" +
        "</table>" +
        "</form>" +
        "</div>",
      buttonAlign: "left",
      buttons: [
        {
          text: Ext.GLOBAL_BU_SAVE_TH,
          iconCls: "icon-save",
          disabled: vv.data.c_gx_code == "" ? false : true,
          handler: function() {
            var chkData = false;

            $("input[id^=no]").each(function(i, val) {
              chkData = true;
            });

            if (chkData == true) {
              SaveDtl();
            } else {
              Ext.MessageBox.alert("แจ้งเตือน", "กรุณาเพิ่มข้อมูลรายการ");
            }
          }
        },
        {
          text: Ext.GLOBAL_BU_BACK_TH,
          handler: function() {
            Ext.getCmp("win-pop-dtl").destroy();
          }
        }
      ]
    }).show();
  }; // formRequestItems
  // ================================ gridMain ================================ //

  // cellClick
  cellClick = function(grid, rowIndex, columnIndex, e) {
    var record = grid.getStore().getAt(rowIndex);

    if (columnIndex == grid.getColumnModel().getIndexById("edit")) {
      controllTab(record, "edit");
    } else if (columnIndex == grid.getColumnModel().getIndexById("delete")) {
      if (record.data.c_gx_code == "") {
        controllTab(record, "delete");
      }
    }
  }; // cellClick

  // gridMain
  gridMain = new Ext.grid.GridPanel({
    region: "center",
    layout: "fit",
    title: "แสดงรายการ" + title_panel,
    id: "tabpanel1",
    border: false,
    stripeRows: true,
    loadMask: true,
    store: store,
    viewConfig: {
      emptyText: "ไม่มีข้อมูล..",
      deferEmptyText: false
    },
    tbar: [
      {
        xtype: "buttongroup",
        title: "ระบุเงื่อนไขในการค้นหาข้อมูล",
        columns: 1,
        defaults: { scale: "small", style: "float: right" },
        items: [
          {
            xtype: "buttongroup",
            frame: false,
            items: [
              { xtype: "label", text: "ค้นหาโดย : " },
              { xtype: "tbspacer", width: 4 },
              {
                id: "filter",
                xtype: "combo",
                width: 100,
                mode: "local",
                store: new Ext.data.SimpleStore({
                  fields: ["value", "text"],
                  data: [["c_request", "เลขที่ใบเบิก"],["c_request_desc", "เลขที่ตั้งหนี้"]]
                }),
                value: "c_request",
                valueField: "value",
                displayField: "text",
                allowBlank: false,
                editable: false,
                triggerAction: "all",
                typeAhead: false
              },
              { xtype: "tbspacer", width: 4 },
              {
                xtype: "textfield",
                id: "value-box",
                width: 200,
                fieldLabel: "fieldLabel",
                emptyText: "คำที่ต้องการค้นหา"
              }
            ]
          },
          {
            xtype: "buttongroup",
            frame: false,
            items: [
              { xtype: "label", text: "วันที่ตั้งหนี้/ใบเบิก : " },
              { xtype: "tbspacer", width: 4 },
              {
                id: "s_d_doc_date1",
                xtype: "datefield",
                width: 128,
                listeners: {
                  afterrender: function() {
                    var date = new Date();
                    date = new Date(date.getFullYear() + 542, date.getMonth(), 1);
                    this.setValue(date);
                  }
                }
              },
              { xtype: "tbspacer", width: 6 },
              { xtype: "label", text: "ถึงวันที่ : " },
              { xtype: "tbspacer", width: 4 },
              {
                id: "s_d_doc_date2",
                xtype: "datefield",
                width: 128,
                listeners: {
                  afterrender: function() {
                    this.setValue(addY(543));
                  }
                }
              }
            ]
          }
        ],
        buttonAlign: "left",
        buttons: [
          { xtype: "tbfill" },
          {
            text: "ค้นหา",
            iconCls: "icon-magnifier",
            handler: function() {
              var msg = "";

              if (msg == "") {
                if (Ext.getCmp("value-box").getValue() != "") {
                  store.setBaseParam("value", Ext.getCmp("value-box").getValue());
                  store.setBaseParam("filter", Ext.getCmp("filter").getValue());
                } else {
                  store.setBaseParam("value", "");
                  store.setBaseParam("filter", "");
                }

                store.setBaseParam("mode", "SEARCH");
                store.setBaseParam("d_doc_date1", Ext.util.Format.date(Ext.getCmp("s_d_doc_date1").getValue(), "Y-m-d"));
                store.setBaseParam("d_doc_date2", Ext.util.Format.date(Ext.getCmp("s_d_doc_date2").getValue(), "Y-m-d"));
                store.load();
              } else {
                Ext.Msg.alert("แจ้งเตือน", msg);
              }
            }
          }
        ]
      }
    ],
    columns: [
      new Ext.grid.RowNumberer({
        header: "ที่",
        width: 30,
        renderer: function(value, metaData, record, row, col, store, gridView) {
          metaData.attr = "style='cursor:pointer; text-align:center;';";
          return record.get("no");
        }
      }),
      {
        id: "edit",
        header: "-",
        sortable: false,
        align: "center",
        width: 120,
        dataIndex: "id",
        renderer: function(value, metaData, record, row, col, store, gridView) {
          if (record.data.c_gx_code == "") {
            return "<button style='font-size:11px; cursor:pointer; color: green;'>ระบุรายละเอียดใบเบิก</button>";
          } else {
            return "<button style='font-size:11px; cursor:pointer; color: red;'>แสดง</button>";
          }
        }
      },
      {
        id: "delete",
        header: "-",
        sortable: false,
        align: "center",
        width: 120,
        dataIndex: "id",
        renderer: function(value, metaData, record, row, col, store, gridView) {
          if (record.data.c_gx_code == "") {
            return "<button style='font-size:11px; cursor:pointer; color: blue;'>ลบใบเบิกย่อย</button>";
          }
        }
      }, 
      { header: "GX", sortable: true, width: 110, align: "center", dataIndex: "c_gx_code" },
      { header: "เลขที่ใบเบิก", sortable: true, width: 110, align: "center", dataIndex: "c_request" },
      { header: "เลขที่ตั้งหนี้", sortable: true, width: 110, align: "center", dataIndex: "c_request_desc" },
      {
        header: "วันที่เอกสารใบเบิก",
        sortable: true,
        align: "center",
        dataIndex: "d_doc_date",
        renderer: function(value, metaData, record, rowIndex, colIndex, store) {
          return value != "" ? shortThaiDate(value) : "";
        }
      },
      { header: "ชื่อรายการ", sortable: true, width: 300, dataIndex: "c_comment" },
      {
        header: "จำนวน DR",
        sortable: true,
        dataIndex: "f_dr",
        renderer: function(value, metaData, record, rowIndex, colIndex, store) {
          metaData.attr = 'style= "cursor:pointer; text-align:right; color: blue;";';
          return floatRenderer(value);
        }
      },
      {
        header: "จำนวน CR",
        sortable: true,
        dataIndex: "f_cr",
        renderer: function(value, metaData, record, rowIndex, colIndex, store) {
          metaData.attr = 'style= "cursor:pointer; text-align:right; color: blue;";';
          return floatRenderer(value);
        }
      } 
    ],
    // autoExpandColumn: "c_comment",
    bbar: pagingBar
  }); // gridMain

  /* ====================== CENTER ====================== */
  center = new Ext.TabPanel({
    region: "center",
    border: false,
    // activeTab: 0, //default Tab
    id: "contenterCenter",
    defaults: { autoScroll: true },
    items: [gridMain]
  });
  // SET ref Grid&Tab
  Ext.getCmp("tabpanel1").on("cellclick", cellClick, this);

  // SetTab Controller Loads
  Ext.getCmp("contenterCenter").setActiveTab("tabpanel1");
  /* ====================== RENDER ====================== */
  new Ext.Viewport({
    layout: "border",
    items: [center]
  });
});