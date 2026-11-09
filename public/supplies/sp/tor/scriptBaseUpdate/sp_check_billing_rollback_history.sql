IF OBJECT_ID(N'dbo.sp_check_billing_rollback_history', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.sp_check_billing_rollback_history (
        id bigint IDENTITY(1,1) NOT NULL PRIMARY KEY,
        sp_check_period_hdr_id int NOT NULL,
        billing_item_snapshot nvarchar(max) NULL,
        billing_detail_snapshot nvarchar(max) NULL,
        previous_status int NULL,
        actor_user_id int NOT NULL,
        actor_cost_id int NULL,
        created_at datetime NOT NULL DEFAULT GETDATE()
    );
    CREATE INDEX IX_sp_check_billing_rollback_history_check
        ON dbo.sp_check_billing_rollback_history (sp_check_period_hdr_id, created_at);
END;
