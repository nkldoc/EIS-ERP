/* ===== Enable Bootstrap Popover (on element  ====== */
/* global bootstrap */

const popoverTriggerList = document.querySelectorAll('[data-bs-toggle="popover"]');
const popoverList = [...popoverTriggerList].map(popoverTriggerEl => new bootstrap.Popover(popoverTriggerEl));


const alertList = document.querySelectorAll('.alert')
const alerts = [...alertList].map(element => new bootstrap.Alert(element))

window.addEventListener('load', function () {
    responsiveSidePanel(); 
});
window.addEventListener('resize', function () {
    responsiveSidePanel();
});
function responsiveSidePanel() {
    let w = window.innerWidth;
    if (w >= 1200) {

    } else {

    }
};


Ext.onReady(function () {
    Ext.QuickTips.init();
//    Ext.get('m1').dom.style['display'] = 'none';   
//    Ext.get('m1').dom.style['display'] = 'block';   
//    connectWebsocketExample();
//    Ext.get('bu_downloadID').dom.addEventListener("click", function () {
        //  Ext.onMessageSocket('connectpage','addValue');
//      webSocket.send(Ext.msg);
//    });
    Ext.storeUser = new Ext.data.JsonStore({
        autoDestroy: true,
        url: '../conf/app/user.json',
        storeId: 'myStore',
        root: 'user_online',
        idProperty: 'dc_user_id',
        fields: ['c_full_name', 'dc_user_id', 'dc_cost_id', 'dc_department_id', 'i_online', 'd_online_date', 'cost_name', 'cost_code', 'i_type_user', 'dc_cost_acc_id', 'c_sp_emp', 'c_department_type', 'row']
    });
//    console.log(Ext.session);

    Ext.storeUser.load({
        callback: function (record, operation, success) {
            if (success) {
                record.forEach(function (record) {

//                    console.log(record.get('c_full_name'));
//                    console.log(record.get('dc_user_id'));
//                        console.log(record.get('dc_cost_id')); 
//                        console.log(record.get('c_full_name')); 
//                        console.log(record.get('i_online')); 
//                        console.log(record.get('d_online_date')); 
                });

            }
        }
    });


});

