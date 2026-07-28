Ext.yearTh = function () {
  let years = [];
  let currentTime = new Date();
  let now = currentTime.getFullYear() + 1;
  let id = currentTime.getFullYear() - 3;
  while (id <= now) {
    let c_name = id + 543;
    years.push({
      id,
      c_name,
    });
    id++;
  }

  let Date_now = new Date();
  Date_now = Date_now.toISOString().split("T")[0].split("-");
  Ext.bgYear = Date_now[0] - 0 + ((Date_now[1] < 10 ? 0 : 1) - 0);
  return years;
};
Ext.yearCombo = new Ext.form.ComboBox({
    fieldLabel: 'ปีงบประมาณ',
    id: 'budget_year_filter',
    name: 'budget_year_filter',
    store: Ext.store_year,
    displayField: 'c_name',   // แสดงชื่อปี พ.ศ.
    valueField: 'id',         // ค่า value เป็น ค.ศ.
    mode: 'local',
    triggerAction: 'all',
    editable: false,
    width: 120,
    value: new Date().getFullYear() + 543, // ตั้งค่าปีปัจจุบันเป็นค่าเริ่มต้น
});