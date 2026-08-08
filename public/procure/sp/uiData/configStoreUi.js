//storeMonth 

function CopyToClipboard(rec, arrDataCopy) {
    var input = rec;
    var textToClipboard = "";
    //text on
    var success = true;
    for (var i = 0; i < arrDataCopy.length; i++) {
        if (!["", null, undefined].includes(input.get(arrDataCopy[i].dataIndex))) {
            textToClipboard += (i == 0 ? "" : " , ") + input.get(arrDataCopy[i].dataIndex);
        }
    }
    if (window.clipboardData) {
        // Internet Explorer
        window.clipboardData.setData("Text", textToClipboard);
    } else {
        var forExecElement = CreateElementForExecCommand(textToClipboard);
        SelectContent(forExecElement);
        // UniversalXPConnect privilege is required for clipboard access in Firefox
        try {
            if (window.netscape && netscape.security) {
                netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
            }
            success = document.execCommand("copy", false, null);
        } catch (e) {
            success = false;
        }
        document.body.removeChild(forExecElement);
    }

    if (success) {
        console.log("The text is on the clipboard, try to paste it!");
    } else {
        alert("Your browser doesn't allow clipboard access!");
    }
}
function CreateElementForExecCommand(textToClipboard, arrDataCopy) {
    var forExecElement = document.createElement("div");
    forExecElement.style.position = "absolute";
    forExecElement.style.left = "-10000px";
    forExecElement.style.top = "-10000px";
    forExecElement.textContent = textToClipboard;
    document.body.appendChild(forExecElement);
    forExecElement.contentEditable = true;
    return forExecElement;
}
function SelectContent(element) {
    // first create a range
    var rangeToSelect = document.createRange();
    rangeToSelect.selectNodeContents(element);
    // select the contents
    var selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(rangeToSelect);
}




Ext.form.TriggerField = Ext.extend(Ext.form.TextField, {
    /**
     * @cfg {String} triggerClass
     * An additional CSS class used to style the trigger button.  The trigger will always get the
     * class <tt>'x-form-trigger'</tt> by default and <tt>triggerClass</tt> will be <b>appended</b> if specified.
     */
    /**
     * @cfg {Mixed} triggerConfig
     * <p>A {@link Ext.DomHelper DomHelper} config object specifying the structure of the
     * trigger element for this Field. (Optional).</p>
     * <p>Specify this when you need a customized element to act as the trigger button for a TriggerField.</p>
     * <p>Note that when using this option, it is the developer's responsibility to ensure correct sizing, positioning
     * and appearance of the trigger.  Defaults to:</p>
     * <pre><code>{tag: "img", src: Ext.BLANK_IMAGE_URL, cls: "x-form-trigger " + this.triggerClass}</code></pre>
     */
    /**
     * @cfg {String/Object} autoCreate <p>A {@link Ext.DomHelper DomHelper} element spec, or true for a default
     * element spec. Used to create the {@link Ext.Component#getEl Element} which will encapsulate this Component.
     * See <tt>{@link Ext.Component#autoEl autoEl}</tt> for details.  Defaults to:</p>
     * <pre><code>{tag: "input", type: "text", size: "16", autocomplete: "off"}</code></pre>
     */
    defaultAutoCreate: {tag: "input", type: "text", size: "16", autocomplete: "on"},
    /**
     * @cfg {Boolean} hideTrigger <tt>true</tt> to hide the trigger element and display only the base
     * text field (defaults to <tt>false</tt>)
     */
    hideTrigger: false,
    /**
     * @cfg {Boolean} editable <tt>false</tt> to prevent the user from typing text directly into the field,
     * the field will only respond to a click on the trigger to set the value. (defaults to <tt>true</tt>).
     */
    editable: true,
    /**
     * @cfg {Boolean} readOnly <tt>true</tt> to prevent the user from changing the field, and
     * hides the trigger.  Superceeds the editable and hideTrigger options if the value is true.
     * (defaults to <tt>false</tt>)
     */
    readOnly: false,
    /**
     * @cfg {String} wrapFocusClass The class added to the to the wrap of the trigger element. Defaults to
     * <tt>x-trigger-wrap-focus</tt>.
     */
    wrapFocusClass: 'x-trigger-wrap-focus',
    /**
     * @hide
     * @method autoSize
     */
    autoSize: Ext.emptyFn,
    // private
    monitorTab: true,
    // private
    deferHeight: true,
    // private
    mimicing: false,

    actionMode: 'wrap',

    defaultTriggerWidth: 17,

    // private
    onResize: function (w, h) {
        Ext.form.TriggerField.superclass.onResize.call(this, w, h);
        var tw = this.getTriggerWidth();
        if (Ext.isNumber(w)) {
            this.el.setWidth(w - tw);
        }
        this.wrap.setWidth(this.el.getWidth() + tw);
    },

    getTriggerWidth: function () {
        var tw = this.trigger.getWidth();
        if (!this.hideTrigger && !this.readOnly && tw === 0) {
            tw = this.defaultTriggerWidth;
        }
        return tw;
    },

    // private
    alignErrorIcon: function () {
        if (this.wrap) {
            this.errorIcon.alignTo(this.wrap, 'tl-tr', [2, 0]);
        }
    },

    // private
    onRender: function (ct, position) {
        this.doc = Ext.isIE ? Ext.getBody() : Ext.getDoc();
        Ext.form.TriggerField.superclass.onRender.call(this, ct, position);

        this.wrap = this.el.wrap({cls: 'x-form-field-wrap x-form-field-trigger-wrap'});
        this.trigger = this.wrap.createChild(this.triggerConfig ||
          {tag: "img", src: Ext.BLANK_IMAGE_URL, alt: "", cls: "x-form-trigger " + this.triggerClass});
        this.initTrigger();
        if (!this.width) {
            this.wrap.setWidth(this.el.getWidth() + this.trigger.getWidth());
        }
        this.resizeEl = this.positionEl = this.wrap;
    },

    getWidth: function () {
        return(this.el.getWidth() + this.trigger.getWidth());
    },

    updateEditState: function () {
        if (this.rendered) {
            if (this.readOnly) {
                this.el.dom.readOnly = true;
                this.el.addClass('x-trigger-noedit');
                this.mun(this.el, 'click', this.onTriggerClick, this);
                this.trigger.setDisplayed(false);
            } else {
                if (!this.editable) {
                    this.el.dom.readOnly = true;
                    this.el.addClass('x-trigger-noedit');
                    this.mon(this.el, 'click', this.onTriggerClick, this);
                } else {
                    this.el.dom.readOnly = false;
                    this.el.removeClass('x-trigger-noedit');
                    this.mun(this.el, 'click', this.onTriggerClick, this);
                }
                this.trigger.setDisplayed(!this.hideTrigger);
            }
            this.onResize(this.width || this.wrap.getWidth());
        }
    },

    /**
     * Changes the hidden status of the trigger.
     * @param {Boolean} hideTrigger True to hide the trigger, false to show it.
     */
    setHideTrigger: function (hideTrigger) {
        if (hideTrigger != this.hideTrigger) {
            this.hideTrigger = hideTrigger;
            this.updateEditState();
        }
    },

    /**
     * Allow or prevent the user from directly editing the field text.  If false is passed,
     * the user will only be able to modify the field using the trigger.  Will also add
     * a click event to the text field which will call the trigger. This method
     * is the runtime equivalent of setting the {@link #editable} config option at config time.
     * @param {Boolean} value True to allow the user to directly edit the field text.
     */
    setEditable: function (editable) {
        if (editable != this.editable) {
            this.editable = editable;
            this.updateEditState();
        }
    },

    /**
     * Setting this to true will supersede settings {@link #editable} and {@link #hideTrigger}.
     * Setting this to false will defer back to {@link #editable} and {@link #hideTrigger}. This method
     * is the runtime equivalent of setting the {@link #readOnly} config option at config time.
     * @param {Boolean} value True to prevent the user changing the field and explicitly
     * hide the trigger.
     */
    setReadOnly: function (readOnly) {
        if (readOnly != this.readOnly) {
            this.readOnly = readOnly;
            this.updateEditState();
        }
    },

    afterRender: function () {
        Ext.form.TriggerField.superclass.afterRender.call(this);
        this.updateEditState();
    },

    // private
    initTrigger: function () {
        this.mon(this.trigger, 'click', this.onTriggerClick, this, {preventDefault: true});
        this.trigger.addClassOnOver('x-form-trigger-over');
        this.trigger.addClassOnClick('x-form-trigger-click');
    },

    // private
    onDestroy: function () {
        Ext.destroy(this.trigger, this.wrap);
        if (this.mimicing) {
            this.doc.un('mousedown', this.mimicBlur, this);
            this.doc.un('mouseup', this.mimicBlur, this);
        }
        delete this.doc;
        Ext.form.TriggerField.superclass.onDestroy.call(this);
    },

    onClick: Ext.emptyFn,
    // private
    onFocus: function () {
        Ext.form.TriggerField.superclass.onFocus.call(this);
        if (!this.mimicing) {
            this.wrap.addClass(this.wrapFocusClass);
            this.mimicing = true;
            this.doc.on('mousedown', this.mimicBlur, this, {delay: 10});
            this.doc.on('mouseup', this.mimicClick, this, {preventDefault: true});
            if (this.monitorTab) {
                this.on('specialkey', this.checkTab, this);

            }
        }
    },

    // private
    checkTab: function (me, e) {
        if (e.getKey() == e.TAB) {
            this.triggerBlur();
        }
    },

    // private

    onBlur: Ext.emptyFn,

    // private
    mimicBlur: function (e) {
        if (!this.isDestroyed && !this.wrap.contains(e.target) && this.validateBlur(e)) {
            this.triggerBlur();
        }
    },
    mimicClick: function (e) {
        if (this.wrap.contains(e.target)) {
            this.onClick();
        }
    },

    // private
    triggerBlur: function () {
        this.mimicing = false;
        this.doc.un('mousedown', this.mimicBlur, this);

        if (this.monitorTab && this.el) {
            this.doc.un('mouseup', this.mimicClick, this);
            this.un('specialkey', this.checkTab, this);
        }

        Ext.form.TriggerField.superclass.onBlur.call(this);
        if (this.wrap) {
            this.wrap.removeClass(this.wrapFocusClass);
        }
    },

    // private
    // This should be overriden by any subclass that needs to check whether or not the field can be blurred.
    validateBlur: function (e) {
        return true;
    },

});
Ext.form.TwinTriggerField = Ext.extend(Ext.form.TriggerField, {
    initComponent: function () {
        Ext.form.TwinTriggerField.superclass.initComponent.call(this);
        this.triggerConfig = {
            tag: 'span', cls: 'x-form-twin-triggers', cn: [
                {tag: "img", src: Ext.BLANK_IMAGE_URL, alt: "", cls: "x-form-trigger " + this.trigger1Class},
                {tag: "img", src: Ext.BLANK_IMAGE_URL, alt: "", cls: "x-form-trigger " + this.trigger2Class}
            ]};
    },

    getTrigger: function (index) {
        return this.triggers[index];
    },
    afterRender: function () {
        Ext.form.TwinTriggerField.superclass.afterRender.call(this);
        var triggers = this.triggers,
          i = 0,
          len = triggers.length;

        for (; i < len; ++i) {
            if (this['hideTrigger' + (i + 1)]) {
                triggers[i].hide();
            }

        }
    },
    initTrigger: function () {
        var ts = this.trigger.select('.x-form-trigger', true),
          triggerField = this;

        ts.each(function (t, all, index) {
            var triggerIndex = 'Trigger' + (index + 1);
            t.hide = function () {
                var w = triggerField.wrap.getWidth();
                this.dom.style.display = 'none';
                triggerField.el.setWidth(w - triggerField.trigger.getWidth());
                triggerField['hidden' + triggerIndex] = true;
            };
            t.show = function () {
                var w = triggerField.wrap.getWidth();
                this.dom.style.display = '';
                triggerField.el.setWidth(w - triggerField.trigger.getWidth());
                triggerField['hidden' + triggerIndex] = false;
            };
            this.mon(t, 'click', this['on' + triggerIndex + 'Click'], this, {preventDefault: true});
            t.addClassOnOver('x-form-trigger-over');
            t.addClassOnClick('x-form-trigger-click');
        }, this);
        this.triggers = ts.elements;
    },

    getTriggerWidth: function () {
        var tw = 0;
        Ext.each(this.triggers, function (t, index) {
            var triggerIndex = 'Trigger' + (index + 1),
              w = t.getWidth();
            if (w === 0 && !this['hidden' + triggerIndex]) {
                tw += this.defaultTriggerWidth;
            } else {
                tw += w;
            }
        }, this);
        return tw;
    },
    onDestroy: function () {
        Ext.destroy(this.triggers);
        Ext.form.TwinTriggerField.superclass.onDestroy.call(this);
    },
    onTrigger1Click: Ext.emptyFn,
    onTrigger2Click: Ext.emptyFn,
});
Ext.reg('triggerEdit', Ext.form.TriggerField);

Ext.monthStore = new Ext.data.JsonStore(
        {
            fields: [
                {
                    name: 'id'
                }, {
                    name: 'c_name'
                }],
            data: [
                {
                    id: '01',
                    c_name: 'มกราคม'
                }, {
                    id: '02',
                    c_name: 'กุมภาพันธ์'
                }, {
                    id: '03',
                    c_name: 'มีนาคม'
                }, {
                    id: '04',
                    c_name: 'เมษายน'
                }, {
                    id: '05',
                    c_name: 'พฤษภาคม'
                }, {
                    id: '06',
                    c_name: 'มิถุนายน'
                }, {
                    id: '07',
                    c_name: 'กรกฎาคม'
                }, {
                    id: '08',
                    c_name: 'สิงหาคม'
                }, {
                    id: '09',
                    c_name: 'กันยายน'
                }, {
                    id: '10',
                    c_name: 'ตุลาคม'
                }, {
                    id: '11',
                    c_name: 'พฤศจิกายน'
                }, {
                    id: '12',
                    c_name: 'ธันวาคม'
                }]
        });
Ext.monthNumericStore = new Ext.data.JsonStore(
        {
            fields: [
                {
                    name: 'id'
                }, {
                    name: 'c_name'
                }],
            data: [
                {
                    id: 1,
                    c_name: 'มกราคม'
                }, {
                    id: 2,
                    c_name: 'กุมภาพันธ์'
                }, {
                    id: 3,
                    c_name: 'มีนาคม'
                }, {
                    id: 4,
                    c_name: 'เมษายน'
                }, {
                    id: 5,
                    c_name: 'พฤษภาคม'
                }, {
                    id: 6,
                    c_name: 'มิถุนายน'
                }, {
                    id: 7,
                    c_name: 'กรกฎาคม'
                }, {
                    id: 8,
                    c_name: 'สิงหาคม'
                }, {
                    id: 9,
                    c_name: 'กันยายน'
                }, {
                    id: 10,
                    c_name: 'ตุลาคม'
                }, {
                    id: 11,
                    c_name: 'พฤศจิกายน'
                }, {
                    id: 12,
                    c_name: 'ธันวาคม'
                }]
        });
//Combox Store UI
Ext.enableStore = function ()
{
    return new Ext.data.JsonStore(
            {
                fields: [
                    {
                        name: 'id'
                    }, {
                        name: 'c_name'
                    }],
                data: [
                    {
                        id: '-1',
                        c_name: 'ทั้งหมด'
                    }, {
                        id: '1',
                        c_name: 'ใช้งาน'
                    }, {
                        id: '2',
                        c_name: 'ไม่ใช้งาน'
                    }]
            });
};


// storeYear
Ext.genYearList = function (now, backto, isBudha)
{
    var isBudha = Ext.isEmpty(isBudha) ? false : true;
    var years = [];
    var now = new Date().getFullYear() + parseInt(now);
    var yy_en = new Date().getFullYear() - parseInt(backto); //rundown of year
    while (yy_en <= now)
    {
        years.push(
                {
                    id: yy_en,
                    c_name: yy_en + 543
                });
        yy_en++;
    }
    ;
    return years;
};
Ext.yearStore = new Ext.data.JsonStore(
        {
            fields: [
                {
                    name: 'id'
                }, {
                    name: 'c_name'
                }],
            data: Ext.genYearList(1, 5),
            sortInfo: {
                field: 'id',
                direction: 'DESC'
            }
        });
// storeYear
Ext.genYearList2 = function (now, backto, isBudha)
{
    var isBudha = Ext.isEmpty(isBudha) ? false : true;
    var years = [];
    var now = new Date().getFullYear() + parseInt(now);
    var yy_en = new Date().getFullYear() - parseInt(backto); //rundown of year
    while (yy_en <= now)
    {
        years.push(
                {
                    id: (yy_en + 543),
                    c_name: (yy_en + 543)
                });
        yy_en++;
    }

    return years;
};
Ext.yearStore2 = new Ext.data.JsonStore(
        {
            fields: [
                {
                    name: 'id'
                }, {
                    name: 'c_name'
                }],
            data: Ext.genYearList2(1, 5),
            sortInfo: {
                field: 'id',
                direction: 'DESC'
            }
        });
Ext.genYearListAll = function (now, backto, isBudha)
{
    var isBudha = Ext.isEmpty(isBudha) ? false : true;
    var years = [];
    var now = new Date().getFullYear() + parseInt(now);
    var yy_en = new Date().getFullYear() - parseInt(backto); //rundown of year
    years.push(
            {
                id: -1,
                c_name: 'ทั้งหมด'
            });
    while (yy_en <= now)
    {
        years.push(
                {
                    id: (yy_en + 543),
                    c_name: (yy_en + 543)
                });
        yy_en++;
    }
    ;
    return years;
};
Ext.yearStoreAll = new Ext.data.JsonStore(
        {
            fields: [
                {
                    name: 'id'
                }, {
                    name: 'c_name'
                }],
            data: Ext.genYearListAll(1, 5),
            sortInfo: {
                field: 'id',
                direction: 'ASC'
            }
        });
Ext.monthStoreAll = new Ext.data.JsonStore(
        {
            fields: [
                {
                    name: 'id'
                }, {
                    name: 'c_name'
                }],
            data: [
                {
                    id: '-1',
                    c_name: 'ทั้งหมด'
                }, {
                    id: '01',
                    c_name: 'มกราคม'
                }, {
                    id: '02',
                    c_name: 'กุมภาพันธ์'
                }, {
                    id: '03',
                    c_name: 'มีนาคม'
                }, {
                    id: '04',
                    c_name: 'เมษายน'
                }, {
                    id: '05',
                    c_name: 'พฤษภาคม'
                }, {
                    id: '06',
                    c_name: 'มิถุนายน'
                }, {
                    id: '07',
                    c_name: 'กรกฎาคม'
                }, {
                    id: '08',
                    c_name: 'สิงหาคม'
                }, {
                    id: '09',
                    c_name: 'กันยายน'
                }, {
                    id: '10',
                    c_name: 'ตุลาคม'
                }, {
                    id: '11',
                    c_name: 'พฤศจิกายน'
                }, {
                    id: '12',
                    c_name: 'ธันวาคม'
                }],
            sortInfo: {
                field: 'id',
                direction: 'ASC'
            },
        });