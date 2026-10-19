IF OBJECT_ID('dbo.sp_contract_alert_schedule','U') IS NULL
    CREATE TABLE dbo.sp_contract_alert_schedule (
        schedule_id tinyint NOT NULL PRIMARY KEY,times_json nvarchar(500) NOT NULL,
        updated_by int NOT NULL,updated_at datetime2 NOT NULL DEFAULT SYSDATETIME());
IF COL_LENGTH('dbo.sp_contract_alert_schedule','frequency_json') IS NULL
    ALTER TABLE dbo.sp_contract_alert_schedule ADD frequency_json nvarchar(500) NULL;
IF OBJECT_ID('dbo.sp_contract_alert_delivery','U') IS NULL
    CREATE TABLE dbo.sp_contract_alert_delivery (
        user_id int NOT NULL,item_id varchar(80) NOT NULL,delivery_date date NOT NULL,
        slot varchar(5) NOT NULL,created_at datetime2 NOT NULL DEFAULT SYSDATETIME(),
        CONSTRAINT PK_contract_alert_delivery PRIMARY KEY(user_id,item_id,delivery_date,slot));
