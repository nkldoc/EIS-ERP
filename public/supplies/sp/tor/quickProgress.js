/* global Ext */
(function () {
    var MENU_PROGRESS_MAP = {
        ST0001: "รอดำเนินการ", ST0002: "รอดำเนินการ",
        ST0003: "อยู่ระหว่างดำเนินการ", ST0004: "อยู่ระหว่างดำเนินการ",
        ST0005: "อยู่ระหว่างดำเนินการ", ST0006: "อยู่ระหว่างดำเนินการ",
        ST0007: "อยู่ระหว่างดำเนินการ", ST0008: "บริหารสัญญา",
        ST0009: "บริหารสัญญา", ST0010: "ตรวจรับ", ST0011: "ตรวจรับ",
        ST0012: "ขออนุมัติเบิกจ่ายเงิน", ST0013: "ขออนุมัติเบิกจ่ายเงิน",
        ST0014: "เบิกจ่ายเงินเสร็จสิ้น"
    };

    function progressFromMenu(menuCode, menuName) {
        var name = String(menuName || "");
        if (MENU_PROGRESS_MAP[menuCode]) return MENU_PROGRESS_MAP[menuCode];
        if (/สัญญา|ข้อตกลง|ลงนาม/.test(name)) return "บริหารสัญญา";
        if (/ตรวจสอบเอกสาร|เสนอราคา|พิจารณา|ประกาศ|e-GP|e-bidding|e-market|คัดเลือก|เฉพาะเจาะจง|เจรจา/.test(name)) {
            return "อยู่ระหว่างดำเนินการ";
        }
        return "รอดำเนินการ";
    }

    function isProgressMenu(menuName) {
        var name = String(menuName || "");
        // แสดงตั้งแต่ PR เริ่มดำเนินการจนถึงหน้ารายละเอียดสัญญาเท่านั้น
        return !/ส่งมอบ|ตรวจรับ|เบิก|จ่าย|รับประกัน|คืนหลักประกัน|ปิดสัญญา|ยกเลิกสัญญา/.test(name);
    }

    function valueFrom(record, names) {
        var i, value;
        if (!record) return null;
        for (i = 0; i < names.length; i++) {
            value = record.get ? record.get(names[i]) : record[names[i]];
            if ((value === null || typeof value === "undefined" || value === "") && record.data) value = record.data[names[i]];
            if (value !== null && typeof value !== "undefined" && value !== "") return value;
        }
        return null;
    }

    function selectDefaultType(combo, menuCode) {
        var wanted = progressFromMenu(menuCode, Ext.menu_name);
        var found = combo.getStore().find("c_name", wanted, 0, false, true);
        if (found >= 0) combo.setValue(combo.getStore().getAt(found).get("id"));
    }

    Ext.quickProgressMenuMap = MENU_PROGRESS_MAP;
    Ext.quickProgressFromMenu = progressFromMenu;
    Ext.openQuickProgress = function (record, config) {
        config = config || {};
        if (!record) {
            Ext.Msg.alert("แจ้งเตือน", "กรุณาเลือกรายการ PR ที่ต้องการบันทึก");
            return;
        }
        var menuCode = config.menuCode || Ext.menu_code || "";
        var menuName = config.menuName || Ext.menu_name || menuCode;
        var typeStore = new Ext.data.JsonStore({
            url: config.typeUrl || "api/All_PoWorkingImpHdr.php",
            baseParams: {type: "sp_event_type"}, root: "data", idProperty: "id",
            fields: ["id", "c_name"], autoLoad: false
        });
        var typeCombo = new Ext.form.ComboBox({
            fieldLabel: "ประเภทความก้าวหน้า", name: "event_type", anchor: "98%",
            store: typeStore, valueField: "id", displayField: "c_name", mode: "local",
            triggerAction: "all", forceSelection: true, editable: false, allowBlank: false,
            emptyText: "เลือกประเภทความก้าวหน้า...", listWidth: 320
        });
        var detailField = new Ext.form.TextArea({
            fieldLabel: "ความก้าวหน้า", name: "event_detail", anchor: "98%", height: 80, allowBlank: false
        });
        var adminMapButton = new Ext.Button({
            text: "ตั้งค่า Map สถานะ (Admin)",
            icon: "../images/icons/application_edit.png",
            hidden: !(Ext.session && (Number(Ext.session.dc_center_user) === 1 || Number(Ext.session.user_id) === 1)),
            handler: function () {
                if (!typeCombo.getValue()) {
                    Ext.Msg.alert("ข้อมูลไม่ครบ", "กรุณาเลือกประเภทความก้าวหน้าที่ต้องการ Map ก่อน");
                    return;
                }
                Ext.Msg.confirm(
                    "ยืนยัน Mapping สถานะ",
                    "กำหนดเมนู “" + menuName + "” ให้มีค่าเริ่มต้นเป็น “" + typeCombo.getRawValue() + "” ใช่หรือไม่?",
                    function (answer) {
                        if (answer !== "yes") return;
                        Ext.Ajax.request({
                            url: config.saveUrl || "tor/api/mnTorController.php",
                            method: "POST",
                            params: {
                                mode: "SAVE_PROGRESS_MENU_MAP",
                                menu_code: menuCode,
                                menu_name: menuName,
                                event_type: typeCombo.getValue()
                            },
                            success: function (response) {
                                var result;
                                try { result = Ext.decode(response.responseText); } catch (ignore) {}
                                Ext.Msg.alert(result && result.success ? "สำเร็จ" : "บันทึกไม่สำเร็จ",
                                    result && result.msg ? result.msg : response.responseText);
                            },
                            failure: function () { Ext.Msg.alert("บันทึกไม่สำเร็จ", "ไม่สามารถเชื่อมต่อระบบได้"); }
                        });
                    }
                );
            }
        });
        var form = new Ext.form.FormPanel({
            border: false, labelWidth: 145, autoScroll: true,
            bodyStyle: "padding:16px 12px 12px 12px;",
            items: [typeCombo, detailField, {
                xtype: "panel", border: false, bodyStyle: "padding:4px 0 0 145px;background:transparent;",
                items: [adminMapButton]
            }]
        });
        var win = new Ext.Window({
            title: "บันทึกความก้าวหน้า - " + (valueFrom(record, ["c_code", "pr_code", "tor_code"]) || "รายการ PR"),
            width: 560, height: 280, minWidth: 500, minHeight: 250,
            modal: true, resizable: true, layout: "fit", constrainHeader: true, items: [form],
            buttons: [{
                text: "บันทึก", iconCls: "icon-save",
                handler: function () {
                    if (!form.getForm().isValid()) {
                        Ext.Msg.alert("ข้อมูลไม่ครบ", "กรุณาเลือกประเภทและระบุความก้าวหน้า");
                        return;
                    }
                    var selectedType = typeStore.getById(String(typeCombo.getValue()));
                    Ext.Ajax.request({
                        url: config.saveUrl || "tor/api/mnTorController.php", method: "POST",
                        params: {
                            mode: "Save_Event_Notor",
                            sp_tor_id: valueFrom(record, ["sp_tor_id", "id", "tor_id"]),
                            sp_tor_contract_id: valueFrom(record, ["sp_tor_contract_id", "sp_contract_id"]),
                            tor_status_id: Ext.menu_id || null,
                            sp_status_hdr_name: menuName,
                            menu_code: menuCode,
                            event_type: typeCombo.getValue(),
                            event_title: selectedType ? selectedType.get("c_name") : typeCombo.getRawValue(),
                            event_detail: detailField.getValue()
                        },
                        success: function (response) {
                            var result;
                            try { result = Ext.decode(response.responseText); } catch (ignore) {}
                            if (result && result.success) {
                                Ext.Msg.alert("สำเร็จ", result.msg || "บันทึกความก้าวหน้าเรียบร้อยแล้ว");
                                win.close();
                                if (config.store && config.store.reload) config.store.reload();
                            } else Ext.Msg.alert("บันทึกไม่สำเร็จ", result && result.msg ? result.msg : response.responseText);
                        },
                        failure: function () { Ext.Msg.alert("บันทึกไม่สำเร็จ", "ไม่สามารถเชื่อมต่อระบบได้"); }
                    });
                }
            }, {text: "ยกเลิก", handler: function () { win.close(); }}]
        });
        typeStore.on("load", function () {
            selectDefaultType(typeCombo, menuCode);
            Ext.Ajax.request({
                url: config.saveUrl || "tor/api/mnTorController.php",
                params: {mode: "GET_PROGRESS_MENU_MAP", menu_code: menuCode},
                success: function (response) {
                    var result;
                    try { result = Ext.decode(response.responseText); } catch (ignore) {}
                    if (result && result.success && result.data && result.data.event_type) {
                        typeCombo.setValue(String(result.data.event_type));
                    }
                }
            });
        });
        win.show();
        typeStore.load();
    };

    // หน้า pageStatus ใช้ไฟล์ JS คนละตัวตามแต่ละเมนู จึงเติมคำสั่งนี้ให้ context menu
    // ของกริด PR จากจุดกลาง แทนการคัดลอกโค้ดลงทุก stXXXX.js
    var originalShowAt = Ext.menu.Menu.prototype.showAt;
    Ext.menu.Menu.prototype.showAt = function () {
        var menu = this;
        var hasManage = false;
        var hasProgress = false;
        var row = Ext.selectRow;
        if (menu.id !== "mainMenu" && menu.items && row && isProgressMenu(Ext.menu_name)) {
            menu.items.each(function (item) {
                var text = String(item.text || "");
                if (text.indexOf("จัดการข้อมูล View/Copy/Edit/Delete") >= 0) hasManage = true;
                if (text === "บันทึกความก้าวหน้า") hasProgress = true;
            });
            if (hasManage && !hasProgress && valueFrom(row, ["sp_tor_id", "id", "tor_id"])) {
                menu.add({
                    text: "บันทึกความก้าวหน้า",
                    icon: "../images/icons/application_form_edit.png",
                    handler: function () {
                        Ext.openQuickProgress(row, {
                            menuCode: Ext.menu_code,
                            menuName: Ext.menu_name,
                            store: Ext.storeDtl
                        });
                    }
                });
            }
        }
        return originalShowAt.apply(this, arguments);
    };
})();
