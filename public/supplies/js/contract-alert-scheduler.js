(function () {
    'use strict';
    let busy=false;
    async function poll() {
        if (busy || document.visibilityState!=='visible' || !window.Ext) return;
        busy=true;
        try {
            const response=await fetch('/supplies/bi/api/contractAlerts.php?mode=scheduled',{credentials:'same-origin',cache:'no-store'});
            const result=await response.json();
            if (!response.ok || !result.success || !result.items.length) return;
            const encode=value=>Ext.util.Format.htmlEncode(String(value||''));
            const html=result.items.map(item=>'<p><b>'+encode(item.code)+'</b> '+encode(item.name)+'<br>'+(item.days<0?'เกินกำหนด '+Math.abs(item.days)+' วัน':'เหลือ '+item.days+' วัน')+'</p>').join('');
            new Ext.Window({title:'แจ้งเตือนสัญญาตามกำหนดเวลา ('+result.items.length+')',modal:false,autoScroll:true,width:560,height:420,
                bodyStyle:'padding:18px;background:white',html:html,buttons:[{text:'เปิดรายการแจ้งเตือน',handler:function () {
                    window.open('/supplies/bi/contract-alert-dashboard.html','_blank','noopener');
                }}]}).show();
        } catch (error) { console.error('Contract alert schedule:',error); }
        finally {busy=false;}
    }
    Ext.onReady(function () {poll();setInterval(poll,60000);});
}());
