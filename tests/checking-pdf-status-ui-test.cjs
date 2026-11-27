const fs=require('fs'),vm=require('vm'),assert=require('assert');
const source=fs.readFileSync(__dirname+'/../public/supplies/sp/tor/checking.js','utf8');
const controls={};
['upload_pdf1','saveCheckingPdfID','unlockCheckingPdfID','storedCheckingPdfID','resetCheckingPdfID'].forEach(id=>controls[id]={setVisible(v){this.visible=v;},setDisabled(v){this.disabled=v;},setValue(v){this.value=v;},enable(){this.disabled=false;}});
const Ext={session:{dc_center_user:0},selectRow:{data:{i_is_upload_chk:'upload_Chk/IRTEST.pdf',pdf_payment_status:2}},check_pdf:1,getCmp:id=>controls[id],util:{Format:{htmlEncode:String}}};
const context={Ext};vm.createContext(context);
vm.runInContext(source.slice(source.indexOf('                function hasCheckingPdf()'),source.indexOf('                function getPDF(')),context);
function sync(){vm.runInContext('syncCheckingPdfUpload()',context);}
sync();assert(!controls.upload_pdf1.visible&&controls.upload_pdf1.disabled);
Ext.session.dc_center_user=1;controls.upload_pdf1.adminPdfUnlocked=true;sync();
assert(!controls.saveCheckingPdfID.visible&&controls.saveCheckingPdfID.disabled);assert(!controls.unlockCheckingPdfID.visible);assert(!controls.resetCheckingPdfID.visible);
Ext.check_pdf=0;Ext.selectRow.data.i_is_upload_chk=null;sync();assert(!controls.upload_pdf1.visible);
Ext.check_pdf=1;Ext.selectRow.data.i_is_upload_chk='old.pdf';Ext.selectRow.data.pdf_payment_status=3;Ext.session.dc_center_user=0;sync();
assert(controls.upload_pdf1.visible&&!controls.upload_pdf1.disabled);assert(controls.saveCheckingPdfID.visible);assert(!controls.storedCheckingPdfID.visible);
Ext.selectRow.data.pdf_payment_status=0;sync();assert(!controls.upload_pdf1.visible);
Ext.session.dc_center_user=0;controls.upload_pdf1.adminPdfUnlocked=false;
[null,1,3].forEach(status=>{
  Ext.selectRow.data.pdf_payment_status=status;
  Ext.check_pdf=0;Ext.selectRow.data.i_is_upload_chk=null;sync();
  assert(controls.upload_pdf1.visible&&!controls.upload_pdf1.disabled,'First upload status '+status);
  assert(controls.saveCheckingPdfID.visible&&!controls.saveCheckingPdfID.disabled);
});
console.log('PASS: status 2 locks staff/admin/released PDF; status 3 permits staff replacement');
console.log('PASS: NULL, 1, 3 permit first upload for staff');
[4,5,11,99].forEach(status=>{
  [0,1].forEach(admin=>{
    [false,true].forEach(hasPdf=>{
      Ext.session.dc_center_user=admin;Ext.selectRow.data.pdf_payment_status=status;
      Ext.check_pdf=hasPdf?1:0;Ext.selectRow.data.i_is_upload_chk=hasPdf?'old.pdf':null;
      controls.upload_pdf1.adminPdfUnlocked=true;sync();
      assert(!controls.upload_pdf1.visible&&controls.upload_pdf1.disabled);
      assert(!controls.saveCheckingPdfID.visible&&controls.saveCheckingPdfID.disabled);
      assert(!controls.unlockCheckingPdfID.visible&&!controls.resetCheckingPdfID.visible);
    });
  });
});
console.log('PASS: all tested statuses above 3 lock staff/admin, with or without existing PDF');
