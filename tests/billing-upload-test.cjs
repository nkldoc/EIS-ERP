const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync(require('node:path').join(__dirname, '../public/procure/sp/tor/spBillingApproved.js'), 'utf8');
const start = source.indexOf('                                function showUploadError(message)');
const end = source.indexOf('                                xhr.send(formData);', start);
assert(start >= 0 && end > start);
function run(status, responseText, event = 'onload') {
    const calls = { hidden: 0, alerts: [], updates: [] };
    const xhr = { status, responseText };
    vm.runInNewContext(source.slice(start, end), {
        xhr, fileNameDoc: 'billing.pdf', billingId: 42,
        Ext: {
            MessageBox: { hide() { calls.hidden++; }, alert(title, msg) { calls.alerts.push(msg); } },
            util: { JSON: { decode: JSON.parse } },
            updateStatu(...args) { calls.updates.push(args); }
        }
    });
    xhr[event]();
    return calls;
}
for (const [status, body] of [[413, '<html>Too large</html>'], [500, '<html>Error</html>'], [200, '<html>Login</html>'], [200, '{"success":false}'], [200, 'null'], [200, '{}'], [200, '{"status":"error"}']]) {
    const calls = run(status, body);
    assert.equal(calls.updates.length, 0);
    assert.equal(calls.alerts.length, 1);
    assert.equal(calls.hidden, 1);
}
for (const event of ['onerror', 'onabort', 'ontimeout']) {
    const calls = run(0, '', event);
    assert.equal(calls.updates.length, 0);
    assert.equal(calls.alerts.length, 1);
    assert.equal(calls.hidden, 1);
}
assert.deepEqual(run(200, '{"success":true}').updates, [['billing.pdf', 42]]);
assert.deepEqual(run(200, '{"status":"success"}').updates, [['billing.pdf', 42]]);
console.log('Billing upload: 12 response/event cases passed.');
