// lightweight custom edit form with tabpanel (added near cellClick to ensure scope)
// =========================
var win_edir_alldata = function (rec, searchOptions) {
    if (!searchOptions) {
        // พฤติกรรมเดิม: ถ้าเรียกจากแถวใน Grid ให้เปิดรายการที่เลือกทันที
        if (rec && rec.get && rec.get('sp_check_period_hdr_id')) {
            win_edir_alldata(rec, { use_selected: true, search_code: '' });
            return;
        }
        var openCentralLookup = function () {
            Ext.CheckingRelationLookup.open(function (selectedSearch) {
                win_edir_alldata(null, selectedSearch);
            });
        };
        if (Ext.CheckingRelationLookup && Ext.CheckingRelationLookup.open) {
            openCentralLookup();
        } else {
            var lookupScript = document.createElement('script');
            var lookupOpened = false;
            var openLoadedLookup = function () {
                if (lookupOpened) { return; }
                lookupOpened = true;
                openCentralLookup();
            };
            lookupScript.type = 'text/javascript';
            lookupScript.src = 'tor/checking_relation_lookup.js?_dc=' + new Date().getTime();
            lookupScript.onload = openLoadedLookup;
            lookupScript.onreadystatechange = function () {
                if (this.readyState === 'loaded' || this.readyState === 'complete') {
                    this.onreadystatechange = null;
                    openLoadedLookup();
                }
            };
            lookupScript.onerror = function () {
                Ext.Msg.alert('ผิดพลาด', 'ไม่สามารถโหลดไฟล์ตัวเลือกข้อมูลกลางได้');
            };
            document.getElementsByTagName('head')[0].appendChild(lookupScript);
        }
        return;
        var searchTypeField = new Ext.form.ComboBox({
            fieldLabel: 'ค้นหาจาก',
            store: new Ext.data.ArrayStore({
                fields: ['value', 'text'],
                data: [
                    ['tor_code', 'เลขที่ TOR (sp_tor.c_code)'],
                    ['contract_code', 'เลขที่สัญญา (sp_tor_contract.c_code)']
                ]
            }),
            valueField: 'value',
            displayField: 'text',
            mode: 'local',
            triggerAction: 'all',
            editable: false,
            forceSelection: true,
            value: 'tor_code',
            anchor: '100%'
        });
        var searchCodeField = new Ext.form.TextField({
            fieldLabel: 'เลขที่เอกสาร',
            allowBlank: false,
            anchor: '100%'
        });
        var searchForm = new Ext.form.FormPanel({
            border: false,
            labelWidth: 95,
            bodyStyle: 'padding:15px;',
            items: [searchTypeField, searchCodeField]
        });
        var searchWindow = new Ext.Window({
            title: 'ค้นหาข้อมูลความสัมพันธ์',
            width: 500,
            height: 175,
            layout: 'fit',
            modal: true,
            items: searchForm,
            buttons: [{
                text: 'ค้นหา',
                iconCls: 'icon-magnifier',
                handler: function () {
                    var searchCode = String(searchCodeField.getValue() || '').replace(/^\s+|\s+$/g, '');
                    if (!searchCode) {
                        Ext.Msg.alert('แจ้งเตือน', 'กรุณาระบุเลขที่เอกสาร');
                        return;
                    }
                    searchWindow.close();
                    win_edir_alldata(rec, {
                        search_type: searchTypeField.getValue(),
                        search_code: searchCode
                    });
                }
            }, {
                text: 'ยกเลิก',
                handler: function () { searchWindow.close(); }
            }],
            listeners: {
                show: function () { searchCodeField.focus(false, 200); }
            }
        });
        searchWindow.show();
        return;
    }
    if ((!rec || !rec.get) && !searchOptions.search_code) {
        Ext.Msg.alert('แจ้งเตือน', 'ไม่พบข้อมูลอ้างอิงสำหรับค้นหา');
        return;
    }
    var getSelectedValue = function (fieldName) {
        return rec && rec.get ? rec.get(fieldName) : null;
    };

    var relationLogStore = null;
    var relationLogGrid = null;
    var relationDataTabs = [];
    var relationGridByTable = {};
    var relationStoreByTable = {};
    var torOverviewPanel = null;
    var enabledOnly = true;
    var selectedContractId = null;
    var selectedTorPeriodId = null;
    var relationStepIndex = -1;
    var relationSteps = [
        { label: 'TOR และรายละเอียด TOR', tables: ['sp_tor', 'sp_tor_dtl'] },
        { label: 'ผู้เสนอราคา', tables: ['sp_tor_bidder_hdr', 'sp_tor_bidder_dtl'] },
        { label: 'ผู้ชนะการเสนอราคา', tables: ['sp_tor_victory'] },
        { label: 'สัญญา', tables: ['sp_tor_contract'] },
        { label: 'งวดตามสัญญา', tables: ['sp_tor_hdr_period', 'sp_tor_dtl_period'] },
        { label: 'การส่งมอบตามสัญญา', tables: ['sp_mn_contract_hdr'] },
        { label: 'การตรวจรับ', tables: ['sp_check_period_hdr', 'sp_check_period_dtl'] },
        { label: 'การส่งบัญชี', tables: ['sp_tranf_hdr', 'sp_tranf_item'] }
    ];
    var openNextRelationStep = function (button) {
        if (relationStepIndex + 1 >= relationSteps.length) {
            if (button) {
                button.disable();
                button.setText('เปิดครบทุกขั้นตอนแล้ว');
            }
            return;
        }
        relationStepIndex++;
        var step = relationSteps[relationStepIndex];
        var firstOpenedGrid = null;
        if (relationStepIndex === 0 && relationGridByTable.sp_tor && relationGridByTable.sp_tor_dtl) {
            if (!torOverviewPanel) {
                relationGridByTable.sp_tor.region = 'north';
                relationGridByTable.sp_tor.height = 245;
                relationGridByTable.sp_tor.split = true;
                relationGridByTable.sp_tor_dtl.region = 'center';
                torOverviewPanel = new Ext.Panel({
                    title: 'sp_tor + sp_tor_dtl',
                    layout: 'border',
                    border: false,
                    items: [relationGridByTable.sp_tor, relationGridByTable.sp_tor_dtl]
                });
            }
            if (torOverviewPanel.ownerCt !== relationTabs) {
                relationTabs.add(torOverviewPanel);
            }
            firstOpenedGrid = torOverviewPanel;
        } else {
            Ext.each(step.tables, function (tableName) {
                var stepGrid = relationGridByTable[tableName];
                if (stepGrid && stepGrid.ownerCt !== relationTabs) {
                    relationTabs.add(stepGrid);
                    firstOpenedGrid = firstOpenedGrid || stepGrid;
                }
            });
        }
        if (relationStepIndex === relationSteps.length - 1 && relationLogGrid && relationLogGrid.ownerCt !== relationTabs) {
            relationTabs.add(relationLogGrid);
        }
        relationTabs.doLayout();
        if (firstOpenedGrid) {
            relationTabs.setActiveTab(firstOpenedGrid);
        }
        if (button) {
            if (relationStepIndex + 1 < relationSteps.length) {
                button.setText('เปิดขั้นตอนถัดไป: ' + relationSteps[relationStepIndex + 1].label);
            } else {
                button.disable();
                button.setText('เปิดครบทุกขั้นตอนแล้ว');
            }
        }
    };
    var recordIsEnabled = function (record) {
        var enabledField = null;
        if (record.fields && record.fields.containsKey('i_enabled')) {
            enabledField = 'i_enabled';
        } else if (record.fields && record.fields.containsKey('i_enable')) {
            enabledField = 'i_enable';
        }
        if (!enabledField) {
            return true;
        }
        var enabledValue = record.get(enabledField);
        return enabledValue === null || enabledValue === '' || typeof enabledValue === 'undefined' || parseInt(enabledValue, 10) === 1;
    };
    var applyRelationFilters = function () {
        Ext.iterate(relationStoreByTable, function (tableName, relationStore) {
            relationStore.clearFilter(true);
            relationStore.filterBy(function (record) {
                if (enabledOnly && !recordIsEnabled(record)) {
                    return false;
                }
                if (selectedContractId && tableName === 'sp_tor_hdr_period') {
                    return String(record.get('sp_tor_contract_id')) === String(selectedContractId);
                }
                if (selectedTorPeriodId && tableName === 'sp_tor_dtl_period') {
                    return String(record.get('sp_tor_hdr_period_id')) === String(selectedTorPeriodId);
                }
                if (selectedTorPeriodId && tableName === 'sp_check_period_hdr') {
                    return String(record.get('sp_tor_hdr_period_id')) === String(selectedTorPeriodId);
                }
                return true;
            });
            var relationGrid = relationGridByTable[tableName];
            if (relationGrid) {
                relationGrid.setTitle(tableName + ' (' + relationStore.getCount() + ')');
            }
        });

        // รายละเอียดตรวจรับต้องตามเฉพาะหัวตรวจรับที่เหลือหลังกรองงวด
        if (selectedTorPeriodId && relationStoreByTable.sp_check_period_hdr && relationStoreByTable.sp_check_period_dtl) {
            var allowedCheckingIds = {};
            relationStoreByTable.sp_check_period_hdr.each(function (checkingHdrRecord) {
                allowedCheckingIds[String(checkingHdrRecord.get('sp_check_period_hdr_id'))] = true;
            });
            relationStoreByTable.sp_check_period_dtl.filterBy(function (checkingDtlRecord) {
                return (!enabledOnly || recordIsEnabled(checkingDtlRecord)) &&
                    allowedCheckingIds[String(checkingDtlRecord.get('sp_check_period_hdr_id'))] === true;
            });
            relationGridByTable.sp_check_period_dtl.setTitle(
                'sp_check_period_dtl (' + relationStoreByTable.sp_check_period_dtl.getCount() + ')'
            );
        }
    };
    var relationTabs = new Ext.TabPanel({
        activeTab: 0,
        border: false,
        deferredRender: false,
        enableTabScroll: true,
        items: [{
            title: 'กำลังโหลด',
            html: '<div style="padding:20px;">กำลังเชื่อมโยงข้อมูลตรวจรับ...</div>'
        }]
    });
    var relationWindow = new Ext.Window({
        title: searchOptions.search_code
            ? 'ข้อมูลเชื่อมโยง: ' + searchOptions.search_code
            : 'ข้อมูลเชื่อมโยงรายการตรวจรับ #' + getSelectedValue('sp_check_period_hdr_id'),
        width: 1200,
        height: 650,
        layout: 'fit',
        modal: true,
        maximizable: true,
        constrainHeader: true,
        items: relationTabs,
        tbar: [{
            text: 'กำลังเตรียมข้อมูลความสัมพันธ์...',
            iconCls: 'icon-table-add',
            disabled: true,
            handler: function (button) {
                openNextRelationStep(button);
            }
        }, '-', {
            text: 'ค้นหาด้วยรหัส',
            iconCls: 'icon-magnifier',
            handler: function () {
                relationWindow.close();
                win_edir_alldata(null);
            }
        }, '-', {
            text: 'Enabled = 1',
            iconCls: 'icon-filter',
            enableToggle: true,
            pressed: true,
            toggleHandler: function (button, pressed) {
                enabledOnly = pressed;
                button.setText(pressed ? 'Enabled = 1' : 'แสดง Enabled ทั้งหมด');
                applyRelationFilters();
            }
        }, '-', {
            xtype: 'tbtext',
            text: 'ความสัมพันธ์หลัก: sp_tor.tor_id = ตารางลูก.sp_tor_id'
        }],
        buttons: [{
            text: 'ปิด',
            handler: function () {
                relationWindow.close();
            }
        }]
    });
    Ext.Ajax.request({
        url: 'tor/api/mnCheckingController.php',
        method: 'POST',
        params: {
            mode: 'GET_CHECKING_RELATIONS',
            sp_check_period_hdr_id: getSelectedValue('sp_check_period_hdr_id'),
            sp_tor_hdr_period_id: getSelectedValue('sp_tor_hdr_period_id'),
            sp_tor_contract_id: getSelectedValue('sp_tor_contract_id'),
            sp_tor_id: getSelectedValue('sp_tor_id'),
            search_type: searchOptions.search_type,
            search_code: searchOptions.search_code
        },
        success: function (response) {
            var result;
            try {
                result = Ext.decode(response.responseText);
            } catch (ex) {
                Ext.Msg.alert('ผิดพลาด', 'ข้อมูลที่ได้รับจากระบบไม่ถูกต้อง', function () {
                    if (searchOptions.search_code) {
                        win_edir_alldata(null);
                    }
                });
                return;
            }
            if (!result.success) {
                Ext.Msg.alert('ไม่พบข้อมูล', result.msg || 'ไม่สามารถโหลดข้อมูลได้', function () {
                    if (searchOptions.search_code) {
                        win_edir_alldata(null);
                    }
                });
                return;
            }
            relationWindow.show();

            relationTabs.removeAll(true);
            Ext.each(result.datasets || [], function (dataset) {
                var fields = [];
                var columns = [new Ext.grid.RowNumberer({ width: 35 })];
                var isEditableField = function (fieldName) {
                    var editable = false;
                    Ext.each(dataset.editable_columns || [], function (name) {
                        if (name === fieldName) {
                            editable = true;
                            return false;
                        }
                    });
                    return editable;
                };
                var formatFieldValue = function (value, fieldName) {
                    if (value === null || typeof value === 'undefined') {
                        return value;
                    }
                    var fieldType = String((dataset.column_types || {})[fieldName] || '').toLowerCase();
                    if (Ext.isDate(value)) {
                        return value.format('Y-m-d H:i:s');
                    }
                    if (typeof value === 'object') {
                        if (value.date) {
                            value = value.date;
                        } else {
                            return Ext.encode(value);
                        }
                    }
                    value = String(value);
                    if (/date|time/.test(fieldType)) {
                        value = value.replace('T', ' ');
                        if (/^\d{4}-\d{2}-\d{2}/.test(value) && value.length > 19) {
                            value = value.substring(0, 19);
                        }
                    }
                    return value;
                };
                Ext.each(dataset.rows || [], function (normalizeRow) {
                    Ext.each(dataset.columns || [], function (normalizeField) {
                        normalizeRow[normalizeField] = formatFieldValue(normalizeRow[normalizeField], normalizeField);
                    });
                });
                Ext.each(dataset.columns || [], function (fieldName) {
                    fields.push({ name: fieldName });
                    var maxLength = String(fieldName).length;
                    Ext.each(dataset.rows || [], function (rowData) {
                        var displayValue = rowData[fieldName];
                        if (displayValue !== null && typeof displayValue !== 'undefined') {
                            maxLength = Math.max(maxLength, String(displayValue).length);
                        }
                    });
                    var calculatedWidth = Math.max(105, Math.min(320, (maxLength * 8) + 28));
                    var isIdColumn = /(^id$|_id$)/i.test(fieldName);
                    var isNumberColumn = /(^i_|^f_|amt|qty|price|total|year)/i.test(fieldName);
                    var columnConfig = {
                        header: fieldName,
                        dataIndex: fieldName,
                        width: calculatedWidth,
                        align: isIdColumn ? 'center' : (isNumberColumn ? 'right' : 'left'),
                        sortable: true,
                        renderer: function (value, metaData) {
                            if (value === null || typeof value === 'undefined') {
                                metaData.attr = 'style="text-align:center;"';
                                return '<span style="color:#999;">NULL</span>';
                            }
                            var encodedValue = Ext.util.Format.htmlEncode(String(value));
                            metaData.attr = 'ext:qtip="' + encodedValue + '" style="vertical-align:middle;"';
                            return encodedValue;
                        }
                    };
                    if (isEditableField(fieldName)) {
                        columnConfig.editor = new Ext.form.TextField({
                            selectOnFocus: true
                        });
                    } else {
                        columnConfig.css = 'background-color:#f2f2f2;color:#666;';
                    }
                    columns.push(columnConfig);
                });
                var datasetStore = new Ext.data.JsonStore({
                    fields: fields,
                    data: dataset.rows || []
                });
                relationStoreByTable[dataset.table] = datasetStore;
                var editGrid;
                var showSelectedRowForm = function () {
                    var selectionModel = editGrid.getSelectionModel();
                    var selectedRecord = null;
                    if (selectionModel && typeof selectionModel.getSelected === 'function') {
                        selectedRecord = selectionModel.getSelected();
                    }
                    if (!selectedRecord && selectionModel && typeof selectionModel.getSelections === 'function') {
                        var selectedRows = selectionModel.getSelections();
                        selectedRecord = selectedRows && selectedRows.length ? selectedRows[0] : null;
                    }
                    if (!selectedRecord && selectionModel && typeof selectionModel.getSelectedCell === 'function') {
                        var selectedCell = selectionModel.getSelectedCell();
                        if (selectedCell && selectedCell.length) {
                            selectedRecord = datasetStore.getAt(selectedCell[0]);
                        }
                    }
                    if (!selectedRecord && selectionModel && selectionModel.selection) {
                        selectedRecord = selectionModel.selection.record || null;
                    }
                    selectedRecord = selectedRecord || datasetStore.getAt(0);
                    if (!selectedRecord) {
                        Ext.Msg.alert('แจ้งเตือน', 'ตารางนี้ไม่มีข้อมูลสำหรับแสดงแบบฟอร์ม');
                        return;
                    }
                    var leftFields = [];
                    var rightFields = [];
                    Ext.each(dataset.columns || [], function (formFieldName, fieldIndex) {
                        var fieldValue = selectedRecord.get(formFieldName);
                        var canEditField = isEditableField(formFieldName);
                        var fieldConfig = {
                            xtype: String(fieldValue || '').length > 100 ? 'textarea' : 'textfield',
                            name: formFieldName,
                            fieldLabel: formFieldName,
                            value: fieldValue === null || typeof fieldValue === 'undefined' ? '' : fieldValue,
                            readOnly: !canEditField,
                            anchor: '96%',
                            height: String(fieldValue || '').length > 100 ? 55 : undefined,
                            style: canEditField
                                ? 'background:#fff;color:#222;'
                                : 'background:#f0f0f0;color:#666;'
                        };
                        if (fieldIndex % 2 === 0) {
                            leftFields.push(fieldConfig);
                        } else {
                            rightFields.push(fieldConfig);
                        }
                    });
                    var detailForm = new Ext.form.FormPanel({
                        border: false,
                        autoScroll: true,
                        bodyStyle: 'padding:12px;background:#fff;',
                        labelAlign: 'right',
                        items: [{
                            layout: 'column',
                            border: false,
                            defaults: {
                                layout: 'form',
                                border: false,
                                labelWidth: 170,
                                bodyStyle: 'padding:0 8px;background:#fff;'
                            },
                            items: [{
                                columnWidth: .5,
                                items: leftFields
                            }, {
                                columnWidth: .5,
                                items: rightFields
                            }]
                        }]
                    });
                    var detailWindow = new Ext.Window({
                        title: 'แบบฟอร์มข้อมูล ' + dataset.table + ' — ' + dataset.primary_key + ': ' + selectedRecord.get(dataset.primary_key),
                        width: 1050,
                        height: 650,
                        layout: 'fit',
                        modal: true,
                        maximizable: true,
                        constrainHeader: true,
                        items: detailForm,
                        buttons: [{
                            text: 'บันทึกการแก้ไข',
                            iconCls: 'icon-disk',
                            handler: function () {
                                var formChanges = [];
                                Ext.each(dataset.columns || [], function (saveFieldName) {
                                    if (!isEditableField(saveFieldName)) {
                                        return;
                                    }
                                    var formField = detailForm.getForm().findField(saveFieldName);
                                    if (!formField) {
                                        return;
                                    }
                                    var oldFormValue = selectedRecord.get(saveFieldName);
                                    var newFormValue = formField.getValue();
                                    var oldCompare = oldFormValue === null || typeof oldFormValue === 'undefined' ? '' : String(oldFormValue);
                                    var newCompare = newFormValue === null || typeof newFormValue === 'undefined' ? '' : String(newFormValue);
                                    if (oldCompare !== newCompare) {
                                        formChanges.push({
                                            table_name: dataset.table,
                                            row_field: dataset.primary_key,
                                            row_id: selectedRecord.get(dataset.primary_key),
                                            field_name: saveFieldName,
                                            old_value: oldFormValue,
                                            new_value: newFormValue
                                        });
                                    }
                                });
                                if (formChanges.length === 0) {
                                    Ext.Msg.alert('แจ้งเตือน', 'ยังไม่มีข้อมูลที่แก้ไขในแบบฟอร์ม');
                                    return;
                                }
                                Ext.Msg.prompt('เหตุผลในการแก้ไข', 'กรุณาระบุเหตุผลเพื่อบันทึกในประวัติ:', function (btn, reason) {
                                    reason = String(reason || '').replace(/^\s+|\s+$/g, '');
                                    if (btn !== 'ok') {
                                        return;
                                    }
                                    if (!reason) {
                                        Ext.Msg.alert('แจ้งเตือน', 'กรุณาระบุเหตุผลในการแก้ไข');
                                        return;
                                    }
                                    detailWindow.getEl().mask('กำลังบันทึกข้อมูลและประวัติ...');
                                    Ext.Ajax.request({
                                        url: 'tor/api/mnCheckingController.php',
                                        method: 'POST',
                                        params: {
                                            mode: 'UPDATE_CHECKING_RELATIONS',
                                            remarks: reason,
                                            jsonData: Ext.encode(formChanges)
                                        },
                                        success: function (formResponse) {
                                            detailWindow.getEl().unmask();
                                            var formResult;
                                            try {
                                                formResult = Ext.decode(formResponse.responseText);
                                            } catch (ignore) {
                                                Ext.Msg.alert('ผิดพลาด', 'ข้อมูลตอบกลับไม่ถูกต้อง');
                                                return;
                                            }
                                            if (!formResult.success) {
                                                Ext.Msg.alert('บันทึกไม่สำเร็จ', formResult.msg || 'เกิดข้อผิดพลาด');
                                                return;
                                            }
                                            Ext.each(formChanges, function (savedFormChange) {
                                                selectedRecord.set(savedFormChange.field_name, savedFormChange.new_value);
                                                if (relationLogStore) {
                                                    relationLogStore.insert(0, new relationLogStore.recordType({
                                                        log_id: '-', table_name: savedFormChange.table_name,
                                                        row_id: savedFormChange.row_id, row_field: savedFormChange.row_field,
                                                        field_name: savedFormChange.field_name, old_value: savedFormChange.old_value,
                                                        new_value: savedFormChange.new_value, user_id: Ext.session.user_id,
                                                        date_create: new Date().format('Y-m-d H:i:s'), remarks: reason
                                                    }));
                                                }
                                            });
                                            selectedRecord.commit();
                                            if (relationLogGrid) {
                                                relationLogGrid.setTitle('ประวัติการแก้ไข (' + relationLogStore.getCount() + ')');
                                            }
                                            Ext.Msg.alert('สำเร็จ', formResult.msg, function () {
                                                detailWindow.close();
                                            });
                                        },
                                        failure: function () {
                                            detailWindow.getEl().unmask();
                                            Ext.Msg.alert('ผิดพลาด', 'ไม่สามารถเชื่อมต่อเพื่อบันทึกข้อมูลได้');
                                        }
                                    });
                                }, this, true);
                            }
                        }, {
                            text: 'ปิด',
                            handler: function () {
                                detailWindow.close();
                            }
                        }]
                    });
                    detailWindow.show();
                };
                var columnSelectorMenu = new Ext.menu.Menu({
                    enableScrolling: true,
                    maxHeight: 500
                });
                Ext.each(dataset.columns || [], function (columnName, datasetColumnIndex) {
                    columnSelectorMenu.add(new Ext.menu.CheckItem({
                        text: columnName,
                        checked: true,
                        hideOnClick: false,
                        checkHandler: function (item, checked) {
                            if (editGrid) {
                                editGrid.getColumnModel().setHidden(datasetColumnIndex + 1, !checked);
                            }
                        }
                    }));
                });
                editGrid = new Ext.grid.EditorGridPanel({
                    title: dataset.table + ' (' + datasetStore.getCount() + ')',
                    store: datasetStore,
                    columns: columns,
                    clicksToEdit: 2,
                    stripeRows: true,
                    autoScroll: true,
                    loadMask: true,
                    viewConfig: {
                        forceFit: false,
                        autoFill: false,
                        scrollOffset: 18,
                        emptyText: '<div style="padding:15px;text-align:center;color:#888;">ไม่พบข้อมูล</div>'
                    },
                    tbar: [{
                        xtype: 'tbtext',
                        text: '<b>' + Ext.util.Format.htmlEncode(dataset.title) + '</b>'
                    }, '-', {
                        text: 'แสดงแบบฟอร์ม',
                        iconCls: 'icon-view',
                        handler: showSelectedRowForm
                    }, '-', {
                        text: 'บันทึกข้อมูลที่แก้ไข',
                        iconCls: 'icon-disk',
                        handler: function () {
                            editGrid.stopEditing();
                            var changes = [];
                            datasetStore.each(function (changedRecord) {
                                if (!changedRecord.dirty) {
                                    return;
                                }
                                var rowId = changedRecord.get(dataset.primary_key);
                                for (var changedField in changedRecord.modified) {
                                    if (changedRecord.modified.hasOwnProperty(changedField) && isEditableField(changedField)) {
                                        changes.push({
                                            table_name: dataset.table,
                                            row_field: dataset.primary_key,
                                            row_id: rowId,
                                            field_name: changedField,
                                            old_value: changedRecord.modified[changedField],
                                            new_value: changedRecord.get(changedField)
                                        });
                                    }
                                }
                            });
                            if (changes.length === 0) {
                                Ext.Msg.alert('แจ้งเตือน', 'ยังไม่มีข้อมูลที่แก้ไข');
                                return;
                            }
                            Ext.Msg.prompt('เหตุผลในการแก้ไข', 'กรุณาระบุเหตุผลเพื่อบันทึกในประวัติ:', function (btn, reason) {
                                reason = String(reason || '').replace(/^\s+|\s+$/g, '');
                                if (btn !== 'ok') {
                                    return;
                                }
                                if (!reason) {
                                    Ext.Msg.alert('แจ้งเตือน', 'กรุณาระบุเหตุผลในการแก้ไข');
                                    return;
                                }
                                editGrid.getEl().mask('กำลังบันทึกข้อมูลและประวัติ...');
                                Ext.Ajax.request({
                                    url: 'tor/api/mnCheckingController.php',
                                    method: 'POST',
                                    params: {
                                        mode: 'UPDATE_CHECKING_RELATIONS',
                                        remarks: reason,
                                        jsonData: Ext.encode(changes)
                                    },
                                    success: function (saveResponse) {
                                        editGrid.getEl().unmask();
                                        var saveResult;
                                        try {
                                            saveResult = Ext.decode(saveResponse.responseText);
                                        } catch (ignore) {
                                            Ext.Msg.alert('ผิดพลาด', 'ข้อมูลตอบกลับไม่ถูกต้อง');
                                            return;
                                        }
                                        if (!saveResult.success) {
                                            Ext.Msg.alert('บันทึกไม่สำเร็จ', saveResult.msg || 'เกิดข้อผิดพลาด');
                                            return;
                                        }
                                        datasetStore.commitChanges();
                                        if (relationLogStore) {
                                            Ext.each(changes, function (savedChange) {
                                                relationLogStore.insert(0, new relationLogStore.recordType({
                                                    log_id: '-',
                                                    table_name: savedChange.table_name,
                                                    row_id: savedChange.row_id,
                                                    row_field: savedChange.row_field,
                                                    field_name: savedChange.field_name,
                                                    old_value: savedChange.old_value,
                                                    new_value: savedChange.new_value,
                                                    user_id: Ext.session.user_id,
                                                    date_create: new Date().format('Y-m-d H:i:s'),
                                                    remarks: reason
                                                }));
                                            });
                                            if (relationLogGrid) {
                                                relationLogGrid.setTitle('ประวัติการแก้ไข (' + relationLogStore.getCount() + ')');
                                            }
                                        }
                                        Ext.Msg.alert('สำเร็จ', saveResult.msg);
                                    },
                                    failure: function () {
                                        editGrid.getEl().unmask();
                                        Ext.Msg.alert('ผิดพลาด', 'ไม่สามารถเชื่อมต่อเพื่อบันทึกข้อมูลได้');
                                    }
                                });
                            }, this, true);
                        }
                    }, {
                        text: 'ยกเลิกการแก้ไข',
                        iconCls: 'icon-cancel',
                        handler: function () {
                            editGrid.stopEditing(true);
                            datasetStore.rejectChanges();
                        }
                    }, '-', {
                        text: 'แสดง/ไม่แสดง ทั้งหมด',
                        iconCls: 'icon-table',
                        enableToggle: true,
                        pressed: true,
                        toggleHandler: function (button, pressed) {
                            var columnModel = editGrid.getColumnModel();
                            for (var columnIndex = 1; columnIndex < columnModel.getColumnCount(); columnIndex++) {
                                columnModel.setHidden(columnIndex, !pressed);
                            }
                            columnSelectorMenu.items.each(function (menuItem) {
                                menuItem.setChecked(pressed, true);
                            });
                        }
                    }, {
                        text: 'เลือก Column',
                        iconCls: 'icon-table-edit',
                        menu: columnSelectorMenu
                    }, '->', {
                        text: 'Refresh',
                        iconCls: 'icon-refresh',
                        handler: function () {
                            relationWindow.close();
                            win_edir_alldata(rec, searchOptions);
                        }
                    }]
                });
                relationDataTabs.push(editGrid);
                relationGridByTable[dataset.table] = editGrid;
            });
            applyRelationFilters();
            if (relationGridByTable.sp_tor_contract) {
                relationGridByTable.sp_tor_contract.on('rowclick', function (contractGrid, rowIndex) {
                    var contractRecord = contractGrid.getStore().getAt(rowIndex);
                    if (!contractRecord) {
                        return;
                    }
                    selectedContractId = contractRecord.get('sp_tor_contract_id');
                    selectedTorPeriodId = null;
                    applyRelationFilters();
                    var nextButton = relationWindow.getTopToolbar().items.get(0);
                    while (relationStepIndex < 4) {
                        openNextRelationStep(nextButton);
                    }
                    relationTabs.setActiveTab(relationGridByTable.sp_tor_hdr_period);
                });
            }
            if (relationGridByTable.sp_tor_hdr_period) {
                relationGridByTable.sp_tor_hdr_period.on('rowclick', function (periodGrid, rowIndex) {
                    var periodRecord = periodGrid.getStore().getAt(rowIndex);
                    if (!periodRecord) {
                        return;
                    }
                    selectedTorPeriodId = periodRecord.get('sp_tor_hdr_period_id');
                    applyRelationFilters();
                    var nextButton = relationWindow.getTopToolbar().items.get(0);
                    while (relationStepIndex < 6) {
                        openNextRelationStep(nextButton);
                    }
                    relationTabs.setActiveTab(relationGridByTable.sp_check_period_hdr);
                });
            }
            relationLogStore = new Ext.data.JsonStore({
                fields: [
                    'log_id', 'table_name', 'row_id', 'row_field', 'field_name',
                    'old_value', 'new_value', 'user_id', 'date_create', 'remarks'
                ],
                data: result.logs || []
            });
            relationLogGrid = new Ext.grid.GridPanel({
                title: 'ประวัติการแก้ไข (' + relationLogStore.getCount() + ')',
                store: relationLogStore,
                stripeRows: true,
                autoScroll: true,
                columns: [
                    new Ext.grid.RowNumberer({ width: 35 }),
                    { header: 'วันที่แก้ไข', dataIndex: 'date_create', width: 135, sortable: true },
                    { header: 'ตาราง', dataIndex: 'table_name', width: 145, sortable: true },
                    { header: 'Row ID', dataIndex: 'row_id', width: 75, sortable: true },
                    { header: 'ฟิลด์', dataIndex: 'field_name', width: 145, sortable: true },
                    { header: 'ค่าเดิม', dataIndex: 'old_value', width: 180, renderer: Ext.util.Format.htmlEncode },
                    { header: 'ค่าใหม่', dataIndex: 'new_value', width: 180, renderer: Ext.util.Format.htmlEncode },
                    { header: 'ผู้แก้ไข', dataIndex: 'user_id', width: 75, sortable: true },
                    { header: 'เหตุผล', dataIndex: 'remarks', width: 260, renderer: Ext.util.Format.htmlEncode }
                ],
                viewConfig: { forceFit: false },
                tbar: [{
                    xtype: 'tbtext',
                    text: '<b>ประวัติจาก NMU_ERPLOG..sys_log_change (ล่าสุด 500 รายการ)</b>'
                }, '->', {
                    text: 'Refresh',
                    iconCls: 'icon-refresh',
                    handler: function () {
                        relationWindow.close();
                        win_edir_alldata(rec, searchOptions);
                    }
                }]
            });
            var nextStepButton = relationWindow.getTopToolbar().items.get(0);
            nextStepButton.enable();
            openNextRelationStep(nextStepButton);
        },
        failure: function () {
            Ext.Msg.alert('ผิดพลาด', 'ไม่สามารถเชื่อมต่อข้อมูลตรวจรับได้', function () {
                if (searchOptions.search_code) {
                    win_edir_alldata(null);
                }
            });
        }
    });
};
