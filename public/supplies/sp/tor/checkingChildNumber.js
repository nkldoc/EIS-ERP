/* global Ext */
(function () {
    var encode = Ext.util.Format.htmlEncode;
    function preview(id, callback) {
        Ext.Ajax.request({url: 'tor/api/checkingChildPreview.php', method: 'GET',
            params: {sp_check_period_hdr_id: id}, callback: function (options, success, response) {
                var result;
                try { result = Ext.decode(response.responseText); } catch (ignore) {}
                callback(success && result && result.success ? result : null,
                    result && result.msg || 'ไม่สามารถตรวจสอบรูปแบบเลขตรวจรับได้');
            }});
    }
    function message(plan) {
        if (!plan.is_child) return 'สถานะการออกเลข: รายการปกติ';
        return '<b style="color:#b45309">สถานะการออกเลข: รายการลูก (แยกเบิก)</b>' +
            '<br>เลข AP แม่: <b>' + encode(plan.parent_code) + '</b>' +
            '<br>เลข IR ลูก: ' + encode(plan.ir_code || '-') +
            '<br>' + (plan.existing_code ? 'ออกเลข AP แล้ว: ' : 'เลข AP ที่จะออก: ') +
            '<b style="color:#b91c1c">' + encode(plan.proposed_code) + '</b>';
    }
    function showStatus(html) {
        var status = Ext.getCmp('checking-child-number-status');
        if (!status || status.destroyed || status.isDestroyed) return;
        if (status.rendered) status.update(html);
        else status.html = html;
    }
    Ext.loadCheckingChildNumberStatus = function (id) {
        preview(id, function (result, error) { showStatus(result ? message(result.data) : encode(error)); });
    };
    Ext.confirmCheckingChildNumber = function (id, callback, onCancel) {
        preview(id, function (result, error) {
            if (!result) { if (onCancel) onCancel(); Ext.Msg.alert('ตรวจสอบเลขตรวจรับ', error); return; }
            var plan = result.data;
            showStatus(message(plan));
            if (!plan.is_child || plan.existing_code) { callback(result.confirmation_token); return; }
            Ext.Msg.confirm('ยืนยันบันทึกรายการลูก', message(plan) +
                '<br><br>ยืนยันบันทึกรายการหลักและออกเลขตรวจรับตามเลขที่แสดงหรือไม่?', function (answer) {
                    if (answer === 'yes') callback(result.confirmation_token);
                    else if (onCancel) onCancel();
                });
        });
    };
    Ext.clearCheckingChildConfirmation = function () {
        var button = Ext.getCmp('buSaveSub3ID'), token = Ext.getCmp('checking-child-number-token');
        if (button) button.childNumberApproved = false;
        if (token) token.setValue('');
    };
}());
