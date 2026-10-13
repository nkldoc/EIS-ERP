-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Sep 16, 2026 at 04:26 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `php_auth_api`
--

-- --------------------------------------------------------

--
-- Table structure for table `sp_api_account`
--

CREATE TABLE `sp_api_account` (
  `account_id` int(10) UNSIGNED NOT NULL,
  `username` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `note` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sp_api_account`
--

INSERT INTO `sp_api_account` (`account_id`, `username`, `password_hash`, `is_active`, `note`, `created_at`, `updated_at`) VALUES
(1, 'erpsendapi', '$2y$10$REPLACE_WITH_REAL_HASH', 1, 'Service account รับข้อมูลจากระบบ EIS', '2026-09-16 11:36:15', '2026-09-16 11:36:15');

-- --------------------------------------------------------

--
-- Table structure for table `sp_api_endpoint`
--

CREATE TABLE `sp_api_endpoint` (
  `id` int(11) NOT NULL,
  `c_name` varchar(200) NOT NULL,
  `c_uri` varchar(500) NOT NULL,
  `c_method` varchar(10) NOT NULL DEFAULT 'POST',
  `c_query` text NOT NULL,
  `i_active` tinyint(1) NOT NULL DEFAULT 1,
  `d_last_sent` datetime DEFAULT NULL,
  `c_created_by` varchar(100) DEFAULT NULL,
  `d_created` datetime NOT NULL DEFAULT current_timestamp(),
  `d_updated` datetime DEFAULT NULL ON UPDATE current_timestamp(),
  `c_database` varchar(128) DEFAULT NULL,
  `c_field_map` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sp_api_endpoint`
--

INSERT INTO `sp_api_endpoint` (`id`, `c_name`, `c_uri`, `c_method`, `c_query`, `i_active`, `d_last_sent`, `c_created_by`, `d_created`, `d_updated`, `c_database`, `c_field_map`) VALUES
(1, 'https://erpdev.vajira.ac.th', '/web/session/authenticate', 'POST', 'select sp_tor_contract_id, c_name ,c_code from sp_tor_contract where sp_tor_id =199 and i_enabled = 1', 1, NULL, 'admin', '2026-09-16 10:54:44', '2026-09-16 13:45:28', 'NMU_ERP', '[{\"source\":\"sp_tor_contract_id\",\"target\":\"po_id\"},{\"source\":\"c_name\",\"target\":\"c_name\"},{\"source\":\"c_code\",\"target\":\"c_code\"}]');

-- --------------------------------------------------------

--
-- Table structure for table `sp_api_incoming_endpoint`
--

CREATE TABLE `sp_api_incoming_endpoint` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(200) NOT NULL,
  `uri` varchar(240) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `method` varchar(8) NOT NULL,
  `user_id` int(11) NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sp_api_incoming_endpoint`
--

INSERT INTO `sp_api_incoming_endpoint` (`id`, `name`, `uri`, `method`, `user_id`, `is_active`, `created_at`, `updated_at`) VALUES
(3, 'ขารับจาก ERP เวชภัณฑ์', '/api-eis/procure/incoming/irV1', 'POST', 11, 1, '2026-09-16 15:25:42', '2026-09-16 15:25:42'),
(4, 'ทดสอบหน้าจอชั่วคราว', '/api-eis/procure/incoming/ui_8315be09', 'POST', 24, 1, '2026-09-16 15:26:43', '2026-09-16 15:26:43');

-- --------------------------------------------------------

--
-- Table structure for table `sp_api_incoming_log`
--

CREATE TABLE `sp_api_incoming_log` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `request_id` char(32) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL,
  `endpoint_id` int(10) UNSIGNED DEFAULT NULL,
  `uri` varchar(240) NOT NULL,
  `method` varchar(16) NOT NULL,
  `username` varchar(100) DEFAULT NULL,
  `status_code` smallint(5) UNSIGNED NOT NULL,
  `message` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `received_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sp_api_incoming_log`
--

INSERT INTO `sp_api_incoming_log` (`id`, `request_id`, `endpoint_id`, `uri`, `method`, `username`, `status_code`, `message`, `payload`, `received_at`) VALUES
(63, 'cbe3ccbc040736c6b928ee654a5f2ccd', 4, '/api-eis/procure/incoming/ui_8315be09', 'POST', 'incoming_ui_8315be09', 200, 'รับข้อมูลและบันทึก JSON แล้ว', '{\"headers\":{\"Host\":\"127.0.0.1:18765\",\"User-Agent\":\"Mozilla/5.0 (Windows NT 10.0; Microsoft Windows 10.0.26200; th-TH) PowerShell/7.6.5\",\"Accept-Encoding\":\"gzip, deflate, br\",\"Content-Type\":\"application/json\",\"Content-Length\":\"272\"},\"body\":{\"data\":[{\"period_id\":4082,\"pr_id\":1768,\"po_id\":448,\"line_ids\":[{\"d_doc_dateSub\":\"2026-05-20\",\"c_doc_ref\":false,\"chk_line_id\":2652}],\"c_contract_code\":\"1C103/2568\",\"f_period_amt\":17013,\"c_doc_ref\":false}],\"password\":\"***HIDDEN***\",\"username\":\"incoming_ui_8315be09\"}}', '2026-09-16 08:26:53'),
(64, '3bed1fb1da2c174e757db5b762ee94a4', 3, '/api-eis/procure/incoming/irV1', 'POST', NULL, 415, 'Content-Type ต้องเป็น application/json', '{\"headers\":{\"Content-Type\":\"text/plain\",\"Content-Length\":\"384\",\"X-Original-Url\":\"/api-eis/procure/incoming/irV1\",\"Postman-Token\":\"***HIDDEN***\",\"Password\":\"***HIDDEN***\",\"Username\":\"erpsendapi\",\"User-Agent\":\"PostmanRuntime/7.56.1\",\"Host\":\"dev-eis.nmu.ac.th\",\"Accept-Encoding\":\"gzip, deflate, br\",\"Accept\":\"*/*\",\"Connection\":\"close\"},\"body\":{\"pr_id\":1768,\"po_id\":448,\"period_id\":4082,\"chk_id\":1,\"c_contract_code\":\"1C103/2568\",\"f_period_amt\":17013,\"c_doc_ref\":false,\"line_ids\":[{\"c_doc_ref\":false,\"d_doc_dateSub\":\"2026-05-20\",\"f_period_amt\":17013,\"chk_line_id\":2652}]}}', '2026-09-16 08:30:20'),
(65, 'bef30e311ac54c55e3d1deb8ae5f97cb', 3, '/api-eis/procure/incoming/irV1', 'POST', NULL, 401, 'บัญชีหรือรหัสผ่านไม่ถูกต้อง หรือไม่มีสิทธิ์ใช้ URL นี้', '{\"headers\":{\"Content-Type\":\"application/json\",\"Content-Length\":\"380\",\"X-Original-Url\":\"/api-eis/procure/incoming/irV1\",\"Postman-Token\":\"***HIDDEN***\",\"Password\":\"***HIDDEN***\",\"Username\":\"erpsendapi\",\"User-Agent\":\"PostmanRuntime/7.56.1\",\"Host\":\"dev-eis.nmu.ac.th\",\"Accept-Encoding\":\"gzip, deflate, br\",\"Accept\":\"*/*\",\"Connection\":\"close\"},\"body\":{\"pr_id\":1768,\"po_id\":448,\"period_id\":4082,\"chk_id\":1,\"c_contract_code\":\"1C103/2568\",\"f_period_amt\":17013,\"c_doc_ref\":false,\"line_ids\":[{\"c_doc_ref\":false,\"d_doc_dateSub\":\"2026-05-20\",\"f_period_amt\":17013,\"chk_line_id\":2652}]}}', '2026-09-16 08:34:47'),
(66, 'a55f10e4a885f577883e1268acb809ff', 3, '/api-eis/procure/incoming/irV1', 'POST', 'erpsendapi', 422, 'กรุณาส่ง data เป็น array', '{\"headers\":{\"Content-Type\":\"application/json\",\"Content-Length\":\"444\",\"X-Original-Url\":\"/api-eis/procure/incoming/irV1\",\"Postman-Token\":\"***HIDDEN***\",\"Password\":\"***HIDDEN***\",\"Username\":\"erpsendapi\",\"User-Agent\":\"PostmanRuntime/7.56.1\",\"Host\":\"dev-eis.nmu.ac.th\",\"Accept-Encoding\":\"gzip, deflate, br\",\"Accept\":\"*/*\",\"Connection\":\"close\"},\"body\":{\"pr_id\":1768,\"po_id\":448,\"period_id\":4082,\"chk_id\":1,\"c_contract_code\":\"1C103/2568\",\"f_period_amt\":17013,\"c_doc_ref\":false,\"username\":\"erpsendapi\",\"password\":\"***HIDDEN***\",\"line_ids\":[{\"c_doc_ref\":false,\"d_doc_dateSub\":\"2026-05-20\",\"f_period_amt\":17013,\"chk_line_id\":2652}]}}', '2026-09-16 09:02:55'),
(67, '85761c5242fa7d4b189370be87beca12', 3, '/api-eis/procure/incoming/irV1', 'POST', NULL, 401, 'บัญชีหรือรหัสผ่านไม่ถูกต้อง หรือไม่มีสิทธิ์ใช้ URL นี้', '{\"headers\":{\"Content-Type\":\"application/json\",\"Content-Length\":\"381\",\"X-Original-Url\":\"/api-eis/procure/incoming/irV1\",\"Postman-Token\":\"***HIDDEN***\",\"Password\":\"***HIDDEN***\",\"Username\":\"erpsendapi\",\"User-Agent\":\"PostmanRuntime/7.56.1\",\"Host\":\"dev-eis.nmu.ac.th\",\"Accept-Encoding\":\"gzip, deflate, br\",\"Accept\":\"*/*\",\"Connection\":\"close\"},\"body\":{\"pr_id\":1768,\"po_id\":448,\"period_id\":4082,\"chk_id\":1,\"c_contract_code\":\"1C103/2568\",\"f_period_amt\":17013,\"c_doc_ref\":false,\"line_ids\":[{\"c_doc_ref\":false,\"d_doc_dateSub\":\"2026-05-20\",\"f_period_amt\":17013,\"chk_line_id\":2652}]}}', '2026-09-16 09:03:40'),
(68, '630dab4dbc27dc72ee705f59b15813fa', 3, '/api-eis/procure/incoming/irV1', 'POST', 'erpsendapi', 200, 'รับข้อมูลและบันทึก JSON แล้ว', '{\"headers\":{\"Content-Type\":\"application/json\",\"Content-Length\":\"470\",\"X-Original-Url\":\"/api-eis/procure/incoming/irV1\",\"Postman-Token\":\"***HIDDEN***\",\"Password\":\"***HIDDEN***\",\"Username\":\"erpsendapi\",\"User-Agent\":\"PostmanRuntime/7.56.1\",\"Host\":\"dev-eis.nmu.ac.th\",\"Accept-Encoding\":\"gzip, deflate, br\",\"Accept\":\"*/*\",\"Connection\":\"close\"},\"body\":{\"username\":\"erpsendapi\",\"password\":\"***HIDDEN***\",\"data\":[{\"pr_id\":1768,\"po_id\":448,\"period_id\":4082,\"chk_id\":1,\"c_contract_code\":\"1C103/2568\",\"f_period_amt\":17013,\"c_doc_ref\":false,\"line_ids\":[{\"c_doc_ref\":false,\"d_doc_dateSub\":\"2026-05-20\",\"f_period_amt\":17013,\"chk_line_id\":2652}]}]}}', '2026-09-16 09:05:30');

-- --------------------------------------------------------

--
-- Table structure for table `sp_api_permission`
--

CREATE TABLE `sp_api_permission` (
  `permission_id` int(10) UNSIGNED NOT NULL,
  `account_id` int(10) UNSIGNED NOT NULL,
  `route_key` varchar(100) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sp_api_permission`
--

INSERT INTO `sp_api_permission` (`permission_id`, `account_id`, `route_key`, `created_at`) VALUES
(1, 1, 'procure.ir', '2026-09-16 11:36:15'),
(2, 1, 'procure.contract', '2026-09-16 11:36:15');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL,
  `email` varchar(50) NOT NULL,
  `password` varchar(150) NOT NULL,
  `role` varchar(20) NOT NULL DEFAULT 'user',
  `is_active` tinyint(4) NOT NULL DEFAULT 1,
  `token_version` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `token_lifetime` int(10) UNSIGNED DEFAULT NULL,
  `last_token_expires_at` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `is_active`, `token_version`, `token_lifetime`, `last_token_expires_at`) VALUES
(9, 'eakibanez', 'eakibanez@mail.com', '$2y$10$HVdD.ALZZxZ5JdgMJC/d2.HafdHycp8NPabnnWS2cydm0AHWhA3zC', 'user', 1, 0, NULL, NULL),
(10, 'eakibanez3', 'eakibanez3@mail.com', '$2y$10$yv4BjRb0LkDnP7cJAsvigeAeOePjawJzrRk2PF60ELiUclWVeGXSu', 'user', 0, 1, NULL, NULL),
(11, 'erpsendapi', 'erpsendapi@mail.com', '$2y$10$h4qaGgsU2i27NO0MIV97Gui/s0VSAUTF0bO4v.BvClPIPhsYcbTQm', 'user', 1, 2, 3600, 1789544376),
(12, 'eis-server', 'eis-server@nmu.ac.th', '$2y$10$l73TU6.cyRBzTjCKrIkGs.ZHQ50GkWUC.zyzL6S6moeQGXnVKasCa', 'user', 1, 0, NULL, NULL),
(13, 'mProV1', 'mProV1@nmu.ac.th', '$2y$10$lIU1rgt3kiLyxGt1K2fJae7ynLfeGz1F4adELNKi51QjHkoHSaqlC', 'user', 1, 0, NULL, NULL),
(18, 'admin', '', '$2y$10$mHrrYcRbWeHj2WQ9rljhZ.oiMx5Lmn9VDcaAE85wtL2n58Bq2hN5.', 'superadmin', 1, 0, NULL, 1789627126),
(24, 'incoming_ui_8315be09', 'incoming_ui_8315be09@example.invalid', '$2y$10$Y17nvo9d/5FcPF.YIk/u1eK5vq8ohGN4W5cUlDWQJRF3WUsMOQU5m', 'superadmin', 1, 0, NULL, 1789633584);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `sp_api_account`
--
ALTER TABLE `sp_api_account`
  ADD PRIMARY KEY (`account_id`),
  ADD UNIQUE KEY `uq_sp_api_account_username` (`username`);

--
-- Indexes for table `sp_api_endpoint`
--
ALTER TABLE `sp_api_endpoint`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `sp_api_incoming_endpoint`
--
ALTER TABLE `sp_api_incoming_endpoint`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_incoming_route` (`uri`,`method`),
  ADD KEY `ix_incoming_user` (`user_id`);

--
-- Indexes for table `sp_api_incoming_log`
--
ALTER TABLE `sp_api_incoming_log`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_incoming_request` (`request_id`),
  ADD KEY `ix_incoming_log_endpoint` (`endpoint_id`,`id`);

--
-- Indexes for table `sp_api_permission`
--
ALTER TABLE `sp_api_permission`
  ADD PRIMARY KEY (`permission_id`),
  ADD UNIQUE KEY `uq_sp_api_permission` (`account_id`,`route_key`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `sp_api_account`
--
ALTER TABLE `sp_api_account`
  MODIFY `account_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `sp_api_endpoint`
--
ALTER TABLE `sp_api_endpoint`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `sp_api_incoming_endpoint`
--
ALTER TABLE `sp_api_incoming_endpoint`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `sp_api_incoming_log`
--
ALTER TABLE `sp_api_incoming_log`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=69;

--
-- AUTO_INCREMENT for table `sp_api_permission`
--
ALTER TABLE `sp_api_permission`
  MODIFY `permission_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `sp_api_incoming_log`
--
ALTER TABLE `sp_api_incoming_log`
  ADD CONSTRAINT `fk_incoming_log_endpoint` FOREIGN KEY (`endpoint_id`) REFERENCES `sp_api_incoming_endpoint` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `sp_api_permission`
--
ALTER TABLE `sp_api_permission`
  ADD CONSTRAINT `fk_sp_api_permission_account` FOREIGN KEY (`account_id`) REFERENCES `sp_api_account` (`account_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
