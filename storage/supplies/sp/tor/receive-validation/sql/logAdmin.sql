CREATE TABLE dbo.admin_system_log
(
    admin_system_log_id BIGINT IDENTITY(1,1) NOT NULL,
    module_code         VARCHAR(100) NULL,
    reference_id       VARCHAR(100) NULL,
    reference_code     VARCHAR(100) NULL,

    subject             NVARCHAR(500) NULL,
    detail_html         NVARCHAR(MAX) NULL,
    detail_text         NVARCHAR(MAX) NULL,

    current_url         NVARCHAR(2000) NULL,
    browser_info        NVARCHAR(2000) NULL,
    client_datetime     VARCHAR(50) NULL,

    log_status          VARCHAR(30) NOT NULL
        CONSTRAINT DF_admin_system_log_status DEFAULT ('NEW'),

    priority_code       VARCHAR(20) NOT NULL
        CONSTRAINT DF_admin_system_log_priority DEFAULT ('NORMAL'),

    assigned_admin_id   VARCHAR(50) NULL,
    admin_comment       NVARCHAR(MAX) NULL,

    created_by          VARCHAR(50) NULL,
    created_name        NVARCHAR(255) NULL,
    created_ip          VARCHAR(50) NULL,
    created_date        DATETIME NOT NULL
        CONSTRAINT DF_admin_system_log_created_date DEFAULT (GETDATE()),

    updated_by          VARCHAR(50) NULL,
    updated_date        DATETIME NULL,

    CONSTRAINT PK_admin_system_log
        PRIMARY KEY (admin_system_log_id)
);
GO

CREATE INDEX IX_admin_system_log_status_date
ON dbo.admin_system_log
(
    log_status,
    created_date DESC
);
GO

CREATE INDEX IX_admin_system_log_reference
ON dbo.admin_system_log
(
    module_code,
    reference_code
);
GO