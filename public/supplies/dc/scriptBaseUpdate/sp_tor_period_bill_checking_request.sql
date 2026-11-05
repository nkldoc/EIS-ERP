-- ตรวจรับ(เวชภัณฑ์) ST00096: คำร้อง "แก้ไขข้อมูล ADMIN" ของเลข AP (เทียบเท่า sp_check_period_disable_acc ของ ST0013)
-- รันซ้ำได้
USE NMU_ERP
GO
IF OBJECT_ID('dbo.sp_tor_period_bill_checking_request', 'U') IS NULL
CREATE TABLE dbo.sp_tor_period_bill_checking_request (
    sp_tor_period_bill_checking_request_id bigint IDENTITY(1,1) PRIMARY KEY,
    c_ir_code nvarchar(50) NOT NULL,
    c_ap_code nvarchar(50) NULL,
    d_doc_date date NULL,
    d_checking_edit date NULL,
    json_select nvarchar(max) NULL,
    c_comment nvarchar(max) NULL,
    i_status int NOT NULL DEFAULT 1,
    i_enable int NOT NULL DEFAULT 1,
    dc_user_create_id bigint NULL,
    dc_user_create_cost_id bigint NULL,
    d_create datetime NULL
)
GO
