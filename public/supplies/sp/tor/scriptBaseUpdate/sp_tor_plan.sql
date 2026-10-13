USE NMU_ERP;
GO

/*
 * ตารางเก็บรหัสแผนหลายรายการต่อ 1 PR (1 PR มีได้หลายแผน) ใช้กับหน้าต่าง "รหัสแผนของ PR นี้"
 * ในเมนู PR (torUi.js) ผ่าน tor/api/mnTorPlan.php (mode LIST / SAVE)
 *
 * ค่าสรุป (คั่นด้วย ",") ยัง sync กลับไปที่ dbo.sp_tor.plan_code / plan_seq เพื่อให้
 * รายงาน/หน้าจอเดิมที่อ่านค่าจากฟิลด์นั้นยังใช้ได้ตามเดิม
 */
IF OBJECT_ID(N'[dbo].[sp_tor_plan]', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[sp_tor_plan]
    (
        [sp_tor_plan_id]     BIGINT IDENTITY(1,1) NOT NULL
            CONSTRAINT [PK_sp_tor_plan] PRIMARY KEY,
        [tor_id]             BIGINT NOT NULL,       -- FK -> sp_tor

        [plan_seq]           VARCHAR(50) NULL,      -- ลำดับที่
        [plan_code]          VARCHAR(100) NULL,     -- รหัสแผน

        [i_enabled]          TINYINT NOT NULL
            CONSTRAINT [DF_sp_tor_plan_i_enabled] DEFAULT (1),

        [dc_user_create_id]  BIGINT NULL,
        [d_create]           DATETIME NULL
    );

    CREATE INDEX [IX_sp_tor_plan_tor_id] ON [dbo].[sp_tor_plan] ([tor_id]);
END
GO
