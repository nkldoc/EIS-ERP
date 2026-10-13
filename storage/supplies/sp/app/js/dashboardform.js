Ext.ns("Ext.ux.form");
Ext.ux.form.LovCombo = Ext.extend(Ext.form.ComboBox, {
  checkField: "checked",
  separator: ";",
  tip: false, // check การสร้าง tooltip
  showName: [], // เก็บค่า ชื่อรายการ

  constructor: function (config) {
    config = config || {};
    config.listeners = config.listeners || {};
    Ext.applyIf(config.listeners, {
      scope: this,
      beforequery: this.onBeforeQuery,
      blur: this.onRealBlur,
    });
    Ext.ux.form.LovCombo.superclass.constructor.call(this, config);
  }, // eo function constructor

  initComponent: function () {
    if (!this.tpl) {
      this.tpl =
        "" +
        '<tpl for=".">' +
        '<tpl if="values.' +
        this.valueFields +
        ' == 0">' +
        '<div class="x-combo-list-item">' +
        '<img src="' +
        Ext.BLANK_IMAGE_URL +
        '" ' +
        'class="ux-lovcombo-icon ux-lovcombo-icon-' +
        "{[values." +
        this.checkField +
        '?"checked":"unchecked"' +
        ']}">' +
        '<div class="ux-lovcombo-item-text"> ' +
        this.displayField +
        " </div>" +
        "</div>" +
        "</tpl>" +
        '<tpl if="values.' +
        this.valueFields +
        ' != 0">' +
        '<div class="x-combo-list-item">' +
        '<img src="' +
        Ext.BLANK_IMAGE_URL +
        '" ' +
        'class="ux-lovcombo-icon ux-lovcombo-icon-' +
        "{[values." +
        this.checkField +
        '?"checked":"unchecked"' +
        ']}">' +
        '<div class="ux-lovcombo-item-text">{' +
        (this.displayField || "text") +
        ":htmlEncode}</div>" +
        "</div>" +
        "</tpl>" +
        "</tpl>";
    }

    // call parent
    Ext.ux.form.LovCombo.superclass.initComponent.apply(this, arguments);
    // remove selection from input field
    this.onLoad = this.onLoad.createSequence(function () {
      if (this.el) {
        var v = this.el.dom.value;
        this.el.dom.value = "";
        this.el.dom.value = v;
      }
    });
  }, // eo function initComponent
  // }}}
  // {{{
  /**
   * Disables default tab key bahavior
   * @private
   */
  initEvents: function () {
    Ext.ux.form.LovCombo.superclass.initEvents.apply(this, arguments);
    // disable default tab handling - does no good
    this.keyNav.tab = false;
  }, // eo function initEvents
  // }}}
  // {{{
  /**
   * Clears value
   */
  clearValue: function () {
    this.value = "";
    this.setRawValue(this.value);
    this.store.clearFilter();

    this.store.each(function (r) {
      r.set(this.checkField, false);
    }, this);
    if (this.hiddenField) {
      this.hiddenField.value = "";
    }
    this.applyEmptyText();
  }, // eo function clearValue
  // }}}
  // {{{
  /**
   * @return {String} separator (plus space) separated list of selected displayFields
   * @private
   */
  getCheckedDisplay: function () {
    var re = new RegExp(this.separator, "g");
    return this.getCheckedValue(this.displayField).replace(re, this.separator + " ");
  }, // eo function getCheckedDisplay
  // }}}
  // {{{
  /**
   * @return {String} separator separated list of selected valueFields
   * @private
   */
  getCheckedValue: function (field) {
    field = field || this.valueField;
    var c = [];
    this.showName = []; // NUT

    // store may be filtered so get all records
    var snapshot = this.store.snapshot || this.store.data;

    snapshot.each(function (r) {
      if (r.get(this.checkField)) {
        c.push(r.get(field));
        this.showName.push({ id: r.data.id, c_name: r.data.c_name }); // NUT
      }
    }, this);

    return c.join(this.separator);
  }, // eo function getCheckedValue
  // }}}
  // {{{
  /**
   * beforequery event handler - handles multiple selections
   * @param {Object} qe query event
   * @private
   */
  onBeforeQuery: function (q) {
    if (q.query) {
      var length = q.query.length;
      q.query = new RegExp(Ext.escapeRe(q.query));
      q.query.length = length;
    }
    //		qe.query = qe.query.replace(new RegExp(RegExp.escape(this.getCheckedDisplay()) + '[ ' + this.separator + ']*'), '');
  }, // eo function onBeforeQuery
  // }}}
  // {{{
  /**
   * blur event handler - runs only when real blur event is fired
   * @private
   */

  onRealBlur: function () {
    var str = "";
    var i = 0;

    $.each(this.showName, function (index, obj) {
      str += "- " + obj.c_name + "<br>";
      i++;
    });
    if (i > 0) {
      Ext.example.msg("รายการ", str, 2);
      this.emptyText = "รายการที่เลือก (" + i + ")";
    } else {
      this.emptyText = "กรุณาเลือก...";
    }

    //		this.list.hide();
    //		var rv = this.getRawValue();
    //		var rva = rv.split(new RegExp(RegExp.escape(this.separator) + ' *'));
    //		var va = [];
    //		var snapshot = this.store.snapshot || this.store.data;
    //
    //		Ext.each(rva, function(v) {
    //			snapshot.each(function(r) {
    //				if(v === r.get(this.displayField)) {
    //					va.push(r.get(this.valueField));
    //				}
    //			}, this);
    //		}, this);
    //		this.setValue(va.join(this.separator));
    //		this.store.clearFilter();
  }, // eo function onRealBlur
  // }}}
  // {{{
  /**
   * Combo's onSelect override
   * @private
   * @param {Ext.data.Record} record record that has been selected in the list
   * @param {Number} index index of selected (clicked) record
   */
  onSelect: function (record, index) {
    if (this.fireEvent("beforeselect", this, record, index) !== false) {
      // toggle checked field
      record.set(this.checkField, !record.get(this.checkField));

      // NUT ทำการเช็ค ALL เพื่อเลือกทั้งหมด
      if (this.selectedIndex == 0 && record.data[this.valueField] == 0) {
        if (this.getCheckedValue() == 0) {
          this.selectAll();
        } else {
          this.deselectAll();
        }
      } else if (this.store.data.items[0].id == 0) {
        var chk = true;
        //console.log(this.store.data['id'].length);
        this.store.each(function (record) {
          // toggle checked field
          if ((record.data[this.valueField] > 0 && record.data.checked == false) || record.data.checked == undefined) {
            chk = false;
          }
        }, this);
        this.store.data.items[0].set("checked", chk);
      }
      //=============================

      // display full list
      if (this.store.isFiltered()) {
        //this.doQuery(this.allQuery);
      }

      // set (update) value and fire event
      this.setValue(this.getCheckedValue());
      this.fireEvent("select", this, record, index);
      //=============================
    }
  }, // eo function onSelect
  setValue: function (v) {
    if (v) {
      v = "" + v;

      if (this.valueField) {
        // NUT Filter ไม่ต้องเคลียใหม่				this.store.clearFilter();
        this.store.each(function (r) {
          var checked = !!v.match("(^|" + this.separator + ")" + RegExp.escape(r.get(this.valueField)) + "(" + this.separator + "|$)");
          r.set(this.checkField, checked);
        }, this);
        this.value = this.getCheckedValue();
        //				this.setRawValue(this.getCheckedDisplay());
        if (this.hiddenField) {
          this.hiddenField.value = this.value;
        }
      } else {
        this.value = v;
        //				this.setRawValue(v);
        if (this.hiddenField) {
          this.hiddenField.value = v;
        }
      }
      if (this.el) {
        this.el.removeClass(this.emptyClass);
      }
    } else {
      this.clearValue();
    }
  }, // eo function setValue
  selectAll: function () {
    this.store.each(function (record) {
      record.set(this.checkField, true);
    }, this);

    //display full list
    this.doQuery(this.allQuery);
    this.setValue(this.getCheckedValue());
  }, // eo full selectAll
  deselectAll: function () {
    this.clearValue();
  }, // eo full deselectAll
  // }}}
}); // eo extend

function createAssetReportForm(config = {}) {
  return new Ext.FormPanel({
    id: config.id || "assetReportFormID",
    url: config.url || "",
    frame: true,
    labelAlign: "left",
    bodyStyle: "padding:1px",
    labelWidth: 120,
    items: [
      {
        xtype: "textfield",
        fieldLabel: "วันที่",
        readOnly: true,
        value: new Date().add("Y", 543).dateFormat("d-m-Y"),
        name: "d_update_dt",
      },
      new Ext.ux.form.LovCombo({
        id: "sp_emp_idID",
        fieldLabel: "ชื่อพนักงาน",
        width: 300,
        mode: "local",
        store: new Ext.data.JsonStore({
          autoDestroy: false,
          autoLoad: true,
          url: "api/All_RepSpTorPAuser.php",
          baseParams: { type: "sp_emp", all: "all" },
          root: "data",
          idProperty: "id",
          fields: ["id", "c_name"],
        }),
        valueField: "id",
        displayField: "c_name",
        triggerAction: "all",
        forceSelection: true,
        selectOnFocus: true,
        listeners: {
          blur: function () {
            if (this.msg && this.msg.text) {
              console.log(this.msg.text);
            }
          },
        },
        typeAhead: false,
        emptyText: "เลือกทั้งหมด..",
      }),
    ],
    buttons: [
      {
        text: config.buttonText || "ดูรายงาน",
        icon: "../images/icons/zoom.png",
        handler: config.onSubmit || function () {},
      },
    ],
  });
}
