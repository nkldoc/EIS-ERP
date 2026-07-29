Ext.storePoExpense = new Ext.tree.TreeLoader({
  baseParams: { type: "po_expense" }, // Permission i_read
  dataUrl: "api/List_poExpense.php"
});

Ext.Condition = new Ext.data.JsonStore({
  fields: ["value", "text"],
  data: [
    { value: "ADD", text: "เพิ่มรายการ" },
    { value: "EDIT", text: "แก้ไขรายการที่เลือก" }
  ]
});
