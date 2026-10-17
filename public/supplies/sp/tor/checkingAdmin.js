(function () {
    function encode(value) { return Ext.util.Format.htmlEncode(String(value === null || value === undefined ? '' : value)); }
    function dateValue(value) {
        if (value === null || value === undefined || value === '') return null;
        var text = String(value).replace(/^\s+|\s+$/g, '');
        var thai = /^(\d{2})-(\d{2})-(\d{4})$/.exec(text);
        if (thai) text = (Number(thai[3]) >= 2400 ? Number(thai[3]) - 543 : Number(thai[3])) + '-' + thai[2] + '-' + thai[1];
        var match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text);
        if (!match) throw new Error('กรุณาระบุวันที่เป็น วัน-เดือน-ปี พ.ศ.');
        var date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
        if (date.getFullYear() !== Number(match[1]) || date.getMonth() !== Number(match[2]) - 1 || date.getDate() !== Number(match[3])) throw new Error('วันที่ไม่ถูกต้อง');
        return text;
    }
    function canonical(value, type) {
        if (value === null || value === undefined || value === '') return null;
        if (type === 'date') return dateValue(value);
        if (type === 'text') return String(value);
        if(type==='choice'&&typeof value==='string'&&/^(true|false)$/i.test(value))return value.toLowerCase()==='true'?1:0;
        var number = Number(value);
        if (!isFinite(number)) throw new Error('ตัวเลขไม่ถูกต้อง');
        if (type === 'year' && number >= 2400) number -= 543;
        return number;
    }
    function initial(value, type) {
        if (value === null || value === undefined) return '';
        if(type==='choice')return canonical(value,type);
        if (type === 'date') {
            var match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value));
            return match ? match[3] + '-' + match[2] + '-' + (Number(match[1]) + 543) : value;
        }
        if (type === 'year') return Number(value) > 0 && Number(value) < 2400 ? Number(value) + 543 : value;
        return value;
    }
    function field(definition, value) {
        var type = definition[1];
        var config = {fieldLabel: definition[0], value: initial(value, type), anchor: '97%', allowBlank: true};
        if (type === 'choice') {
            var choices = [['', '- ไม่ระบุ -']];
            for (var key in definition[3]) if (Object.prototype.hasOwnProperty.call(definition[3], key)) choices.push([Number(key), definition[3][key]]);
            config.store = new Ext.data.SimpleStore({fields: ['id', 'name'], data: choices});
            config.valueField = 'id'; config.displayField = 'name'; config.mode = 'local';
            config.triggerAction = 'all'; config.editable = false; config.forceSelection = true;
            return new Ext.form.ComboBox(config);
        }
        if (type === 'text' || type === 'date') {
            config.maxLength = 4000;
            if (type === 'date') {
                config.emptyText = 'วว-ดด-ปี พ.ศ.';
                config.validator = function (value) { try { dateValue(value); return true; } catch (error) { return error.message; } };
            }
            return new Ext.form.TextField(config);
        }
        config.decimalPrecision = type === 'quantity' ? 4 : (type === 'money' ? 2 : 0);
        config.allowNegative = type === 'money';
        config.enableKeyEvents = true;
        return new Ext.form.NumberField(config);
    }
    Ext.editCheckingOverview = function (checkId, onSaved) {
        Ext.Ajax.request({url: 'tor/api/checkingAdmin.php', method: 'GET', params: {sp_check_period_hdr_id: checkId},
            callback: function (options, success, response) {
                var result;
                try { result = Ext.decode(response.responseText); } catch (ignore) { result = null; }
                if (!success || !result || !result.success) return Ext.Msg.alert('แก้ไขโดย Admin', result && result.msg ? result.msg : 'ไม่สามารถโหลดข้อมูลแก้ไขได้');
                var header = result.data.sp_check_period_hdr[0], tabs = [], groups = {}, controls = [], grids = [], saving = false;
                var byName = {}, applying = false, financeDirty = false, calculating = false, timer = null, sequence = 0;
                var financeSource = {kind: 'header'}, manualVatIds = [];
                var headerDefinitions = result.fields.sp_check_period_hdr;
                for (var name in headerDefinitions) if (Object.prototype.hasOwnProperty.call(headerDefinitions, name)) {
                    var definition = headerDefinitions[name], control = field(definition, header[name]);
                    if (!groups[definition[2]]) groups[definition[2]] = [];
                    groups[definition[2]].push(control);
                    controls.push({name: name, definition: definition, control: control});
                    byName[name] = control;
                }
                for (var title in groups) if (Object.prototype.hasOwnProperty.call(groups, title)) tabs.push({title: title,
                    xtype: 'form', autoScroll: true, bodyStyle: 'padding:16px', labelWidth: 255, border: false, items: groups[title]});
                function addGrid(tableName, title) {
                    var definitions = result.fields[tableName], key = result.keys[tableName];
                    var names = [key], columns = [];
                    for (var name in definitions) if (Object.prototype.hasOwnProperty.call(definitions, name)) {
                        names.push(name);
                        var editor = field(definitions[name], null);
                        if(name==='f_sum_Transf')editor.setReadOnly(true);
                        columns.push({header: definitions[name][0], dataIndex: name, width: definitions[name][1] === 'text' ? 410 : 145,
                            renderer: function (value) { return encode(value); }, editor: editor});
                    }
                    var store = new Ext.data.JsonStore({fields: names, idProperty: key, data: result.data[tableName]});
                    var grid = new Ext.grid.EditorGridPanel({title: title, store: store, columns: columns, clicksToEdit: 1,
                        border: false, viewConfig: {emptyText: 'ไม่มีรายการ', deferEmptyText: false}});
                    grids.push({grid: grid, table: tableName, key: key, definitions: definitions});
                    tabs.push(grid);
                }
                addGrid('sp_check_period_dtl', 'รายการตรวจรับ');
                addGrid('sp_tranf_item', 'รายการตั้งหนี้');
                var fineMode = new Ext.form.ComboBox({fieldLabel: 'วิธีคิดค่าปรับ', store: new Ext.data.SimpleStore({fields: ['id','name'],
                    data: [['amount','ระบุจำนวนเงิน'],['percent','เปอร์เซ็นต์ของยอดขอเบิกรวม VAT']]}), valueField: 'id', displayField: 'name',
                    mode: 'local', triggerAction: 'all', editable: false, value: 'amount', anchor: '97%'});
                var fineRate = new Ext.form.NumberField({fieldLabel: 'อัตราค่าปรับ (%)', value: 0, minValue: 0, maxValue: 100,
                    decimalPrecision: 4, enableKeyEvents: true, anchor: '97%'});
                if (groups['เงิน / ภาษี']) groups['เงิน / ภาษี'].push(fineMode, fineRate);
                var derived = ['f_total_add_vat_amt','f_inv_vat','f_tax_personal','f_warranty','f_pay','i_is_fine'];
                Ext.each(derived, function (name) { if (byName[name]) byName[name].setReadOnly(true); });
                function collectChanges() {
                    var changes = [];
                    Ext.each(controls, function (entry) {
                        var value = canonical(entry.control.getValue(), entry.definition[1]);
                        if (canonical(header[entry.name], entry.definition[1]) !== value) changes.push({table:'sp_check_period_hdr',row_id:checkId,
                            field:entry.name,old_value:header[entry.name],new_value:value});
                    });
                    Ext.each(grids, function (entry) {
                        entry.grid.stopEditing();
                        entry.grid.store.each(function (record) {
                            var original;
                            Ext.each(result.data[entry.table], function (row) { if (String(row[entry.key]) === String(record.get(entry.key))) original = row; });
                            for (var name in entry.definitions) if (Object.prototype.hasOwnProperty.call(entry.definitions, name)) {
                                var type = entry.definitions[name][1], value = canonical(record.get(name), type);
                                if (canonical(original[name], type) !== value) changes.push({table:entry.table,row_id:original[entry.key],field:name,old_value:original[name],new_value:value});
                            }
                        });
                    });
                    return changes;
                }
                function calculationParams() {
                    return {finance_token:result.finance_token,finance_source:Ext.encode(financeSource),
                        fine_calculation:Ext.encode({mode:fineMode.getValue(),rate:Number(fineRate.getValue() || 0)}),manual_vat_ids:Ext.encode(manualVatIds)};
                }
                function runCalculation(afterSuccess) {
                    if (timer) { clearTimeout(timer); timer = null; }
                    var changes;
                    try { changes = collectChanges(); } catch (error) { return Ext.Msg.alert('ตรวจสอบข้อมูล',error.message); }
                    var current = ++sequence, params = calculationParams();
                    params.mode='calculate'; params.sp_check_period_hdr_id=checkId; params.csrf_token=result.csrf_token; params.changes=Ext.encode(changes);
                    calculating=true; saveButton.disable();
                    Ext.Ajax.request({url:'tor/api/checkingAdmin.php',method:'POST',params:params,callback:function (options,success,response) {
                        if (win.isDestroyed || current !== sequence) return;
                        calculating=false; saveButton.enable();
                        var calculated;
                        try { calculated=Ext.decode(response.responseText); } catch(ignore) { calculated=null; }
                        if (!success || !calculated || !calculated.success) return Ext.Msg.alert('คำนวณไม่สำเร็จ',calculated&&calculated.msg?calculated.msg:'ไม่สามารถคำนวณยอดเงินได้');
                        applying=true;
                        Ext.each(controls,function(entry){entry.control.setValue(initial(calculated.data.sp_check_period_hdr[0][entry.name],entry.definition[1]));});
                        Ext.each(grids,function(entry){
                            entry.grid.store.each(function(record){
                                Ext.each(calculated.data[entry.table],function(row){if(String(row[entry.key])===String(record.get(entry.key))) {
                                    for(var name in entry.definitions) if(Object.prototype.hasOwnProperty.call(entry.definitions,name)) record.set(name,row[name]);
                                }});
                            });
                            entry.grid.getView().refresh();
                        });
                        applying=false; financeDirty=false;
                        if(afterSuccess)afterSuccess();
                    }});
                }
                function queueCalculation() {
                    if(applying||saving)return;
                    financeDirty=true; sequence++;
                    if(timer)clearTimeout(timer);
                    timer=setTimeout(function(){runCalculation();},450);
                }
                Ext.each(controls,function(entry){
                    var name=entry.name;
                    if(derived.indexOf(name)!==-1)return;
                    if(['money','quantity'].indexOf(entry.definition[1])===-1&&['i_vat_amt','i_tax_personal','i_rate','i_edit_vat'].indexOf(name)===-1)return;
                    var changed=function(){
                        if(applying||saving)return;
                        applying=true;
                        if(name==='f_total')financeSource={kind:'header'};
                        if(name==='f_vat_amt'&&byName.i_edit_vat){byName.i_edit_vat.setValue(1);manualVatIds=[];}
                        if(name==='f_fine_amt')fineMode.setValue('amount');
                        Ext.each([['i_vat_amt','f_rate_vat',7],['i_tax_personal','f_tax_personal_rate',1],['i_rate','f_tax_warranty_rate',5]],function(pair){
                            if(name===pair[0]&&Number(entry.control.getValue())===1&&byName[pair[1]]&&!Number(byName[pair[1]].getValue()))byName[pair[1]].setValue(pair[2]);
                        });
                        applying=false;queueCalculation();
                    };
                    entry.control.on('change',changed);entry.control.on('keyup',changed);
                });
                fineMode.on('select',queueCalculation);fineRate.on('change',queueCalculation);fineRate.on('keyup',queueCalculation);
                Ext.each(grids,function(entry){entry.grid.on('afteredit',function(event){
                    if(applying||entry.definitions[event.field][1]==='text')return;
                    financeSource={kind:entry.table==='sp_tranf_item'?'debts':'items',row_id:Number(event.record.get(entry.key)),field:event.field};
                    if(entry.table==='sp_tranf_item'&&event.field==='f_vat_amt') {
                        if(manualVatIds.indexOf(financeSource.row_id)===-1)manualVatIds.push(financeSource.row_id);
                        if(byName.i_edit_vat){applying=true;byName.i_edit_vat.setValue(0);applying=false;}
                    }
                    queueCalculation();
                });});
                var reason = new Ext.form.TextArea({fieldLabel: 'เหตุผลในการแก้ไข', allowBlank: false, maxLength: 1000, anchor: '98%', height: 48});
                var saveButton = new Ext.Button({text: 'บันทึกและอัปเดต', iconCls: 'icon-save', handler: function () {
                    if(financeDirty||calculating){runCalculation(function(){saveButton.handler();});return;}
                    var valid = reason.isValid(), changes = [];
                    try {
                        Ext.each(controls, function (entry) {
                            valid = entry.control.isValid() && valid;
                            var oldValue = header[entry.name], newValue = canonical(entry.control.getValue(), entry.definition[1]);
                            if (canonical(oldValue, entry.definition[1]) !== newValue) changes.push({table: 'sp_check_period_hdr', row_id: checkId,
                                field: entry.name, old_value: oldValue, new_value: newValue});
                        });
                        Ext.each(grids, function (entry) {
                            entry.grid.stopEditing();
                            entry.grid.store.each(function (record) {
                                var original;
                                Ext.each(result.data[entry.table], function (row) { if (String(row[entry.key]) === String(record.get(entry.key))) original = row; });
                                for (var name in entry.definitions) if (Object.prototype.hasOwnProperty.call(entry.definitions, name)) {
                                    var type = entry.definitions[name][1], value = canonical(record.get(name), type);
                                    if (canonical(original[name], type) !== value) changes.push({table: entry.table, row_id: original[entry.key], field: name, old_value: original[name], new_value: value});
                                }
                            });
                        });
                    } catch (error) { return Ext.Msg.alert('ตรวจสอบข้อมูล', error.message); }
                    if (!valid) return Ext.Msg.alert('ตรวจสอบข้อมูล', 'กรุณาตรวจข้อมูลและระบุเหตุผลในการแก้ไข');
                    if(financeDirty||calculating){runCalculation(function(){saveButton.handler();});return;}
                    if (!changes.length) return Ext.Msg.alert('แก้ไขโดย Admin', 'ยังไม่มีข้อมูลเปลี่ยนแปลง');
                    saving = true;
                    saveButton.disable(); win.getEl().mask('กำลังบันทึกข้อมูลและประวัติ...');
                    var saveParams=calculationParams();
                    saveParams.sp_check_period_hdr_id=checkId;saveParams.csrf_token=result.csrf_token;saveParams.reason=reason.getValue();saveParams.changes=Ext.encode(changes);
                    Ext.Ajax.request({url: 'tor/api/checkingAdmin.php', method: 'POST', params: saveParams,
                        callback: function (options, success, response) {
                            if (win.isDestroyed) return;
                            saving = false;
                            win.getEl().unmask(); saveButton.enable();
                            var saved;
                            try { saved = Ext.decode(response.responseText); } catch (ignore) { saved = null; }
                            if (!success || !saved || !saved.success) return Ext.Msg.alert('บันทึกไม่สำเร็จ', saved && saved.msg ? saved.msg : 'ไม่สามารถบันทึกข้อมูลได้');
                            win.close();
                            if (onSaved) onSaved();
                            Ext.Msg.alert('บันทึกสำเร็จ', saved.msg);
                        }});
                }});
                var win = new Ext.Window({title: 'แก้ไขโดย Admin — ' + encode(header.c_code || header.c_arrive_code), modal: true,
                    width: Math.min(1080, Ext.getBody().getViewSize().width - 40), height: Math.min(740, Ext.getBody().getViewSize().height - 40),
                    maximizable: true, layout: 'border', items: [
                        new Ext.TabPanel({region: 'center', activeTab: 0, deferredRender: false, items: tabs}),
                        {region: 'south', xtype: 'form', height: 100, bodyStyle: 'padding:12px', labelWidth: 140, items: reason}
                    ], listeners: {beforeclose: function () { if(!saving){sequence++;if(timer)clearTimeout(timer);}return !saving; }},
                    buttons: [saveButton, {text: 'ยกเลิก', handler: function () { win.close(); }}]});
                win.show();
            }});
    };
}());
