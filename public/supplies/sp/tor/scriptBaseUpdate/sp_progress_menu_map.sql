USE NMU_ERP;
GO

/* Mapping เมนูในกระบวนการ PR -> ประเภทความก้าวหน้า (รันซ้ำได้) */
IF OBJECT_ID('dbo.sp_progress_menu_map', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.sp_progress_menu_map (
        sp_progress_menu_map_id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        menu_code VARCHAR(30) NOT NULL,
        menu_name NVARCHAR(250) NULL,
        event_type INT NOT NULL,
        i_enabled INT NOT NULL CONSTRAINT DF_sp_progress_menu_map_enabled DEFAULT (1),
        dc_user_create_id INT NULL,
        d_create DATETIME NULL,
        dc_user_update_id INT NULL,
        d_update DATETIME NULL,
        CONSTRAINT UQ_sp_progress_menu_map_code UNIQUE (menu_code)
    );
END;
GO
