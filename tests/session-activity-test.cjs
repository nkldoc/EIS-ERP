const fs = require('fs');
const vm = require('vm');
const assert = require('assert');
for (const module of ['procure', 'supplies']) {
    const source = fs.readFileSync(`public/${module}/js/show_nat.js`, 'utf8');
    const start = source.indexOf('    function initSessionTimer() {');
    const end = source.indexOf('    function setAfterLoad()', start);
    let now = 100000, tick, requests = 0, warnings = 0;
    const listeners = {};
    const context = {
        Date: { now: () => now },
        document: { addEventListener: (event, cb) => listeners[event] = cb },
        setInterval: cb => tick = cb,
        Ext: {
            Ajax: { request: opts => { requests++; opts.success({responseText: '{"success":true}'}); } },
            util: { JSON: { decode: JSON.parse } },
            Msg: { confirm: () => warnings++ }
        }
    };
    vm.runInNewContext(source.slice(start, end) + '\ninitSessionTimer();', context);
    now += 61000; tick();
    assert.equal(requests, 0, 'unattended tab must not renew');
    listeners.keydown();
    assert.equal(requests, 1, 'typing renews the session');
    listeners.mousedown();
    assert.equal(requests, 1, 'input is throttled');
    now += 7140000; tick(); tick();
    assert.equal(warnings, 1, 'idle warning opens once');
    console.log(module + ': activity, idle and throttle checks passed');
}
