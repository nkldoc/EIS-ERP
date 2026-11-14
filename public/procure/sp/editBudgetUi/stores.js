// ================================ Store for Contract List ================================ //
Ext.store = new Ext.data.JsonStore({
    autoDestroy: false,
    url: "./editBudgetUi/php/mn_editContractBudgetController.php",
    baseParams: {
        mode: "LOAD_CONTRACT_LIST",
    },
    root: "data",
    idProperty: "id",
    fields: [
        "id",
        "sp_tor_contract_id",
        "c_contract_no",
        "c_creditor_name",
        "c_expense_budget_type_name",
        "c_expense_name",
        "f_contract_total",
        "d_contract_date",
        "i_budget_year",
        "dc_expense_budget_type_id",
        "po_expense_id",
        "dc_cost_id",
        "f_reserve_money_pr",
        "f_budget_pr",
        "f_budget_remain",
    ],
    remoteSort: true,
});

// ================================ Store for Budget Reserve Money PR ================================ //
Ext.bg_reserve_money_pr = new Ext.data.JsonStore({
    autoDestroy: false,
    url: "./editBudgetUi/php/mn_editContractBudgetController.php",
    baseParams: {
        mode: "LOAD_BUDGET_RESERVE",
    },
    root: "data",
    idProperty: "id",
    fields: [
        "id",
        "sp_tor_contract_id",
        "dc_expense_budget_type_id",
        "dc_expense_budget_type_name",
        "po_expense_id",
        "bg_expense_name",
        "dc_cost_id",
        "dc_cost_name",
        "i_budget_year",
        "f_reserve_money_pr",
        "f_budget_pr",
        "f_budget_remain",
        "d_last_modify_dt",
    ],
});

