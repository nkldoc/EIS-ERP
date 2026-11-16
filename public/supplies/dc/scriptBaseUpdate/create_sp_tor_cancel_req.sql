/* ============================================================================
   create_sp_tor_cancel_req.sql  (NMU_ERP)  รันครั้งเดียว (รันซ้ำได้ ไม่ซ้ำตาราง)
   ตารางคำขอยกเลิก PR จากหน้า "ตรวจสอบเอกสาร" -> ผู้อนุมัติ = จัดสรรงบประมาณพัสดุ (dc_user_id 60104)
   i_status : 1 = รออนุมัติ, 2 = อนุมัติแล้ว (PR ถูกยกเลิก + คืนเงินจอง), 3 = ไม่อนุมัติ
   ============================================================================ */
USE NMU_ERP;
IF OBJECT_ID('dbo.sp_tor_cancel_req') IS NULL
BEGIN
    CREATE TABLE dbo.sp_tor_cancel_req (
        sp_tor_cancel_req_id INT IDENTITY(1,1) PRIMARY KEY,
        tor_id               INT          NOT NULL,
        sp_status_hdr_id     INT          NULL,            -- สถานะ PR ตอนขอยกเลิก
        c_reason             NVARCHAR(1000) NOT NULL,      -- สาเหตุที่จะยกเลิก
        i_status             TINYINT      NOT NULL DEFAULT 1,
        dc_user_req_id       INT          NULL,
        dc_user_req_cost_id  INT          NULL,
        d_req                DATETIME     NOT NULL DEFAULT GETDATE(),
        c_result_comment     NVARCHAR(1000) NULL,          -- หมายเหตุผู้อนุมัติ/ไม่อนุมัติ
        dc_user_result_id    INT          NULL,
        d_result             DATETIME     NULL
    );
    CREATE INDEX IX_sp_tor_cancel_req_tor ON dbo.sp_tor_cancel_req (tor_id, i_status);
END
