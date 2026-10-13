USE NMU_ERP;
GO
/* ตารางเวชภัณฑ์ 3 ตัว พร้อมระบุ "ชื่อเดิมใน ERP" ของแต่ละฟิลด์ (เขียนหลัง  --  ERP: )
   สัญลักษณ์  =  ชื่อเดียวกัน/ใช้แทนกันได้ตรงๆ   ≈  ใกล้เคียง (ความหมายคล้าย แต่ไม่เหมือนเป๊ะ)   ใหม่  =  ไม่มีใน ERP เดิม
   ตารางเดิมของ ERP: sp_tor (PR)  sp_tor_dtl (รายการใน PR)  sp_tor_contract (สัญญา)  sp_tor_hdr_period (งวด)
                     sp_tor_dtl_period (รายการต่องวด)  sp_check_period_hdr/_dtl (ตรวจรับ)  ใบเบิก = NMU_EIS.po_working_hdr */

-- ============ sp_tor_period_bill  (ERP: รวม sp_tor + sp_tor_contract + sp_tor_hdr_period ไว้แถวเดียว) ============
CREATE TABLE [dbo].[sp_tor_period_bill] (
    [sp_tor_period_bill_id] bigint IDENTITY(1,1) NOT NULL,          -- ใหม่ (PK 1 แถว = 1 งวด)
    [sp_tor_period_bill_hdr_id] bigint NOT NULL,                    -- ใหม่ (รหัสกลุ่มสัญญา ≈ sp_tor_contract.sp_tor_contract_id)
    [sp_tor_contract_id] bigint NULL,                               -- = sp_tor_contract.sp_tor_contract_id  (ใบเบิก: po_id)
    [sp_tor_hdr_period_id] bigint NULL,                             -- = sp_tor_hdr_period.sp_tor_hdr_period_id (ใบเบิก: per_id)
    [c_contract_code] varchar(100) NULL,                            -- = sp_tor_contract.c_code / sp_tor_hdr_period.c_contract_code
    [i_period] int NULL,                                            -- = sp_tor_hdr_period.i_period
    [c_doc_ref] varchar(100) NULL,                                  -- ≈ sp_check_period_hdr.c_doc_ref (เลขที่ใบส่งของ/ใบแจ้งหนี้ของงวด)
    [d_doc_dateSub] date NULL,                                      -- ≈ sp_tor_hdr_period.d_doc_date
    [f_period_amt] decimal(18,2) NULL,                              -- ≈ sp_tor_hdr_period.f_total_amt
    [c_detail] varchar(500) NULL,                                   -- ≈ sp_tor_hdr_period.c_discription
    [dc_cost_id] bigint NULL,                                       -- = sp_tor.dc_cost_id
    [i_enabled] tinyint NOT NULL DEFAULT ((1)),                     -- = i_enabled (ERP ทุกตาราง)
    [dc_user_create_id] bigint NULL,                                -- = dc_user_create_id
    [dc_user_create_cost_id] bigint NULL,                           -- = dc_user_create_cost_id (ERP มี dc_user_create_department_id เพิ่ม)
    [d_create] datetime NULL,                                       -- = d_create
    [dc_user_update_id] bigint NULL,                                -- = dc_user_update_id
    [dc_user_update_cost_id] bigint NULL,                           -- = dc_user_update_cost_id
    [d_update] datetime NULL,                                       -- = d_update
    [c_project_name] varchar(500) NULL,                             -- = sp_tor.c_name (ชื่อโครงการ/เรื่อง)  ≈ sp_tor_contract.c_name
    [i_budget_year] int NULL,                                       -- ≈ sp_tor.i_yyyy / sp_tor_hdr_period.i_yyyy (เก็บ ค.ศ.)
    [d_start_date] date NULL,                                       -- = sp_tor_contract.d_start_date
    [d_end_date] date NULL,                                         -- ≈ sp_tor_contract.d_due_date
    [c_po_no] varchar(100) NULL,                                    -- = sp_tor_contract.c_po_no
    [dc_creditor_id] bigint NULL,                                   -- = sp_tor_contract.dc_creditor_id
    [c_creditor_name] varchar(250) NULL,                            -- ≈ NMU.dbo.dc_creditor.c_name (ERP ใช้ join ไม่เก็บซ้ำ)
    [c_tax_number_imp] varchar(50) NULL,                            -- ≈ NMU.dbo.dc_creditor (เลขผู้เสียภาษี)
    [dc_expense_budget_type_id] bigint NULL,                        -- = sp_tor.dc_expense_budget_type_id  (แหล่งเงิน 1)
    [f_fund_amt] decimal(18,2) NULL,                                -- = sp_tor.f_type_amt
    [dc_expense_budget_type_id2] bigint NULL,                       -- = sp_tor.dc_expense_budget_type2_id (แหล่งเงิน 2)
    [c_fund_source2] varchar(200) NULL,                             -- ≈ dc_expense_budget_type.c_name (ERP ใช้ join)
    [f_fund_amt2] decimal(18,2) NULL,                               -- = sp_tor.f_type2_amt
    [dc_expense_budget_type_id3] bigint NULL,                       -- = sp_tor.dc_expense_budget_type3_id (แหล่งเงิน 3)
    [c_fund_source3] varchar(200) NULL,                             -- ≈ dc_expense_budget_type.c_name
    [f_fund_amt3] decimal(18,2) NULL,                               -- = sp_tor.f_type3_amt
    [po_expense_id] bigint NULL,                                    -- = sp_tor.po_expense_id (รายการย่อย/ค่าใช้จ่าย)
    [c_contract_type] varchar(50) NULL,                             -- ≈ sp_tor_contract.i_notor / i_parent (ประเภทสัญญา)
    [c_fund_source] varchar(200) NULL,                              -- ≈ dc_expense_budget_type.c_name (แหล่งเงิน 1)
    [c_expense_name] varchar(500) NULL,                             -- ≈ po_expense.c_code + c_name (ERP ใช้ join)
    [dc_expense_budget_type_id_dtl] bigint NULL,                    -- = sp_tor_hdr_period.dc_expense_budget_type_id (แหล่งเงินของงวด)
    [c_fund_source_dtl] varchar(200) NULL,                          -- ≈ dc_expense_budget_type.c_name
    [f_fund_amt_dtl] decimal(18,2) NULL,                            -- ≈ sp_tor_hdr_period.f_total_amt (เงินของงวดจากแหล่งนั้น)
    [c_subject] varchar(500) NULL,                                  -- ใหม่ (หัวเรื่อง)
    [c_ap_dept_type] varchar(10) NULL,                              -- ใหม่ (APPS/APMD/APMS ไว้ต่อท้ายเลข AP/PR)
    [i_type_bg] tinyint NULL,                                       -- = sp_tor.i_type_bg (ประเภท PR อ้าง sp_type_bg)
    [c_pr_code] varchar(50) NULL,                                   -- = sp_tor.c_code (เลข PR)
    [i_purchase] tinyint NULL,                                      -- = sp_tor.i_purchase (1 ซื้อ 2 จ้าง 3 เช่า)
    [i_product_type] tinyint NULL,                                  -- = sp_tor.i_product_type (1 วัสดุ 2 ครุภัณฑ์)
    [c_pr_doc_ref] varchar(100) NULL,                               -- ไม่พบคอลัมน์ตรงตัวใน sp_tor (ตรวจแล้ว: ERP ไม่มี c_doc_ref ใน sp_tor)
    [d_pr_doc_ref] date NULL,                                       -- = sp_tor.d_doc_ref (วันที่เอกสารอ้างอิง)
    [i_pr_type] tinyint NULL,                                       -- = sp_tor.i_pr_type1 (แบบแผน/แบบงวด แหล่ง 1)
    [i_pr_type2] tinyint NULL,                                      -- = sp_tor.i_pr_type2
    [i_pr_type3] tinyint NULL,                                      -- = sp_tor.i_pr_type3
    [c_overlap] varchar(100) NULL,                                  -- = sp_tor_contract.c_overlap / sp_tor_hdr_period.c_overlap (เลขที่ใบกันเหลื่อม)
    [c_overlap2] varchar(100) NULL,                                 -- ใหม่ (ERP มีช่องเดียว)
    [c_overlap3] varchar(100) NULL,                                 -- ใหม่
    [i_budget_year_overlap] varchar(10) NULL,                       -- ≈ sp_tor_contract.i_yyyy_overlap (ERP เก็บเป็นตัวเลข ค.ศ.)
    [i_budget_year_overlap2] varchar(10) NULL,                      -- ใหม่
    [i_budget_year_overlap3] varchar(10) NULL,                      -- ใหม่
    [sp_tor_id] bigint NULL,                                        -- = sp_tor.tor_id (ใบเบิก: pr_id)
    [bg_reserve_money_id] bigint NULL,                              -- = sp_tor.bg_reserve_money1_id (ใบจองเงินแหล่ง 1 อยู่ NMU_EIS.bg_reserve_money)
    [c_ap_arrive_code] varchar(100) NULL,                           -- ใหม่ (เลขตอบกลับจาก AP-API ตอนจองเงิน)
    [c_ap_api_response] varchar(4000) NULL,                         -- ใหม่ (JSON ตอบกลับ AP-API)
    [d_ap_reserve] datetime NULL,                                   -- ใหม่ (วันที่จองเงิน)
    [bg_reserve_money_id2] bigint NULL,                             -- = sp_tor.bg_reserve_money2_id
    [bg_reserve_money_id3] bigint NULL,                             -- = sp_tor.bg_reserve_money3_id
    [c_ap_arrive_code2] varchar(100) NULL,                          -- ใหม่
    [c_ap_arrive_code3] varchar(100) NULL,                          -- ใหม่
    [d_ap_reserve2] datetime NULL,                                  -- ใหม่
    [d_ap_reserve3] datetime NULL,                                  -- ใหม่
    CONSTRAINT [PK_sp_tor_period_bill] PRIMARY KEY ([sp_tor_period_bill_id])
);
GO

-- ============ sp_tor_period_bill_receive  (ERP: ส่วนรับของ/ส่งมอบงาน ของ sp_check_period_hdr) ============
CREATE TABLE [dbo].[sp_tor_period_bill_receive] (
    [sp_tor_period_bill_receive_id] bigint IDENTITY(1,1) NOT NULL,  -- ใหม่ (PK)
    [sp_tor_period_bill_id] bigint NOT NULL,                        -- ≈ sp_check_period_hdr.sp_tor_hdr_period_id (ผูกงวด)
    [c_receive_code] varchar(100) NULL,                             -- ≈ sp_check_period_hdr.c_arrive_code / c_doc_ref (เลขใบส่งของ)
    [d_receive_date] date NULL,                                     -- = sp_check_period_hdr.d_receive_date / d_arrive_date
    [c_detail] varchar(500) NULL,                                   -- ≈ sp_check_period_hdr.c_comment
    [f_amt] decimal(18,2) NULL,                                     -- ≈ sp_check_period_dtl.f_net_total_price
    [c_ap_code] varchar(50) NULL,                                   -- = sp_check_period_hdr.c_code (เลข AP เช่น AP20240300026) ใบเบิก: c_code_debt
    [d_ap_issue] datetime NULL,                                     -- ≈ sp_check_period_hdr.d_create (วันที่ออกเลข AP)
    [i_enabled] tinyint NOT NULL DEFAULT ((1)),                     -- = i_enabled
    [dc_user_create_id] bigint NULL,                                -- = dc_user_create_id
    [dc_user_create_cost_id] bigint NULL,                           -- = dc_user_create_cost_id
    [d_create] datetime NULL,                                       -- = d_create
    [dc_user_update_id] bigint NULL,                                -- = dc_user_update_id
    [dc_user_update_cost_id] bigint NULL,                           -- = dc_user_update_cost_id
    [d_update] datetime NULL,                                       -- = d_update
    [c_ir_code] varchar(50) NULL,                                   -- ใหม่ (เลข IR ใบรับของ ERP เดิมไม่มี - จำลองก่อนเชื่อม API จริง)
    [d_ir_issue] datetime NULL,                                     -- ใหม่
    CONSTRAINT [PK_sp_tor_period_bill_receive] PRIMARY KEY ([sp_tor_period_bill_receive_id])
);
GO

-- ============ sp_tor_period_bill_checking  (ERP: sp_check_period_hdr = หน้า ST0013 ตรวจรับ) ============
CREATE TABLE [dbo].[sp_tor_period_bill_checking] (
    [sp_tor_period_bill_checking_id] int IDENTITY(1,1) NOT NULL,    -- = sp_check_period_hdr.sp_check_period_hdr_id (ใบเบิก: chk_id)
    [c_ir_code] varchar(50) NOT NULL,                               -- ใหม่ (ตัวเชื่อมกับ receive; ERP ผูกด้วย hdr_id)
    [d_doc_complete] date NULL,                                     -- ≈ sp_check_period_hdr.d_doc_arrive_dt (วันที่เอกสารครบ)
    [d_checking] date NULL,                                         -- = sp_check_period_hdr.d_checking_date
    [c_egp_no] varchar(100) NULL,                                   -- = sp_check_period_hdr.c_egp_no
    [c_disburse_detail] varchar(500) NULL,                          -- ≈ sp_check_period_dtl.c_name / sp_check_period_hdr.c_comment (รายการส่งเบิก)
    [i_budget_year_use] int NULL,                                   -- = sp_check_period_hdr.i_yyyy (ปีงบที่ใช้จริง; เวชภัณฑ์เก็บ พ.ศ.)
    [f_total_vat] money NULL,                                       -- ≈ sp_check_period_hdr.f_total / f_total_add_vat_amt
    [b_vat] bit NOT NULL DEFAULT ((1)),                             -- ≈ sp_check_period_hdr.i_new_vat / i_is_prepv (มี VAT หรือไม่)
    [f_vat_percent] decimal(5,2) NOT NULL DEFAULT ((7)),            -- = sp_check_period_hdr.f_rate_vat (ใบเบิก: f_per_vat_rate)
    [f_before_vat] money NULL,                                      -- ≈ ยอดก่อน VAT (ERP คำนวณจาก sp_tranf_item.f_net_total_price - f_vat_amt)
    [f_vat_amt] money NULL,                                         -- = sp_check_period_hdr.f_vat_amt
    [f_request_amt] money NULL,                                     -- = sp_check_period_hdr.f_inv_vat (ยอดรวม VAT ใบเบิก: f_inv_vat)
    [b_wht] bit NOT NULL DEFAULT ((1)),                             -- ≈ sp_check_period_hdr.i_tax_personal
    [f_wht_percent] decimal(5,2) NOT NULL DEFAULT ((1)),            -- = sp_check_period_hdr.f_tax_personal_rate
    [f_wht_amt] money NULL,                                         -- = sp_check_period_hdr.f_tax_personal
    [f_penalty] money NOT NULL DEFAULT ((0)),                       -- = sp_check_period_hdr.f_fine_amt (ใบเบิก: f_per_fine)
    [b_guarantee] bit NOT NULL DEFAULT ((0)),                       -- ≈ sp_check_period_hdr.i_is_warranty
    [f_guarantee_percent] decimal(5,2) NOT NULL DEFAULT ((0)),      -- ≈ sp_check_period_hdr.f_tax_warranty_rate
    [f_guarantee_amt] money NULL,                                   -- = sp_check_period_hdr.f_warranty / f_per_warranty
    [f_other] money NOT NULL DEFAULT ((0)),                         -- = sp_check_period_hdr.f_other / f_per_other
    [f_pay_amt] money NULL,                                         -- = sp_check_period_hdr.f_pay
    [dc_cost_responsible_id] int NULL,                              -- ≈ sp_tor.dc_cost2_id (หน่วยงานรับผิดชอบ)
    [dc_cost_owner_id] int NULL,                                    -- ≈ sp_tor.dc_cost_id (หน่วยงานเจ้าของงบ)
    [i_enabled] bit NOT NULL DEFAULT ((1)),                         -- = i_enabled
    [dc_user_create_id] int NULL,                                   -- = dc_user_create_id
    [dc_user_create_cost_id] int NULL,                              -- = dc_user_create_cost_id
    [d_create] datetime NULL,                                       -- = d_create
    [dc_user_update_id] int NULL,                                   -- = dc_user_update_id
    [dc_user_update_cost_id] int NULL,                              -- = dc_user_update_cost_id
    [d_update] datetime NULL,                                       -- = d_update
    [c_overlap_no] varchar(50) NULL,                                -- = sp_check_period_hdr.c_overlap (ใบเบิก: c_booking)
    [i_budget_year_ref] int NULL,                                   -- ≈ sp_check_period_hdr.i_yyyy_overlap (ERP เก็บ ค.ศ. / เวชภัณฑ์เก็บ พ.ศ.)
    [c_item_name] varchar(300) NULL,                                -- ≈ sp_check_period_dtl.c_name
    CONSTRAINT [PK_sp_tor_period_bill_checking] PRIMARY KEY ([sp_tor_period_bill_checking_id])
);
GO
