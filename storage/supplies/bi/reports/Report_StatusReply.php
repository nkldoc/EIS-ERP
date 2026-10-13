<?php
include("../../conf/config.php");
?>
<!DOCTYPE html>
<html lang="th">

<head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="shortcut icon" href="../../images/favicon.ico" type="image/x-icon">
        <link rel="icon" href="../../images/favicon.ico" type="image/x-icon">
        <title>Reply Report Dashboard - ฝ่ายพัสดุ</title>

        <?php include("../../lib/loadJs.php"); ?>
        <?php include("../../lib/loadCss.php"); ?>

        <script src="../../ws_user/js/jquery.min.js"></script>
        <script src="../../js/echarts/echarts.js"></script>
        <script src="../bootstrap/bootstrap-4.6.2-dist/js/bootstrap.bundle.min.js"></script>
        <script src="../bootstrap/bootstrap-select-1.13.14/dist/js/bootstrap-select.min.js"></script>
        <script type="text/javascript" src="../../lib/right/GrantPermission.php?_dc=<?= __VPRODUCT_; ?>&f=<?php echo $_SERVER["PHP_SELF"]; ?>"></script>

        <link rel="stylesheet" type="text/css" href="../../css/report_css.css" />
        <link rel="stylesheet" type="text/css" href="../css/report-style.css">
        <link rel="stylesheet" type="text/css" href="../bootstrap/bootstrap-4.6.2-dist/css/bootstrap.min.css">
        <link rel="stylesheet" type="text/css" href="../bootstrap/bootstrap-select-1.13.14/dist/css/bootstrap-select.min.css">

        <style>
                body {
                        background-color: #f8f9fa;
                        font-family: 'Sarabun', sans-serif;
                }

                .card-custom {
                        border: none;
                        border-radius: 8px;
                        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
                        margin-bottom: 20px;
                        background: #fff;
                        transition: 0.3s;
                        border-top: 4px solid #46a8de;
                        /* สีฟ้า */
                }

                .info-box {
                        background: #fff;
                        border: 1px solid #e9ecef;
                        border-radius: 6px;
                        padding: 10px 15px;
                        height: 100%;
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                }

                .info-label {
                        font-size: 0.85rem;
                        color: #6c757d;
                        margin-bottom: 5px;
                        font-weight: 600;
                }

                /* Table Styles */
                .table-kpi {
                        width: 100%;
                        border-collapse: collapse;
                        font-size: 0.9rem;
                }

                .table-kpi thead th {
                        background-color: #46a8de;
                        color: #fff;
                        text-align: center;
                        border: 1px solid #3596cc;
                        padding: 10px 5px;
                }

                .table-kpi tbody td {
                        text-align: center;
                        border: 1px solid #dee2e6;
                        padding: 8px 5px;
                }

                .table-kpi tbody td:first-child {
                        text-align: left;
                        padding-left: 15px;
                        font-weight: 500;
                        min-width: 250px;
                }

                .col-total {
                        background-color: #e2e6ea !important;
                        font-weight: bold;
                }

                /* Chart Styles */
                .chart-header {
                        font-weight: bold;
                        border-bottom: 2px solid #46a8de;
                        padding-bottom: 10px;
                        margin-bottom: 15px;
                        font-size: 1.1rem;
                }

                .chart-container-wide {
                        height: 500px;
                        /* สูงพอสำหรับ Line Chart */
                        width: 100%;
                        background: #ffffff;
                        padding: 10px;
                }

                .report-logo {
                        filter: drop-shadow(2px 4px 6px rgba(0, 0, 0, 0.1));
                }

                /* สียอดทักท้วง */
                .text-reply {
                        color: #dc3545;
                        font-weight: bold;
                }

                .text-sent {
                        color: #28a745;
                        font-weight: bold;
                }

                /* ===== Grand Total Dark Bar ===== */
                .grandtotal-bar {
                        background: #1a1f36;
                        border-radius: 10px;
                        padding: 16px 20px;
                        display: flex;
                        flex-wrap: wrap;
                        align-items: center;
                        gap: 14px;
                        margin-bottom: 20px;
                }

                .grandtotal-label {
                        color: #fff;
                        font-weight: 700;
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        min-width: 210px;
                        font-size: 0.95rem;
                }

                .grandtotal-item {
                        flex: 1 1 200px;
                        border-radius: 8px;
                        padding: 12px 18px;
                        background: rgba(255, 255, 255, 0.06);
                }

                .grandtotal-item.gt-reply {
                        background: rgba(220, 53, 69, 0.18);
                }

                .grandtotal-item.gt-pct {
                        background: rgba(40, 167, 69, 0.18);
                }

                .grandtotal-item .gt-title {
                        color: #cfd3e0;
                        font-size: 0.8rem;
                        margin-bottom: 4px;
                }

                .grandtotal-item .gt-value {
                        color: #fff;
                        font-size: 1.6rem;
                        font-weight: 700;
                }

                .grandtotal-item.gt-reply .gt-value {
                        color: #ff8b98;
                }

                .grandtotal-item.gt-pct .gt-value {
                        color: #6be3a4;
                }

                /* ===== Main Month/Fiscal-Year Selector ===== */
                .main-month-filter-card {
                        border-color: #cfe0fb;
                        background: #f5f9ff;
                }

                .main-month-filter-card .filter-card-title {
                        color: #2f6fed;
                }

                /* ===== Filter Card ===== */
                .filter-card {
                        border: 1px solid #e9ecef;
                        border-radius: 10px;
                        padding: 18px 20px;
                        background: #fff;
                        margin-bottom: 20px;
                }

                .filter-card-title {
                        font-weight: 700;
                        font-size: 1.02rem;
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        color: #2c2f48;
                }

                .filter-subtitle {
                        font-weight: 600;
                        font-size: 0.9rem;
                        color: #495057;
                }

                .btn-soft {
                        border: 1px solid #cfd4e6;
                        background: #f3f5fb;
                        color: #4a4fd6;
                        border-radius: 6px;
                        padding: 3px 12px;
                        font-size: 0.78rem;
                        font-weight: 600;
                }

                .btn-soft:hover {
                        background: #e6e9fb;
                        color: #3436b0;
                }

                #staffGroupFilterContainer {
                        max-height: 320px;
                        overflow-y: auto;
                        padding-right: 6px;
                }

                #staffGroupFilterContainer::-webkit-scrollbar {
                        width: 8px;
                }

                #staffGroupFilterContainer::-webkit-scrollbar-thumb {
                        background: #d8dbe3;
                        border-radius: 8px;
                }

                .staff-group-box {
                        border: 1px solid #eceff5;
                        border-radius: 8px;
                        padding: 10px 14px;
                        margin-bottom: 10px;
                        background: #fbfbfe;
                }

                .staff-group-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        font-weight: 700;
                        color: #495057;
                        font-size: 0.88rem;
                        margin-bottom: 8px;
                }

                .staff-group-items {
                        display: grid;
                        grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
                        gap: 6px 14px;
                        max-height: 190px;
                        overflow-y: auto;
                        padding-right: 4px;
                }

                .staff-check-item {
                        font-size: 0.88rem;
                        color: #333;
                }

                .month-select-box {
                        border: 1px solid #e9ecef;
                        border-radius: 8px;
                        padding: 14px;
                        height: 100%;
                }

                /* ===== KPI Cards ===== */
                .kpi-card {
                        border-radius: 10px;
                        padding: 16px 18px;
                        background: #fff;
                        border: 1px solid #eef0f5;
                        border-left: 4px solid #6c63ff;
                        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.03);
                        height: 100%;
                }

                .kpi-card.kpi-reply {
                        border-left-color: #ff9f43;
                }

                .kpi-card.kpi-normal {
                        border-left-color: #17c3b2;
                }

                .kpi-card.kpi-ratio {
                        border-left-color: #ff4d6d;
                }

                .kpi-card.kpi-pending {
                        border-left-color: #8b5cf6;
                }

                .kpi-card.kpi-clickable {
                        cursor: pointer;
                        transition: 0.15s;
                }

                .kpi-card.kpi-clickable:hover {
                        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
                        transform: translateY(-1px);
                }

                .kpi-label {
                        font-size: 0.8rem;
                        color: #6c757d;
                        margin-bottom: 6px;
                }

                .kpi-value {
                        font-size: 1.9rem;
                        font-weight: 700;
                        color: #262b40;
                }

                .kpi-sub {
                        font-size: 0.72rem;
                        color: #9aa0ac;
                        margin-top: 4px;
                }

                #gtCustomRangeToggleBtn.active {
                        background: #6c63ff;
                        color: #fff;
                        border-color: #6c63ff;
                }

                /* ===== Waffle Chart ===== */
                :root {
                        --waf-normal: #4C7FEA;
                        --waf-reply: #E14C58;
                }

                 .chart-header-row {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        flex-wrap: wrap;
                        gap: 10px;
                        margin-bottom: 15px;
                        border-bottom: 2px solid #46a8de;
                        padding-bottom: 10px;
                }

                .chart-header-row .chart-header {
                        border-bottom: none;
                        padding-bottom: 0;
                }

                .waffle-legend {
                        display: flex;
                        gap: 18px;
                        font-size: 0.85rem;
                        color: #555;
                }

                .waffle-legend-item {
                        display: flex;
                        align-items: center;
                        gap: 6px;
                        font-weight: 600;
                }

                .waffle-legend-dot {
                        width: 10px;
                        height: 10px;
                        border-radius: 50%;
                        flex-shrink: 0;
                }

                .waffle-legend-dot.normal { background: var(--waf-normal); }
                .waffle-legend-dot.reply { background: var(--waf-reply); }

                .waffle-row {
                        display: flex;
                        align-items: flex-end;
                        justify-content: space-between;
                        gap: 10px;
                        padding: 12px 4px 4px;
                        overflow-x: auto;
                }

                .waffle-col {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        flex: 1 1 0;
                        min-width: 74px;
                }

                .waffle-count-label {
                        font-size: 0.72rem;
                        color: #6b7280;
                        font-weight: 600;
                        margin-bottom: 6px;
                        white-space: nowrap;
                }

                .waffle-stack {
                        display: flex;
                        align-items: flex-end;
                        justify-content: center;
                        width: 100%;
                }

                .waffle-grid {
                        display: grid;
                        align-content: end;
                }

                .waffle-dot {
                        border-radius: 50%;
                }

                .waffle-dot.normal { background: var(--waf-normal); }
                .waffle-dot.reply { background: var(--waf-reply); }

                .waffle-month-label {
                        margin-top: 8px;
                        font-size: 0.78rem;
                        color: #333;
                        font-weight: 600;
                        white-space: nowrap;
                }

                /* ===== Group Breakdown (Overall) ===== */
                :root {
                        --gb-g1n: #3B82F6;
                        --gb-g1r: #EF4444;
                        --gb-g2n: #10B981;
                        --gb-g2r: #F97316;
                        --gb-on:  #8B5CF6;
                        --gb-or:  #EC4899;
                }

                .gb-card {
                        display: flex;
                        align-items: stretch;
                        justify-content: space-between;
                        gap: 10px;
                        background: #F8FAFC;
                        border-radius: 10px;
                        padding: 22px 10px 18px;
                }

                .gb-col {
                        flex: 1 1 0;
                        text-align: center;
                        padding: 0 18px;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                }

                .gb-col:not(:last-child) {
                        border-right: 1px solid #e2e8f0;
                }

                .gb-waffle-stack {
                        display: flex;
                        align-items: flex-end;
                        justify-content: center;
                        min-height: 165px;
                        width: 100%;
                }

                .gb-grid {
                        display: grid;
                        align-content: end;
                        justify-content: center;
                }

                .gb-dot {
                        border-radius: 50%;
                }

                .gb-dot.g1n { background: var(--gb-g1n); }
                .gb-dot.g1r { background: var(--gb-g1r); }
                .gb-dot.g2n { background: var(--gb-g2n); }
                .gb-dot.g2r { background: var(--gb-g2r); }
                .gb-dot.on  { background: var(--gb-on); }
                .gb-dot.or  { background: var(--gb-or); }

                .gb-title {
                        margin-top: 10px;
                        font-weight: 700;
                        color: #1e293b;
                        font-size: 0.95rem;
                }

                .gb-divider {
                        width: 100%;
                        height: 1px;
                        background: #e2e8f0;
                        margin-top: 12px;
                }

                .gb-sub {
                        font-size: 0.8rem;
                        color: #64748b;
                        margin-top: 2px;
                }

                .gb-legend-row {
                        display: flex;
                        flex-wrap: wrap;
                        align-items: center;
                        gap: 10px 24px;
                        background: #fff;
                        border: 1px solid #eef1f5;
                        border-radius: 8px;
                        padding: 14px 18px;
                        margin-top: 16px;
                        font-size: 0.85rem;
                }

                .gb-legend-title {
                        font-weight: 700;
                        color: #334155;
                        display: flex;
                        align-items: center;
                        gap: 6px;
                        margin-right: 6px;
                }

                .gb-legend-item {
                        display: flex;
                        align-items: center;
                        gap: 6px;
                        color: #475569;
                        white-space: nowrap;
                }

                .gb-legend-dot {
                        width: 10px;
                        height: 10px;
                        border-radius: 2px;
                        flex-shrink: 0;
                }

                .gb-legend-dot.g1n { background: var(--gb-g1n); }
                .gb-legend-dot.g1r { background: var(--gb-g1r); }
                .gb-legend-dot.g2n { background: var(--gb-g2n); }
                .gb-legend-dot.g2r { background: var(--gb-g2r); }
                .gb-legend-dot.on  { background: var(--gb-on); }
                .gb-legend-dot.or  { background: var(--gb-or); }

                .gb-legend-value {
                        font-weight: 700;
                }

                .gb-legend-value.g1n-text { color: var(--gb-g1n); }
                .gb-legend-value.g1r-text { color: var(--gb-g1r); }
                .gb-legend-value.g2n-text { color: var(--gb-g2n); }
                .gb-legend-value.g2r-text { color: var(--gb-g2r); }
                .gb-legend-value.on-text  { color: var(--gb-on); }
                .gb-legend-value.or-text  { color: var(--gb-or); }

                .gb-chart-title {
                        text-align: center;
                        font-weight: 600;
                        color: #475569;
                        font-size: 0.92rem;
                        margin: 22px 0 4px;
                }

                #groupTrendChart {
                        width: 100%;
                        height: 260px;
                }

                .gb-bar-card {
                        background: #F8FAFC;
                        border-radius: 10px;
                        margin-top: 22px;
                        padding: 4px 6px 2px;
                }

                #groupPercentBarChart {
                        width: 100%;
                        height: 190px;
                }

                /* ===== Weekly Waffle & Trend (within selected month, อาทิตย์ - เสาร์) ===== */
                .week-block {
                        background: #F8FAFC;
                        border-radius: 10px;
                        padding: 16px 14px 12px;
                        margin-bottom: 18px;
                }

                .week-block:last-child {
                        margin-bottom: 0;
                }

                .week-block .chart-header-row,
                .week-block .chart-header {
                        border-bottom: none;
                        padding-bottom: 0;
                }

                .week-waffle-empty {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        text-align: center;
                        color: #adb5bd;
                        font-style: italic;
                        font-size: 0.75rem;
                        line-height: 1.3;
                        width: 100%;
                }

                /* ===== Quarterly Donuts ===== */
                .quarter-card {
                        text-align: center;
                        padding: 10px 6px;
                }

                .quarter-title {
                        font-weight: 700;
                        color: #333;
                        margin-bottom: 4px;
                        font-size: 0.95rem;
                }

                .quarter-donut {
                        width: 100%;
                        height: 180px;
                }

                .quarter-total {
                        font-weight: 700;
                        margin-top: 4px;
                }

                .quarter-sub {
                        font-size: 0.85rem;
                }

                /* ===== Group Assign Modal ===== */
                :root {
                        --grp-primary: #4F46E5;
                        --grp-primary-dark: #3730A3;
                        --grp-g1: #2F6FED;
                        --grp-g1-bg: #EAF1FF;
                        --grp-g2: #12A868;
                        --grp-g2-bg: #E6F9F0;
                        --grp-other: #6B7280;
                        --grp-other-bg: #F1F2F5;
                }

                .group-badge {
                        display: inline-flex;
                        align-items: center;
                        gap: 5px;
                        padding: 4px 12px;
                        border-radius: 20px;
                        font-size: 0.76rem;
                        font-weight: 600;
                        line-height: 1.5;
                }

                .group-badge::before {
                        content: "";
                        width: 6px;
                        height: 6px;
                        border-radius: 50%;
                        background: currentColor;
                        flex-shrink: 0;
                }

                .group-badge.g1 {
                        background: var(--grp-g1-bg);
                        color: var(--grp-g1);
                }

                .group-badge.g2 {
                        background: var(--grp-g2-bg);
                        color: var(--grp-g2);
                }

                .group-badge.other {
                        background: var(--grp-other-bg);
                        color: var(--grp-other);
                }

                #groupModal .modal-header-dark {
                        background: linear-gradient(135deg, var(--grp-primary) 0%, var(--grp-primary-dark) 100%) !important;
                        color: #fff;
                        border-radius: 16px 16px 0 0;
                        padding: 20px 26px;
                }

                .modal-header-dark .modal-title-wrap {
                        display: flex;
                        align-items: center;
                        gap: 14px;
                }

                .modal-header-dark .modal-title {
                        font-size: 1.05rem;
                        margin: 0;
                        line-height: 1.3;
                }

                .modal-header-dark .modal-subtitle {
                        font-size: 0.8rem;
                        color: rgba(255, 255, 255, 0.75);
                        margin-top: 2px;
                        font-weight: 400;
                }

                .modal-header-dark .modal-title-icon {
                        display: inline-flex;
                        align-items: center;
                        justify-content: center;
                        width: 42px;
                        height: 42px;
                        border-radius: 12px;
                        background: rgba(255, 255, 255, 0.18);
                        font-size: 1.2rem;
                        flex-shrink: 0;
                }

                .modal-header-dark .close {
                        text-shadow: none;
                        color: #fff;
                        opacity: 0.8;
                        transition: opacity 0.15s;
                        padding: 0;
                        margin: 0;
                }

                .modal-header-dark .close:hover {
                        opacity: 1;
                }

                #groupModal .modal-content {
                        border-radius: 16px;
                        overflow: hidden;
                        border: none;
                }

                #groupModal .modal-body {
                        padding: 20px 26px 8px;
                        background: #fafbfd;
                }

                #groupModal .modal-hint {
                        background: #EEF1FE;
                        border: 1px solid #E0E4FA;
                        border-radius: 10px;
                        padding: 10px 14px;
                        font-size: 0.82rem;
                        color: #4B5563;
                        display: flex;
                        align-items: flex-start;
                        gap: 10px;
                        margin-bottom: 16px;
                }

                #groupModal .modal-hint i {
                        color: var(--grp-primary);
                        margin-top: 2px;
                }

                /* Summary chips */
                #groupModal .group-summary {
                        display: flex;
                        gap: 10px;
                        margin-bottom: 16px;
                        flex-wrap: wrap;
                }

                #groupModal .group-summary-chip {
                        flex: 1;
                        min-width: 120px;
                        background: #fff;
                        border: 1px solid #edf0f5;
                        border-radius: 10px;
                        padding: 10px 14px;
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                }

                #groupModal .group-summary-chip .label {
                        font-size: 0.78rem;
                        color: #6b7280;
                        font-weight: 600;
                }

                #groupModal .group-summary-chip .count {
                        font-size: 1.1rem;
                        font-weight: 700;
                }

                #groupModal .group-summary-chip.g1 { border-top: 3px solid var(--grp-g1); }
                #groupModal .group-summary-chip.g1 .count { color: var(--grp-g1); }
                #groupModal .group-summary-chip.g2 { border-top: 3px solid var(--grp-g2); }
                #groupModal .group-summary-chip.g2 .count { color: var(--grp-g2); }
                #groupModal .group-summary-chip.other { border-top: 3px solid var(--grp-other); }
                #groupModal .group-summary-chip.other .count { color: var(--grp-other); }

                /* Search box */
                #groupModal .group-search-wrap {
                        position: relative;
                        margin-bottom: 14px;
                }

                #groupModal .group-search-wrap i {
                        position: absolute;
                        left: 14px;
                        top: 50%;
                        transform: translateY(-50%);
                        color: #9aa1ac;
                        font-size: 0.85rem;
                }

                #groupModal #staffGroupSearch {
                        border-radius: 10px;
                        border: 1px solid #e2e5ec;
                        padding: 9px 14px 9px 36px;
                        font-size: 0.88rem;
                        background: #fff;
                }

                #groupModal #staffGroupSearch:focus {
                        border-color: var(--grp-primary);
                        box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.12);
                        outline: none;
                }

                /* List container */
                #groupModal .staff-group-list {
                        max-height: 48vh;
                        overflow-y: auto;
                        border: 1px solid #edf0f5;
                        border-radius: 12px;
                        background: #fff;
                }

                #groupModal .staff-group-list::-webkit-scrollbar {
                        width: 8px;
                }

                #groupModal .staff-group-list::-webkit-scrollbar-thumb {
                        background: #d8dbe3;
                        border-radius: 8px;
                }

                .staff-group-row {
                        display: flex;
                        align-items: center;
                        gap: 14px;
                        padding: 12px 16px;
                        border-bottom: 1px solid #f1f2f6;
                        transition: background-color 0.15s;
                }

                .staff-group-row:last-child {
                        border-bottom: none;
                }

                .staff-group-row:hover {
                        background-color: #fafbff;
                }

                .staff-avatar {
                        width: 38px;
                        height: 38px;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 0.82rem;
                        font-weight: 700;
                        flex-shrink: 0;
                }

                .staff-avatar.g1 { background: var(--grp-g1-bg); color: var(--grp-g1); }
                .staff-avatar.g2 { background: var(--grp-g2-bg); color: var(--grp-g2); }
                .staff-avatar.other { background: var(--grp-other-bg); color: var(--grp-other); }

                .staff-group-name {
                        flex: 1 1 auto;
                        min-width: 0;
                        font-size: 0.9rem;
                        font-weight: 600;
                        color: #2b2e34;
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                }

                /* Segmented control replacing the native <select> */
                .segmented-group {
                        display: inline-flex;
                        background: #f1f2f6;
                        border-radius: 10px;
                        padding: 3px;
                        flex-shrink: 0;
                        gap: 2px;
                }

                .segmented-group .seg-btn {
                        border: none;
                        background: transparent;
                        color: #6b7280;
                        font-size: 0.78rem;
                        font-weight: 600;
                        padding: 6px 12px;
                        border-radius: 8px;
                        cursor: pointer;
                        transition: background-color 0.15s, color 0.15s, box-shadow 0.15s;
                        white-space: nowrap;
                }

                .segmented-group .seg-btn:hover {
                        color: #374151;
                }

                .segmented-group .seg-btn.active[data-grp="g1"] {
                        background: #fff;
                        color: var(--grp-g1);
                        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
                }

                .segmented-group .seg-btn.active[data-grp="g2"] {
                        background: #fff;
                        color: var(--grp-g2);
                        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
                }

                .segmented-group .seg-btn.active[data-grp="other"] {
                        background: #fff;
                        color: var(--grp-other);
                        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
                }

                #groupModal .staff-group-empty {
                        text-align: center;
                        color: #9aa1ac;
                        font-size: 0.85rem;
                        padding: 32px 0;
                }

                #groupModal .modal-footer {
                        background: #fff !important;
                        border-top: 1px solid #edf0f5 !important;
                        padding: 14px 26px;
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                }

                #groupModal .modal-footer .footer-note {
                        font-size: 0.78rem;
                        color: #9aa1ac;
                        display: flex;
                        align-items: center;
                        gap: 6px;
                }

                #btnCloseGroupModal {
                        border-radius: 20px;
                        padding: 7px 24px;
                        font-weight: 500;
                        background: var(--grp-primary);
                        border-color: var(--grp-primary);
                }

                #btnCloseGroupModal:hover {
                        background: var(--grp-primary-dark);
                        border-color: var(--grp-primary-dark);
                }
        </style>

        <style>
                /* ===== MoM Trends Table ===== */
                .mom-icon-badge {
                        display: inline-flex;
                        align-items: center;
                        justify-content: center;
                        width: 34px;
                        height: 34px;
                        border-radius: 9px;
                        background: #eef0ff;
                        color: #4F46E5;
                        font-size: 1rem;
                        margin-right: 10px;
                        flex-shrink: 0;
                }

                .mom-export-btn {
                        display: inline-flex;
                        align-items: center;
                        border-radius: 20px;
                        font-weight: 600;
                        font-size: 0.82rem;
                        padding: 8px 20px;
                        border: 1px solid #dde1fb;
                        background: #eef0ff;
                        color: #4F46E5;
                        transition: 0.2s;
                }

                .mom-export-btn:hover {
                        background: #4F46E5;
                        border-color: #4F46E5;
                        color: #fff;
                }

                .table-mom-wrap {
                        border-radius: 12px;
                        overflow: hidden;
                        background: #f7f8fc;
                        border: 1px solid #e9ecf5;
                }

                .table-mom {
                        width: 100%;
                        border-collapse: collapse;
                        font-size: 0.9rem;
                        margin-bottom: 0;
                }

                .table-mom thead th {
                        background: #eef1f8;
                        color: #2c2f48;
                        font-weight: 700;
                        text-align: center;
                        padding: 14px 10px;
                        white-space: nowrap;
                        border: none;
                        box-shadow: inset 0 -2px 0 #e0e4f2;
                }

                .table-mom thead th:first-child {
                        text-align: left;
                        padding-left: 20px;
                }

                .table-mom tbody tr {
                        transition: background-color 0.15s;
                        border: none;
                }

                .table-mom tbody tr:nth-child(even) {
                        background-color: #fbf9f2;
                }

                .table-mom tbody tr:nth-child(odd) {
                        background-color: #ffffff;
                }

                .table-mom tbody tr:hover {
                        background-color: #eef4ff;
                }

                .table-mom tbody td {
                        text-align: center;
                        padding: 13px 10px;
                        vertical-align: middle;
                        color: #333;
                        border: none;
                }

                .table-mom tbody td:first-child {
                        text-align: left;
                        font-weight: 700;
                        color: #2c2f48;
                        padding-left: 20px;
                }

                .mom-cell-clickable {
                        cursor: pointer;
                        border-radius: 6px;
                        transition: 0.15s;
                }

                .mom-cell-clickable:hover {
                        background-color: rgba(59, 125, 237, 0.12);
                        text-decoration: underline;
                }

                /* เซลล์ที่ค่าเป็น 0 (ไม่มีข้อมูลในช่วงวันที่ที่กรองอยู่) แสดงเป็นกล่องสีเทา กดดูรายละเอียดไม่ได้
                   เพื่อกันไม่ให้ modal ไปดึงข้อมูลทั้งเดือนที่ไม่ตรงกับช่วงวันที่ที่เลือกกรองอยู่จริง */
                .mom-cell-disabled {
                        cursor: default;
                        border-radius: 6px;
                        background-color: #f0f1f5;
                        color: #b0b3c0 !important;
                        font-weight: 400 !important;
                }

                .table-mom tbody td.mom-cum { color: #2f6fed; font-weight: 700; }
                .table-mom tbody td.mom-monthly { color: #333; font-weight: 400; }
                .table-mom tbody td.mom-reply { color: #e8a33d; font-weight: 700; }
                .table-mom tbody td.mom-normal { color: #17a673; font-weight: 700; }
                .table-mom tbody td.mom-rate { color: #262b40; font-weight: 400; }

                /* ===== Monthly Duration Summary: สีให้แยกกลุ่มคอลัมน์ชัดเจนขึ้น ===== */
                #monthlyDurationTable thead th.duration-group-stage1 {
                        background: #e3edff;
                        color: #1d4ed8;
                        box-shadow: inset 0 -2px 0 #c7d9ff;
                }
                #monthlyDurationTable thead th.duration-group-stage2 {
                        background: #e2f7ee;
                        color: #0f766e;
                        box-shadow: inset 0 -2px 0 #bfead9;
                }
                #monthlyDurationTable thead th.duration-sub-stage1 {
                        background: #eef3ff;
                        color: #33456e;
                }
                #monthlyDurationTable thead th.duration-sub-stage2 {
                        background: #eafaf3;
                        color: #2c5a50;
                }
                #monthlyDurationTable thead th.duration-sub-total {
                        color: #1a1f36;
                        font-weight: 800;
                }
                #monthlyDurationTable thead th.duration-sub-over30 {
                        color: #c0392b;
                }
                #monthlyDurationTable thead th.duration-sub-pending {
                        background: #fff4e5;
                        color: #b45309;
                }

                /* พื้นหลังอ่อนๆ ไล่สีตามกลุ่มคอลัมน์ ให้ตามองแยกฝั่ง "ตรวจรับ→จัดทำใบขอเบิก" กับ "จัดทำใบขอเบิก→รับใบขอเบิก" ง่ายขึ้น */
                #monthlyDurationTable tbody td:nth-child(2),
                #monthlyDurationTable tbody td:nth-child(3),
                #monthlyDurationTable tbody td:nth-child(4) {
                        background-color: rgba(59, 125, 237, 0.045);
                }
                #monthlyDurationTable tbody td:nth-child(7),
                #monthlyDurationTable tbody td:nth-child(8),
                #monthlyDurationTable tbody td:nth-child(9) {
                        background-color: rgba(23, 166, 115, 0.05);
                }

                /* คอลัมน์ "รวม" ของทั้ง 2 ฝั่ง เน้นพื้นเข้มขึ้นให้เด่นเป็นยอดรวม */
                #monthlyDurationTable tbody td:nth-child(6) {
                        background-color: rgba(47, 111, 237, 0.1) !important;
                        font-weight: 700;
                }
                #monthlyDurationTable tbody td:nth-child(11) {
                        background-color: rgba(23, 166, 115, 0.1) !important;
                        font-weight: 700;
                }

                /* "เกิน 30 วัน" ที่มีค่า > 0 เน้นพื้นแดงอ่อนให้สังเกตเห็นทันที ไม่ใช่แค่ตัวหนังสือสีแดง */
                #monthlyDurationTable tbody td.duration-alert-danger {
                        background-color: rgba(220, 53, 69, 0.1) !important;
                        color: #c0392b !important;
                        font-weight: 700;
                }

                /* "รอฝ่ายคลังรับ" ที่มีค่า > 0 เน้นพื้นเหลือง/ส้มให้สังเกตเห็นทันที */
                #monthlyDurationTable tbody td.duration-alert-warning {
                        background-color: rgba(230, 162, 60, 0.15) !important;
                        color: #b7791f !important;
                        font-weight: 700;
                }

                /* เซลล์ที่ยังไม่มีข้อมูล (ค่า 0) ให้เป็นสีเทาอ่อนเสมอ ไม่ปนกับสีพื้นของกลุ่มคอลัมน์ */
                #monthlyDurationTable tbody td.mom-cell-disabled {
                        background-color: #f3f4f7 !important;
                }

                /* ตัวเลขหลัก + % สัดส่วนของเดือนนั้น แสดงซ้อนกันในเซลล์เดียว */
                #monthlyDurationTable .mom-value {
                        font-size: 0.95rem;
                        line-height: 1.2;
                }
                #monthlyDurationTable .mom-percent {
                        font-size: 0.7rem;
                        font-weight: 400;
                        color: #8a8fa3;
                        line-height: 1.3;
                }
                #monthlyDurationTable td.duration-alert-danger .mom-percent {
                        color: #c0392b;
                        opacity: 0.75;
                }
                #monthlyDurationTable td.duration-alert-warning .mom-percent {
                        color: #b7791f;
                        opacity: 0.75;
                }

                .mom-delta {
                        display: inline-flex;
                        align-items: center;
                        gap: 4px;
                        padding: 3px 10px;
                        border-radius: 20px;
                        font-size: 0.78rem;
                        font-weight: 700;
                }

                .mom-delta .mom-arrow {
                        font-size: 1rem;
                        font-weight: 700;
                        line-height: 1;
                }

                .mom-delta.down {
                        background: #e6f7ee;
                        color: #1a9d5c;
                }

                .mom-delta.up {
                        background: #fdeaea;
                        color: #e03e3e;
                }

                .mom-delta.flat {
                        color: #9aa1ac;
                        font-weight: 400;
                }

                /* ===== Weekly Deep Stats Table & Reason Modal ===== */
                .week-label-link {
                        color: #2f6fed;
                        font-weight: 700;
                        text-decoration: none;
                }

                .week-label-link:hover {
                        text-decoration: underline;
                        color: #1e4fbe;
                }

                .week-date-range {
                        font-weight: 400;
                        font-size: 0.76rem;
                        margin-top: 2px;
                }

                .table-mom tbody tr.week-total-row {
                        background-color: #eef1f8 !important;
                }

                .table-mom tbody tr.week-total-row td {
                        color: #2c2f48;
                }

                .table-mom tbody tr.week-total-row td.mom-cum {
                        color: #2f6fed;
                }

                .table-mom tbody tr.week-total-row td.mom-reply {
                        color: #e8a33d;
                }

                .table-mom tbody tr.week-total-row td.mom-normal {
                        color: #17a673;
                }

                .week-tip-box {
                        display: flex;
                        align-items: center;
                        gap: 14px;
                        background: #eef4ff;
                        border: 1px solid #d7e6ff;
                        border-radius: 12px;
                        padding: 14px 18px;
                        margin-top: 16px;
                        flex-wrap: wrap;
                }

                .week-tip-icon {
                        display: inline-flex;
                        align-items: center;
                        justify-content: center;
                        width: 40px;
                        height: 40px;
                        border-radius: 10px;
                        background: #4F46E5;
                        color: #fff;
                        font-size: 1.1rem;
                        flex-shrink: 0;
                }

                .week-tip-text {
                        flex: 1;
                        min-width: 200px;
                }

                .week-tip-title {
                        font-weight: 700;
                        color: #2c2f48;
                        font-size: 0.92rem;
                }

                .week-tip-sub {
                        color: #5a6178;
                        font-size: 0.8rem;
                        margin-top: 2px;
                }

                .week-tip-btn {
                        flex-shrink: 0;
                        display: inline-block;
                        border: none;
                        border-radius: 20px;
                        background: #4F46E5;
                        color: #fff;
                        font-weight: 600;
                        font-size: 0.8rem;
                        padding: 8px 16px;
                        white-space: nowrap;
                        cursor: default;
                        user-select: none;
                        animation: weekTipBlink 1.8s ease-in-out infinite;
                }

                @keyframes weekTipBlink {
                        0%, 100% { opacity: 1; }
                        50% { opacity: 0.55; }
                }

                .reason-registry-header {
                        font-weight: 700;
                        color: #2c2f48;
                        font-size: 0.88rem;
                        margin-bottom: 10px;
                }

                /* ===== Staff x Month Heatmap ===== */
                .heatmap-wrap {
                        background: #fff;
                }

                .heatmap-scroll {
                        overflow: visible;
                }

                .table-heatmap {
                        font-size: 0.78rem;
                        table-layout: fixed;
                        width: 100%;
                }

                .table-heatmap thead th {
                        text-align: center;
                        padding: 6px 2px 8px;
                        vertical-align: bottom;
                        height: 130px;
                        border: 1px solid #dfe3ee;
                }

                .table-heatmap thead th:not(.heatmap-corner) {
                        writing-mode: vertical-rl;
                        transform: rotate(180deg);
                        white-space: nowrap;
                        text-align: left;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        max-height: 128px;
                        font-size: 0.76rem;
                }

                .table-heatmap thead th.heatmap-corner {
                        position: sticky;
                        left: 0;
                        z-index: 4;
                        text-align: left;
                        background: #eef1f8;
                        width: 110px;
                        white-space: nowrap;
                        vertical-align: middle;
                }

                .table-heatmap tbody td:first-child,
                .table-heatmap tfoot td:first-child {
                        position: sticky;
                        left: 0;
                        z-index: 2;
                        background: #f7f8fc;
                        font-weight: 700;
                        white-space: nowrap;
                        text-align: left;
                        padding: 5px 14px;
                        width: 110px;
                }

                .table-heatmap tbody tr:nth-child(even) td:first-child {
                        background: #f2f0e6;
                }

                .table-heatmap td.heatmap-cell {
                        text-align: center;
                        vertical-align: middle;
                        padding: 4px 2px;
                        overflow: hidden;
                        border: 1px solid #eef0f5;
                }

                .heatmap-cell .hc-frac {
                        display: block;
                        font-weight: 700;
                        font-size: 0.8rem;
                        color: #2c2f48;
                        line-height: 1.2;
                }

                .heatmap-cell .hc-pct {
                        display: block;
                        font-size: 0.68rem;
                        color: #666;
                        margin-top: 0;
                        line-height: 1.2;
                }

                .heatmap-cell.hc-clickable {
                        cursor: pointer;
                        transition: 0.15s;
                }

                .heatmap-cell.hc-clickable:hover {
                        filter: brightness(0.94);
                        outline: 2px solid rgba(59, 125, 237, 0.35);
                        outline-offset: -2px;
                }

                .heatmap-cell.heat-none {
                        background: #fafbfc;
                        color: #c3c7d1;
                }

                .heatmap-cell.heat-zero {
                        background: #eafaf1;
                }

                .heatmap-cell.heat-low {
                        background: #d9f5e3;
                }

                .heatmap-cell.heat-mid {
                        background: #fff2cc;
                }

                .heatmap-cell.heat-high {
                        background: #fbdada;
                }

                .table-heatmap tfoot td {
                        font-weight: 700;
                }

                .table-heatmap tfoot td.heatmap-cell {
                        border: 1px solid #e3e6f0;
                        border-top: 2px solid #cfd3e0;
                }

                .table-heatmap tfoot td.heatmap-total-label {
                        background: #eef1f8 !important;
                        color: #2c2f48;
                        border-top: 2px solid #cfd3e0;
                }

                .table-heatmap tfoot td.heatmap-cell-total.heat-none {
                        color: #9aa1ac;
                }

                .heatmap-legend {
                        display: flex;
                        flex-wrap: wrap;
                        gap: 16px;
                        padding: 12px 4px 2px;
                        font-size: 0.8rem;
                        color: #555;
                }

                .heatmap-legend-item {
                        display: inline-flex;
                        align-items: center;
                        gap: 6px;
                }

                .heatmap-swatch {
                        display: inline-block;
                        width: 14px;
                        height: 14px;
                        border-radius: 3px;
                        border: 1px solid #dfe2ea;
                }

                .heatmap-swatch.heat-none { background: #fafbfc; }
                .heatmap-swatch.heat-low { background: #d9f5e3; }
                .heatmap-swatch.heat-mid { background: #fff2cc; }
                .heatmap-swatch.heat-high { background: #fbdada; }

                /* ===== MoM Detail Modal ===== */
                .mom-modal-header {
                        background: linear-gradient(135deg, #4F46E5 0%, #3730A3 100%);
                        color: #fff;
                        border-radius: 12px 12px 0 0;
                        padding: 18px 24px;
                }

                .mom-modal-header .close {
                        color: #fff;
                        opacity: 0.85;
                        text-shadow: none;
                }

                #momModalTable {
                        table-layout: fixed;
                        width: 100%;
                }

                #momModalTable thead th {
                        background-color: #eef1f8;
                        color: #2c2f48;
                        border: none;
                        font-weight: 700;
                        font-size: 0.85rem;
                        padding: 10px;
                        white-space: nowrap;
                }

                #momModalTable tbody td {
                        font-size: 0.85rem;
                        padding: 10px;
                        vertical-align: middle;
                        border: none;
                        border-bottom: none;
                        word-break: break-word;
                }

                .mom-status {
                        display: inline-block;
                        padding: 4px 12px;
                        border-radius: 14px;
                        font-size: 0.76rem;
                        font-weight: 600;
                        white-space: nowrap;
                }

                .mom-status.status-reply {
                        background: #ffebee;
                        color: #c62828;
                        border: 1px solid #ffcdd2;
                }

                .mom-status.status-normal {
                        background: #e6fffa;
                        color: #00796b;
                        border: 1px solid #b2dfdb;
                }

                #weekReasonTableWrap .table-responsive {
                        border: 1px solid #e9ecef;
                        border-radius: 10px;
                        overflow-y: auto;
                        overflow-x: hidden;
                }

                #weekReasonTable {
                        table-layout: fixed;
                        width: 100%;
                }

                #weekReasonTable thead th {
                        background-color: #eef1f8;
                        color: #2c2f48;
                        border: none;
                        font-weight: 700;
                        font-size: 0.85rem;
                        padding: 10px;
                        white-space: nowrap;
                }

                #weekReasonTable tbody td {
                        font-size: 0.85rem;
                        padding: 10px;
                        vertical-align: middle;
                        border: none;
                        word-break: break-word;
                }

                #momModalTable tbody td:nth-child(1),
                #momModalTable tbody td:nth-child(2),
                #momModalTable tbody td:nth-child(3),
                #weekReasonTable tbody td:nth-child(1),
                #weekReasonTable tbody td:nth-child(2),
                #weekReasonTable tbody td:nth-child(3) {
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        font-size: 0.8rem;
                }

                #durationModalTable {
                        table-layout: fixed;
                        width: 100%;
                }

                #durationModalTable thead th {
                        background-color: #eef1f8;
                        color: #2c2f48;
                        border: none;
                        font-weight: 700;
                        font-size: 0.8rem;
                        padding: 8px;
                        white-space: normal;
                        vertical-align: middle;
                }

                #durationModalTable tbody td {
                        font-size: 0.8rem;
                        padding: 8px;
                        vertical-align: middle;
                        border: none;
                        border-bottom: none;
                        word-break: break-word;
                }

                #durationModalTable th:nth-child(1),  #durationModalTable td:nth-child(1)  { width: 5%; }
                #durationModalTable th:nth-child(2),  #durationModalTable td:nth-child(2)  { width: 12%; }
                #durationModalTable th:nth-child(3),  #durationModalTable td:nth-child(3)  { width: 11%; }
                #durationModalTable th:nth-child(4),  #durationModalTable td:nth-child(4)  { width: 10%; }
                #durationModalTable th:nth-child(5),  #durationModalTable td:nth-child(5)  { width: 11%; }
                #durationModalTable th:nth-child(6),  #durationModalTable td:nth-child(6)  { width: 18%; }
                #durationModalTable th:nth-child(7),  #durationModalTable td:nth-child(7)  { width: 8%; }
                #durationModalTable th:nth-child(8),  #durationModalTable td:nth-child(8)  { width: 8%; }
                #durationModalTable th:nth-child(9),  #durationModalTable td:nth-child(9)  { width: 9%; }
                #durationModalTable th:nth-child(10), #durationModalTable td:nth-child(10) { width: 8%; }

                #durationModalTable tbody td:nth-child(1),
                #durationModalTable tbody td:nth-child(7),
                #durationModalTable tbody td:nth-child(8),
                #durationModalTable tbody td:nth-child(9),
                #durationModalTable tbody td:nth-child(10) {
                        white-space: nowrap;
                }

                #durationModalTable tbody td:nth-child(6) {
                        overflow: hidden;
                        text-overflow: ellipsis;
                }

                .mom-toggle-reason {
                        display: inline-flex;
                        align-items: center;
                        gap: 5px;
                        border-radius: 8px;
                        font-size: 0.78rem;
                        font-weight: 500;
                        padding: 6px 14px;
                        white-space: nowrap;
                        background: #eef1fb;
                        border: 1px solid #d8ddef;
                        color: #2c3e78;
                        transition: 0.15s;
                }

                .mom-toggle-reason:hover {
                        background: #e2e6fa;
                        color: #2c3e78;
                }

                .mom-reason-box {
                        background: #fff;
                        border: 1px solid #ffd6d6;
                        border-radius: 10px;
                        padding: 12px 16px;
                        font-size: 0.8rem;
                        width: 100%;
                        box-shadow: 0 4px 14px rgba(0, 0, 0, 0.06);
                }

                .mom-reason-title {
                        color: #c62828;
                        font-weight: 700;
                        margin-bottom: 4px;
                }

                .mom-reason-text {
                        color: #555;
                        margin-bottom: 8px;
                        white-space: pre-line;
                }

                .mom-reason-hide {
                        display: block;
                        text-align: center;
                        color: #4F46E5;
                        font-weight: 600;
                        font-size: 0.78rem;
                        text-decoration: none;
                }

                .mom-reason-hide:hover {
                        text-decoration: underline;
                }

                /* ===== Weekly Top-5 Defect Ranking Box ===== */
                .top-defect-card {
                        background: #eef4ff;
                        border: 1px solid #d7e6ff;
                        border-radius: 12px;
                        padding: 14px 18px 16px;
                        margin-bottom: 18px;
                }

                .top-defect-header {
                        font-weight: 700;
                        color: #2c2f48;
                        font-size: 0.92rem;
                        margin-bottom: 10px;
                }

                .top-defect-row {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        gap: 10px;
                        background: #fff;
                        border: 1px solid #e2e8f0;
                        border-radius: 8px;
                        padding: 10px 14px;
                        margin-bottom: 8px;
                }

                .top-defect-row:last-child {
                        margin-bottom: 0;
                }

                .top-defect-text {
                        font-size: 0.85rem;
                        color: #333;
                        flex: 1 1 auto;
                        min-width: 0;
                }

                .top-defect-text strong {
                        color: #2c2f48;
                }

                .top-defect-badge {
                        flex-shrink: 0;
                        display: inline-block;
                        background: #ffebee;
                        color: #c62828;
                        border: 1px solid #ffcdd2;
                        border-radius: 14px;
                        font-size: 0.78rem;
                        font-weight: 700;
                        padding: 4px 12px;
                        white-space: nowrap;
                }

                .top-defect-empty {
                        text-align: center;
                        color: #9aa1ac;
                        font-size: 0.85rem;
                        padding: 10px 0 2px;
                }

                /* ===== Staff x Week Heatmap ===== */
                #weekHeatmapTable thead th.heatmap-corner {
                        width: 140px;
                }

                #weekHeatmapTable tbody td:first-child,
                #weekHeatmapTable tfoot td:first-child {
                        white-space: normal;
                        width: 140px;
                }

                #weekHeatmapTable .week-date-range {
                        font-weight: 400;
                }

                /* ===== Reply Reason Registry ===== */
                .registry-toolbar {
                        gap: 10px;
                        flex-wrap: wrap;
                }

                .registry-toolbar .bootstrap-select.registry-scope-select {
                        width: auto !important;
                        min-width: 260px;
                }

                .registry-toolbar .bootstrap-select.registry-scope-select .btn {
                        border-radius: 8px;
                        font-size: 0.82rem;
                        font-weight: 600;
                }

                .registry-toolbar .bootstrap-select.registry-scope-select {
                        z-index: 1030;
                }

                .registry-toolbar .bootstrap-select.registry-scope-select .dropdown-menu {
                        z-index: 1030;
                        min-width: 100%;
                        width: 100%;
                }

                .registry-toolbar .bootstrap-select.registry-scope-select .dropdown-item {
                        font-size: 0.82rem;
                        white-space: normal;
                        word-break: break-word;
                }

                .registry-count-badge {
                        display: inline-flex;
                        align-items: center;
                        background: #fff4e0;
                        color: #b8720a;
                        border: 1px solid #ffe1ad;
                        border-radius: 20px;
                        padding: 5px 14px;
                        font-size: 0.8rem;
                        font-weight: 700;
                        white-space: nowrap;
                }

                #replyRegistryTableWrap {
                        overflow-x: hidden;
                }

                #replyRegistryTable {
                        table-layout: fixed;
                        width: 100%;
                }

                #replyRegistryTable thead th {
                        white-space: nowrap;
                        background-color: #eef1f8;
                        color: #2c2f48;
                        border: none;
                        font-weight: 700;
                        font-size: 0.85rem;
                        padding: 10px;
                }

                #replyRegistryTable tbody td {
                        font-size: 0.85rem;
                        padding: 10px;
                        vertical-align: middle;
                        border: none;
                        word-break: break-word;
                }

                #replyRegistryTable thead th:nth-child(1), #replyRegistryTable tbody td:nth-child(1) { width: 9%; }
                #replyRegistryTable thead th:nth-child(2), #replyRegistryTable tbody td:nth-child(2) { width: 11%; }
                #replyRegistryTable thead th:nth-child(3), #replyRegistryTable tbody td:nth-child(3) { width: 9%; }
                #replyRegistryTable thead th:nth-child(4), #replyRegistryTable tbody td:nth-child(4) { width: 10%; }
                #replyRegistryTable thead th:nth-child(5), #replyRegistryTable tbody td:nth-child(5) { width: 13%; }
                #replyRegistryTable thead th:nth-child(6), #replyRegistryTable tbody td:nth-child(6) { width: 8%; }
                #replyRegistryTable thead th:nth-child(7), #replyRegistryTable tbody td:nth-child(7) { width: 12%; }
                #replyRegistryTable thead th:nth-child(8), #replyRegistryTable tbody td:nth-child(8) { width: 12%; }
                #replyRegistryTable thead th:nth-child(9), #replyRegistryTable tbody td:nth-child(9) { width: 16%; }

                #replyRegistryTable tbody td:nth-child(1),
                #replyRegistryTable tbody td:nth-child(2),
                #replyRegistryTable tbody td:nth-child(3) {
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                }

                /* เซลล์แสดงรายละเอียดแต่ละ "รอบทักท้วง" (วันที่ทักท้วง / วันที่รับคืน) */
                .mom-round-cell {
                        line-height: 1.3;
                }

                .mom-round-date {
                        font-weight: 700;
                        color: #dc3545;
                        white-space: nowrap;
                }

                .mom-round-receive {
                        font-size: 0.78rem;
                        color: #6c757d;
                }

                .mom-round-receive.text-warning {
                        color: #d39e00 !important;
                        font-weight: 600;
                }

                /* badge จำนวนรอบทักท้วงที่เกิน 2 รอบ (เช่น +1 รอบ) */
                .mom-round-extra-badge {
                        display: inline-block;
                        margin-left: 4px;
                        background: #6c2fc0;
                        color: #fff;
                        border-radius: 10px;
                        padding: 1px 6px;
                        font-size: 0.68rem;
                        font-weight: 700;
                        vertical-align: middle;
                }

                .registry-doc-withdraw {
                        font-weight: 700;
                        color: #2f6fed;
                }
        </style>
        <link rel="stylesheet" type="text/css" href="../css/report-style-biType.css">

</head>



<body>
        <div class="container-fluid pt-3 pb-5">
                <div class="text-center mb-3">
                        <img src="../images/logo.png" alt="logo" class="report-logo" style="height: 150px; width: auto;">
                </div>
                <div class="card-custom p-3">
                        <div class="d-flex justify-content-between align-items-center mb-3">
                                <h5 class="font-weight-bold m-0">รายงานสรุปรายการทักท้วง (Reply Report)</h5>
                                <div class="custom-control custom-switch">
                                        <!-- <input type="checkbox" class="custom-control-input" id="darkToggle"> -->
                                </div>
                        </div>

                        <!-- Main Month/Fiscal-Year Selector (ควบคุม KPI รายเดือน/กราฟ/ตาราง MoM ด้านล่างทั้งหมด) -->
                        <div class="filter-card main-month-filter-card">
                                <div class="d-flex justify-content-between align-items-center flex-wrap">
                                        <div class="filter-card-title mb-2 mb-md-0"><i class="fas fa-calendar-alt"></i> เลือกช่วงรอบบัญชีประจำเดือนหลัก</div>
                                        <select id="main_month_filter" class="selectpicker form-control" data-style="btn-outline-primary" data-width="220px" data-dropup-auto="false" title="เลือกเดือน/ปีงบประมาณ">
                                                <!-- JS (initMainMonthSelect) จะ render ตัวเลือกเดือน ต.ค. ของปีงบประมาณปัจจุบัน ถึงเดือนปัจจุบันที่นี่ -->
                                        </select>
                                </div>
                        </div>

                        <!-- Filter Card -->
                        <div class="filter-card">
                                <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap">
                                        <div class="filter-card-title"><i class="fas fa-sliders-h"></i> ขอบเขตตัวกรองข้อมูลเชิงวิเคราะห์</div>
                                        <button type="button" class="btn btn-primary btn-sm rounded" id="btnOpenGroupModal">
                                                <i class="fas fa-users"></i> จัดกลุ่มสายงานเจ้าหน้าที่
                                        </button>
                                </div>

                                <div class="row">
                                        <div class="col-lg-8 mb-2">
                                                <div class="d-flex justify-content-between align-items-center mb-2">
                                                        <div class="filter-subtitle"><i class="fas fa-user-friends"></i> ชื่อผู้ส่งเอกสารเบิกจ่ายในระบบ (แยกสิทธิ์จำแนกตามสายงาน)</div>
                                                        <div>
                                                                <button type="button" class="btn-soft" id="btnSelectAllStaff">เลือกทั้งหมด</button>
                                                                <button type="button" class="btn-soft" id="btnClearAllStaff">ล้างการเลือก</button>
                                                        </div>
                                                </div>
                                                <div id="staffGroupFilterContainer">
                                                        <!-- JS จะ render กลุ่ม สายงาน 1 / สายงาน 2 / อื่นๆ ที่นี่ -->
                                                </div>
                                        </div>

                                        <div class="col-lg-4 mb-2">
                                                <div class="month-select-box gt-period-box">
                                                        <div class="d-flex justify-content-between align-items-center mb-2 flex-wrap">
                                                                <div class="filter-subtitle mb-0"><i class="fas fa-calendar-check"></i> ช่วงวันที่สำหรับสรุปยอด Grand Total</div>
                                                                <button type="button" class="btn-soft" id="gtCustomRangeToggleBtn" title="ค่าเริ่มต้นแสดงยอดสะสมตั้งแต่ต้นปีงบประมาณถึงวันนี้อัตโนมัติ (ใช้งานได้ทุกสัปดาห์) กดปุ่มนี้ถ้าต้องการกำหนดช่วงวันที่เองเพื่อเทียบยอดกับทางคลัง">
                                                                        <i class="fas fa-warehouse mr-1"></i>ดูตามคลัง (กำหนดช่วงวันที่เอง)
                                                                </button>
                                                        </div>
                                                        <div class="gt-period-controls-compact d-none" id="gtCustomRangeBox">
                                                                <div class="gt-period-field">
                                                                        <label for="gtDateStart" title="ยอดส่งเบิกนับจากวันที่สร้างใบเบิก (d_create), ยอดทักท้วงนับจากวันที่ทักท้วง (d_doc_date)">ตั้งแต่วันที่</label>
                                                                        <!-- ค่าเริ่มต้นถูกกำหนดแบบ dynamic ที่ JS (วันที่ 1 ต.ค. ของปีงบประมาณปัจจุบัน) ไม่ hardcode ปี/เดือนไว้ที่นี่ -->
                                                                        <input type="date" id="gtDateStart" class="form-control form-control-sm">
                                                                        <!-- <small class="text-muted" id="gtDateStartTh"></small> -->
                                                                </div>
                                                                <div class="gt-period-field">
                                                                        <label for="gtDateEnd">ถึงวันที่</label>
                                                                        <!-- ค่าเริ่มต้นถูกกำหนดแบบ dynamic ที่ JS (วันที่ปัจจุบัน) ไม่ hardcode ปี/เดือนไว้ที่นี่ -->
                                                                        <input type="date" id="gtDateEnd" class="form-control form-control-sm">
                                                                        <!-- <small class="text-muted" id="gtDateEndTh"></small> -->
                                                                </div>
                                                                <button type="button" id="gtDateCalcBtn" class="btn btn-sm btn-primary gt-period-btn">
                                                                        <i class="fas fa-calculator mr-1"></i>คำนวณ
                                                                </button>
                                                                <button type="button" id="gtDateResetBtn" class="btn btn-sm btn-outline-secondary gt-period-btn" title="กลับไปใช้ค่าเริ่มต้น: ต้นปีงบประมาณ - วันนี้">
                                                                        <i class="fas fa-undo mr-1"></i>ค่าเริ่มต้น
                                                                </button>
                                                        </div>
                                                        <div class="gt-period-hint text-muted" id="gtDateHint"></div>
                                                </div>
                                        </div>
                                </div>
                        </div>

                        <!-- KPI Cards (รายเดือน ตามเดือนที่เลือก) -->
                        <div class="row mb-3" id="kpiCardsRow">
                                <div class="col-lg col-md-6 mb-2">
                                        <div class="kpi-card kpi-sent">
                                                <div class="kpi-label">ยอดส่งเบิกคลังรวมรายเดือน</div>
                                                <div class="kpi-value" id="kpi_month_sent">0</div>
                                        </div>
                                </div>
                                <div class="col-lg col-md-6 mb-2">
                                        <div class="kpi-card kpi-pending kpi-clickable" id="kpiPendingCard" title="คลิกเพื่อดูรายการที่คลังยังไม่รับเรื่อง">
                                                <div class="kpi-label">รอคลังรับเรื่องส่งเบิกรายเดือน (เคส)</div>
                                                <div class="kpi-value" id="kpi_month_pending">0</div>
                                        </div>
                                </div>
                                <div class="col-lg col-md-6 mb-2">
                                        <div class="kpi-card kpi-reply" title="เอกสาร = นับไม่ซ้ำต่อใบเบิก (ตามวันที่สร้างใบเบิก d_create)">
                                                <div class="kpi-label">จำนวนเอกสารที่ถูกทักท้วงรายเดือน (เคส)</div>
                                                <div class="kpi-value" id="kpi_month_reply">0</div>
                                        </div>
                                </div>
                                <div class="col-lg col-md-6 mb-2">
                                        <div class="kpi-card kpi-normal">
                                                <div class="kpi-label">จำนวนเอกสารผ่านเกณฑ์ปกติรายเดือน (เคส)</div>
                                                <div class="kpi-value" id="kpi_month_normal">0</div>
                                        </div>
                                </div>
                                <div class="col-lg col-md-6 mb-2">
                                        <div class="kpi-card kpi-ratio">
                                                <div class="kpi-label">สัดส่วนอัตราการทักท้วงเฉลี่ยรายเดือน (%)</div>
                                                <div class="kpi-value" id="kpi_month_pct">0.0%</div>
                                        </div>
                                </div>
                        </div>

                        <!-- Quarterly Summary Donuts -->
                        <div class="card-custom p-3">
                                <div class="chart-header"><i class="fas fa-chart-pie mr-1"></i> สรุปภาพรวมสัดส่วนการทักท้วงรายไตรมาส (Quarterly Summary)</div>
                                <div class="row" id="quarterDonutRow">
                                        <div class="col-md-3 col-6 quarter-card">
                                                <div class="quarter-title">ไตรมาส 1 (ต.ค.-ธ.ค.)</div>
                                                <div class="quarter-donut" id="quarterDonut0"></div>
                                                <div class="quarter-total" id="quarterTotal0">รวมทั้งหมด: 0 เรื่อง</div>
                                                <div class="quarter-sub" id="quarterSub0"></div>
                                        </div>
                                        <div class="col-md-3 col-6 quarter-card">
                                                <div class="quarter-title">ไตรมาส 2 (ม.ค.-มี.ค.)</div>
                                                <div class="quarter-donut" id="quarterDonut1"></div>
                                                <div class="quarter-total" id="quarterTotal1">รวมทั้งหมด: 0 เรื่อง</div>
                                                <div class="quarter-sub" id="quarterSub1"></div>
                                        </div>
                                        <div class="col-md-3 col-6 quarter-card">
                                                <div class="quarter-title">ไตรมาส 3 (เม.ย.-มิ.ย.)</div>
                                                <div class="quarter-donut" id="quarterDonut2"></div>
                                                <div class="quarter-total" id="quarterTotal2">รวมทั้งหมด: 0 เรื่อง</div>
                                                <div class="quarter-sub" id="quarterSub2"></div>
                                        </div>
                                        <div class="col-md-3 col-6 quarter-card">
                                                <div class="quarter-title">ไตรมาส 4 (ก.ค.-ก.ย.)</div>
                                                <div class="quarter-donut" id="quarterDonut3"></div>
                                                <div class="quarter-total" id="quarterTotal3">รวมทั้งหมด: 0 เรื่อง</div>
                                                <div class="quarter-sub" id="quarterSub3"></div>
                                        </div>
                                </div>
                        </div>

                        <!-- Grand Total Dark Bar -->
                        <div class="grandtotal-bar">
                                <div class="grandtotal-label">
                                        <i class="fas fa-database"></i>
                                        สรุปตัวเลขสถิติปริมาณงานสะสมรวมสุทธิ (Grand Totals)
                                </div>
                                <div class="grandtotal-item">
                                        <div class="gt-title" title="นับใบเบิก (ไม่ซ้ำ) ที่วันที่สร้างใบเบิก (d_create) อยู่ในช่วงวันที่ที่เลือกด้านล่าง (กล่อง 'ช่วงวันที่')">ยอดส่งเบิกคลังทั้งหมดสะสมสุทธิ (เรื่อง)</div>
                                        <div class="gt-value" id="sum_sent_all">0</div>
                                </div>
                                <div class="grandtotal-item gt-reply">
                                        <div class="gt-title" title="นับทุกรอบทักท้วงที่วันที่ทักท้วงจริง (d_doc_date) อยู่ในช่วงวันที่ที่เลือกด้านล่าง หากเอกสารใบเดียวถูกทักท้วงหลายรอบจะนับซ้ำทุกรอบ — ตรงกับรายงาน EIS (List_RepProtest.php) แบบ apples-to-apples">ยอดทักท้วงสะสมสุทธิ (นับทุกรอบ)</div>
                                        <div class="gt-value" id="sum_reply_all">0</div>
                                </div>
                                <div class="grandtotal-item gt-pct">
                                        <div class="gt-title">ค่าเฉลี่ยอัตราการทักท้วงเอกสารสะสมสุทธิ</div>
                                        <div class="gt-value" id="sum_percent_all">0%</div>
                                </div>
                        </div>

                        <!-- หมายเหตุ: กล่อง "เลือกช่วงรอบบัญชีประจำเดือนหลัก" อยู่ด้านบนสุด (เหนือ Filter Card)
                             ควบคุม KPI/กราฟ/ตาราง MoM รายเดือนด้านล่างทั้งหมด ผ่านตัวแปร selectedYearTh/selectedMonthIdx
                             ใน Report_StatusReply.js — จำกัดตัวเลือกเฉพาะปีงบประมาณปัจจุบัน (ต.ค. ถึงเดือนปัจจุบัน)
                             ส่วนกล่อง "ดูตามคลัง (กำหนดช่วงวันที่เอง)" ของ Grand Total ด้านบนยังคงเดิมไม่เปลี่ยนแปลง -->

                        <style>
                                .gt-period-controls-compact { display: flex; flex-direction: column; gap: 8px; margin-top: 4px; }
                                .gt-period-box .gt-period-field { display: flex; flex-direction: column; gap: 2px; }
                                .gt-period-box .gt-period-field label { font-size: 0.78rem; color: #6c757d; font-weight: 600; margin-bottom: 0; }
                                .gt-period-box .gt-period-field small { font-size: 0.7rem; }
                                .gt-period-box .gt-period-btn { align-self: flex-start; }
                                .gt-period-hint { font-size: 0.75rem; margin-top: 8px; min-height: 1.2em; }
                        </style>

                        <!-- Waffle Chart -->
                        <div class="card-custom p-3">
                                <div class="chart-header-row">
                                        <div class="chart-header mb-0"><i class="fas fa-th mr-1"></i> แผนภาพแจกแจงสัดส่วนเอกสารส่งเบิกเทียบทักท้วงสะสมรายเดือน (Waffle Chart)</div>

                                        <div class="waffle-legend">
                                                <div class="waffle-legend-item"><span class="waffle-legend-dot normal"></span><span id="waffleLegendNormal">ปกติ (0)</span></div>
                                                <div class="waffle-legend-item"><span class="waffle-legend-dot reply"></span><span id="waffleLegendReply">ทักท้วง (0)</span></div>
                                        </div>
                                </div>
                                <div class="waffle-row" id="waffleChartRow">
                                        <!-- JS จะ render กราฟ waffle รายเดือนที่นี่ -->
                                </div>
                        </div>

                        <!-- Cumulative Trend Chart -->
                        <div class="card-custom p-3">
                                <div class="chart-header"><i class="fas fa-chart-bar mr-1"></i> แผนภูมิเปรียบเทียบปริมาณการส่งเบิกสะสม รายเดือนและแนวโน้มการทักท้วงเอกสาร (%)</div>
                                <div id="cumulativeTrendChart" style="width:100%; height:420px;"></div>
                        </div>

                        <!-- MoM Trends Table -->
                        <div class="card-custom p-3">
                                <div class="chart-header-row">
                                        <div class="chart-header mb-0 d-flex align-items-center"><i class="fas fa-table"></i></span> ตารางวิเคราะห์เปรียบเทียบประสิทธิภาพเอกสารและการส่งเบิกรายรอบเดือน (Month-on-Month Trends)</div>
                                        <button type="button" class="mom-export-btn" id="btnExportMomCsv">
                                                <i class="fas fa-download mr-1"></i> Export เป็น CSV
                                        </button>
                                </div>
                                <div class="table-mom-wrap">
                                        <div class="table-responsive">
                                                <table class="table-mom" id="momTrendsTable">
                                                        <thead>
                                                                <tr>
                                                                        <th>รอบบัญชี เดือน/ปี</th>
                                                                        <th>สะสมรวม</th>
                                                                        <th>จำนวนส่งเบิกประจำรอบเดือน</th>
                                                                        <th>ทักท้วงแก้ไข (เคส)</th>
                                                                        <th>ผ่านเกณฑ์ปกติ (เคส)</th>
                                                                        <th>อัตราท้วง (%)</th>
                                                                        <th>ผลต่างเทียบเดือนก่อนหน้า (Delta)</th>
                                                                </tr>
                                                        </thead>
                                                        <tbody id="momTrendsBody">
                                                                <tr>
                                                                        <td colspan="7" class="text-center py-4 text-muted">กำลังโหลดข้อมูล...</td>
                                                                </tr>
                                                        </tbody>
                                                </table>
                                        </div>
                                </div>
                        </div>

                        <!-- Staff x Month Heatmap -->
                        <div class="card-custom p-3">
                                <div class="chart-header-row">
                                        <div class="chart-header mb-0 d-flex align-items-center"><i class="fas fa-th mr-2"></i> แผนภาพแสดงความหนาแน่นปริมาณงานและอัตราส่วนการทักท้วงเอกสารรายบุคคลจำแนกรายเดือน (Heatmap)</div>
                                </div>
                                <div class="table-mom-wrap heatmap-wrap">
                                        <div class="heatmap-scroll">
                                                <table class="table-mom table-heatmap" id="staffHeatmapTable">
                                                        <thead>
                                                                <tr id="heatmapHeaderRow">
                                                                        <th class="heatmap-corner">เดือน / ผู้เบิก</th>
                                                                </tr>
                                                        </thead>
                                                        <tbody id="heatmapBody">
                                                                <tr>
                                                                        <td class="text-center py-4 text-muted">กำลังโหลดข้อมูล...</td>
                                                                </tr>
                                                        </tbody>
                                                        <tfoot id="heatmapFooter"></tfoot>
                                                </table>
                                        </div>
                                </div>
                                <div class="heatmap-legend">
                                        <span class="heatmap-legend-item"><span class="heatmap-swatch heat-none"></span>ไม่มีข้อมูล</span>
                                        <span class="heatmap-legend-item"><span class="heatmap-swatch heat-low"></span>อัตราทักท้วงต่ำ</span>
                                        <span class="heatmap-legend-item"><span class="heatmap-swatch heat-mid"></span>อัตราทักท้วงปานกลาง</span>
                                        <span class="heatmap-legend-item"><span class="heatmap-swatch heat-high"></span>อัตราทักท้วงสูง</span>
                                </div>
                        </div>

                        <!-- Overall Group Breakdown -->
                        <div class="card-custom p-3">
                                <div class="chart-header mb-0 d-flex align-items-center"><i class="fas fa-chart-pie mr-2"></i> สัดส่วนภาพรวมสะสมจำแนกตามสายงาน (Overall Group Breakdown)</div>

                                <div class="gb-card" id="groupBreakdownRow">
                                        <!-- JS จะ render pictogram แต่ละสายงานที่นี่ -->
                                </div>

                                <div class="gb-legend-row" id="groupBreakdownLegend">
                                        <!-- JS จะ render สัญลักษณ์และยอดสรุปที่นี่ -->
                                </div>

                                <div class="gb-chart-title">กราฟเส้นเชิงซ้อนเปรียบเทียบการกระจายตัวของสถานะเอกสารตามสายงาน</div>
                                <div id="groupTrendChart"></div>

                                <div class="gb-bar-card">
                                        <div id="groupPercentBarChart"></div>
                                </div>
                        </div>

                        <!-- Weekly Waffle & Trend (อาทิตย์ - เสาร์ ของเดือนที่เลือก) -->
                        <div class="card-custom p-3">
                                <div class="chart-header mb-3 d-flex align-items-center"><i class="fas fa-chart-bar mr-2"></i> แผนภูมิสัดส่วนงานส่งเบิกคลังสะสมและแนวโน้มการทักท้วงเอกสารรายสัปดาห์ (อาทิตย์ - เสาร์)</div>

                                <div class="week-block">
                                        <div class="chart-header-row">
                                                <div class="chart-header mb-0"><i class="fas fa-th mr-1"></i> แผนภาพแจกแจงสัดส่วนเอกสารส่งเบิกเทียบทักท้วงรายสัปดาห์ (Waffle Chart)</div>
                                                <div class="waffle-legend">
                                                        <div class="waffle-legend-item"><span class="waffle-legend-dot normal"></span><span id="weekWaffleLegendNormal">ปกติ (0)</span></div>
                                                        <div class="waffle-legend-item"><span class="waffle-legend-dot reply"></span><span id="weekWaffleLegendReply">ทักท้วง (0)</span></div>
                                                </div>
                                        </div>
                                        <div class="waffle-row" id="weekWaffleChartRow">
                                                <!-- JS จะ render กราฟ waffle รายสัปดาห์ที่นี่ -->
                                        </div>
                                </div>

                                <div class="week-block">
                                        <div class="chart-header"><i class="fas fa-chart-bar mr-1"></i> กราฟวิเคราะห์ยอดส่งเบิกสะสม รายสัปดาห์ร่วมกับอัตราสัดส่วนการทักท้วงเอกสาร (%)</div>
                                        <div id="weeklyTrendChart" style="width:100%; height:420px;"></div>
                                </div>

                                <!-- Weekly Deep Stats Table -->
                                <div class="week-block">
                                        <div class="chart-header mb-3 d-flex align-items-center"><i class="fas fa-calendar-week mr-2"></i> ตารางวิเคราะห์สถิติส่งเบิกคลังรายสัปดาห์เชิงลึก (จำแนกตามวันอาทิตย์ - วันเสาร์)</div>
                                        <div class="table-mom-wrap">
                                                <div class="table-responsive">
                                                        <table class="table-mom" id="weeklyStatsTable">
                                                                <thead>
                                                                        <tr>
                                                                                <th>สัปดาห์ และช่วงทำการ (อา. - ส.)</th>
                                                                                <th>สะสมรวม</th>
                                                                                <th>จำนวนส่งเบิกประจำสัปดาห์</th>
                                                                                <th>ทักท้วงแก้ไข (เคส)</th>
                                                                                <th>ผ่านเกณฑ์ปกติ (เคส)</th>
                                                                                <th>อัตราท้วง (%)</th>
                                                                                <th>เทียบสัปดาห์ก่อน (Delta)</th>
                                                                        </tr>
                                                                </thead>
                                                                <tbody id="weeklyStatsBody">
                                                                        <tr>
                                                                                <td colspan="7" class="text-center py-4 text-muted">กำลังโหลดข้อมูล...</td>
                                                                        </tr>
                                                                </tbody>
                                                        </table>
                                                </div>
                                        </div>

                                        <div class="week-tip-box">
                                                <!-- <div class="week-tip-icon"><i class="fas fa-magic"></i></div> -->
                                                <div class="week-tip-text">
                                                        <div class="week-tip-title">โมดูลอัจฉริยะวิเคราะห์ประเภทเอกสารและเหตุผลที่ถูกทักท้วงสูงสุดในแต่ละสัปดาห์</div>
                                                        <div class="week-tip-sub">ท่านสามารถคลิกที่ลิงก์ข้อความ "สัปดาห์ที่ X" หรือตัวเลขในคอลัมน์ "ทักท้วงแก้ไข (เคส)" ในตารางข้างบน เพื่อเปิดกล่องป็อปอัปวิเคราะห์จำแนก 5 อันดับสาเหตุพร้อมรายการใบเบิกอย่างละเอียด</div>
                                                </div>
                                                <span class="week-tip-btn" id="btnWeeklyStatsHint">
                                                        <i class="fas fa-bolt mr-1"></i> เลือกคลิกสัปดาห์ในตารางเพื่อวิเคราะห์
                                                </span>
                                        </div>
                                </div>
                        </div>

                        <!-- Staff x Week Heatmap (สัปดาห์ อาทิตย์ - เสาร์ ของเดือนที่เลือกอยู่ในตัวกรอง) -->
                        <div class="card-custom p-3">
                                <div class="chart-header-row">
                                        <div class="chart-header mb-0 d-flex align-items-center"><i class="fas fa-th mr-2"></i> แผนภาพแสดงความหนาแน่นปริมาณงานและอัตราส่วนการทักท้วงเอกสารรายบุคคลจำแนกรายสัปดาห์ (Heatmap)</div>
                                </div>
                                <div class="table-mom-wrap heatmap-wrap">
                                        <div class="heatmap-scroll">
                                                <table class="table-mom table-heatmap" id="weekHeatmapTable">
                                                        <thead>
                                                                <tr id="weekHeatmapHeaderRow">
                                                                        <th class="heatmap-corner">สัปดาห์ / ผู้เบิก</th>
                                                                </tr>
                                                        </thead>
                                                        <tbody id="weekHeatmapBody">
                                                                <tr>
                                                                        <td class="text-center py-4 text-muted">กำลังโหลดข้อมูล...</td>
                                                                </tr>
                                                        </tbody>
                                                        <tfoot id="weekHeatmapFooter"></tfoot>
                                                </table>
                                        </div>
                                </div>
                                <!-- <div class="heatmap-legend">
                                        <span class="heatmap-legend-item"><span class="heatmap-swatch heat-none"></span>ไม่มีข้อมูล</span>
                                        <span class="heatmap-legend-item"><span class="heatmap-swatch heat-low"></span>อัตราทักท้วงต่ำ</span>
                                        <span class="heatmap-legend-item"><span class="heatmap-swatch heat-mid"></span>อัตราทักท้วงปานกลาง</span>
                                        <span class="heatmap-legend-item"><span class="heatmap-swatch heat-high"></span>อัตราทักท้วงสูง</span>
                                </div> -->
                        </div>

                        <!-- Reply Reason Registry (บันทึกและประวัติสารบบเรื่องที่ถูกทักท้วงย้อนหลัง) -->
                        <div class="card-custom p-3">
                                <div class="chart-header-row">
                                        <div class="chart-header mb-0 d-flex align-items-center"><i class="fas fa-folder-open mr-2"></i> รายละเอียดบันทึกและประวัติสารบบเรื่องที่ถูกทักท้วงย้อนหลัง</div>
                                        <div class="d-flex align-items-center registry-toolbar">
                                                <select id="replyRegistryScope" class="selectpicker form-control registry-scope-select" data-style="btn-outline-primary" data-width="300px" data-dropup-auto="false" title="เลือกขอบเขตข้อมูล">
                                                        <option value="month" selected>ดูเฉพาะรอบเดือนหลักที่เลือกวิเคราะห์</option>
                                                        <option value="all">ดูรายงานข้อมูลประวัติการทักท้วงสะสมทั้งหมด</option>
                                                </select>
                                                <span class="registry-count-badge" id="replyRegistryCountBadge">พบ 0 รายการ</span>
                                        </div>
                                </div>
                                <div class="table-mom-wrap">
                                        <div class="table-responsive" id="replyRegistryTableWrap" style="max-height: 55vh;">
                                                <table class="table table-hover mb-0" id="replyRegistryTable">
                                                        <thead class="thead-light">
                                                                <tr>
                                                                        <th class="sticky-top">ตรวจรับ</th>
                                                                        <th class="sticky-top">สัญญา</th>
                                                                        <th class="sticky-top">ใบเบิก</th>
                                                                        <th class="sticky-top">ผู้ทำรายการเบิก</th>
                                                                        <th class="sticky-top">บริษัทคู่ค้า/ผู้รับจ้าง</th>
                                                                        <th class="sticky-top text-center">วันที่ส่งเบิก</th>
                                                                        <th class="sticky-top text-center">รอบที่ 1</th>
                                                                        <th class="sticky-top text-center">รอบที่ 2</th>
                                                                        <th class="sticky-top">สาเหตุและเหตุผลสำคัญในการทักท้วงเอกสารคลัง</th>
                                                                </tr>
                                                        </thead>
                                                        <tbody id="replyRegistryBody">
                                                                <tr>
                                                                        <td colspan="9" class="text-center py-4 text-muted">กำลังโหลดข้อมูล...</td>
                                                                </tr>
                                                        </tbody>
                                                </table>
                                        </div>
                                        <div id="replyRegistryLoader" class="d-none justify-content-center align-items-center py-5">
                                                <div class="spinner-border text-primary" role="status">
                                                        <span class="sr-only">Loading...</span>
                                                </div>
                                        </div>
                                </div>
                        </div>
                </div>

                <!-- Monthly Duration Summary: ตรวจรับ -> จัดทำใบขอเบิก -> รับใบขอเบิก (ต.ค. ปีงบประมาณ ถึงเดือนล่าสุด) -->
                <div class="card-custom p-3">
                        <div class="chart-header-row">
                                <div class="chart-header mb-0 d-flex align-items-center"><i class="fas fa-hourglass-half mr-2"></i> สรุประยะเวลาดำเนินการรายเดือน (ตรวจรับ → จัดทำใบขอเบิก → รับใบขอเบิก)</div>
                                <div class="d-flex align-items-center">
                                        <select id="monthlyDurationGroupBy" class="form-control form-control-sm mr-2" style="width:220px;">
                                                <option value="create" selected>จัดกลุ่มตามเดือน "จัดทำใบขอเบิก"</option>
                                                <option value="audit">จัดกลุ่มตามเดือน "ตรวจรับ"</option>
                                        </select>
                                        <button type="button" class="btn btn-outline-primary btn-sm" id="btnLoadMonthlyDuration">
                                                <i class="fas fa-sync-alt mr-1"></i> โหลด/รีเฟรช
                                        </button>
                                </div>
                        </div>
                        <div class="small text-muted mt-2 mb-2">
                                นับจำนวนเอกสาร แบ่งตามช่วงจำนวนวันที่ใช้ (0-7 / 8-15 / 16-30 / เกิน 30 วัน) ต่อ 2 ช่วงเวลา:
                                <strong>ตรวจรับ → จัดทำใบขอเบิก</strong> และ <strong>จัดทำใบขอเบิก → รับใบขอเบิก (ฝ่ายคลังรับ)</strong>
                                — คอลัมน์ "รอฝ่ายคลังรับ" คือเอกสารที่ยังไม่มีวันที่รับใบขอเบิก (ค้างอยู่ ณ ปัจจุบัน)
                        </div>
                        <div class="table-mom-wrap">
                                <div class="table-responsive">
                                        <table class="table-mom" id="monthlyDurationTable">
                                                <thead>
                                                        <tr>
                                                                <th rowspan="2">เดือน</th>
                                                                <th colspan="5" class="text-center duration-group-stage1">ตรวจรับ → จัดทำใบขอเบิก</th>
                                                                <th colspan="6" class="text-center duration-group-stage2">จัดทำใบขอเบิก → รับใบขอเบิก</th>
                                                        </tr>
                                                        <tr>
                                                                <th class="text-center duration-sub-stage1">0-7 วัน</th>
                                                                <th class="text-center duration-sub-stage1">8-15 วัน</th>
                                                                <th class="text-center duration-sub-stage1">16-30 วัน</th>
                                                                <th class="text-center duration-sub-stage1 duration-sub-over30">เกิน 30 วัน</th>
                                                                <th class="text-center duration-sub-stage1 duration-sub-total">รวม</th>
                                                                <th class="text-center duration-sub-stage2">0-7 วัน</th>
                                                                <th class="text-center duration-sub-stage2">8-15 วัน</th>
                                                                <th class="text-center duration-sub-stage2">16-30 วัน</th>
                                                                <th class="text-center duration-sub-stage2 duration-sub-over30">เกิน 30 วัน</th>
                                                                <th class="text-center duration-sub-stage2 duration-sub-total">รวม</th>
                                                                <th class="text-center duration-sub-pending">รอฝ่ายคลังรับ</th>
                                                        </tr>
                                                </thead>
                                                <tbody id="monthlyDurationBody">
                                                        <tr>
                                                                <td colspan="12" class="text-center py-4 text-muted">กำลังโหลดข้อมูล...</td>
                                                        </tr>
                                                </tbody>
                                        </table>
                                </div>
                        </div>
                </div>

                <div id="pageLoader" style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(255,255,255,0.8); z-index:9999; display:flex; justify-content:center; align-items:center;">
                        <div class="spinner-border text-primary"></div>
                </div>

                <div id="context-menu" class="dropdown-menu" style="display:none; position:absolute; z-index:10000; box-shadow: 0 4px 10px rgba(0,0,0,0.2);">
                        <a class="dropdown-item cursor-pointer" id="menu-view-detail">
                                <i class="bi bi-search mr-2 text-primary"></i> ดูรายละเอียดรายการนี้
                        </a>
                        <a class="dropdown-item cursor-pointer text-danger" id="menu-show-sql">
                                <i class="bi bi-code-slash mr-2"></i> Show SQL (Admin)
                        </a>
                        <div class="dropdown-divider"></div>
                        <a class="dropdown-item text-muted small" href="javascript:void(0)">ยกเลิก</a>
                </div>

                <div id="context-menu-modal" class="dropdown-menu" style="display:none; position:absolute; z-index:10000; box-shadow: 0 4px 10px rgba(0,0,0,0.2);">
                        <a class="dropdown-item cursor-pointer text-danger" id="menu-modal-show-sql">
                                <i class="bi bi-code-slash mr-2"></i> Show SQL (Detailed)
                        </a>
                        <div class="dropdown-divider"></div>
                        <a class="dropdown-item text-muted small" href="javascript:void(0)">ยกเลิก</a>
                </div>

        </div>

        <script src="../lib/xlsx.full.min.js"></script>
        <script src="../js/Report_StatusReply.js?v=<?= time(); ?>"></script>

        <!-- Staff Group Assign Modal -->
        <div class="modal fade" id="groupModal" tabindex="-1" role="dialog" aria-hidden="true">
                <div class="modal-dialog modal-lg modal-dialog-centered" role="document">
                        <div class="modal-content border-0 shadow-lg">
                                <div class="modal-header modal-header-dark border-0 align-items-center">
                                        <div class="modal-title-wrap">
                                                <!-- <span class="modal-title-icon"><i class="bi bi-people-fill"></i></span> -->
                                                <div>
                                                        <h5 class="modal-title font-weight-bold">จัดกลุ่มและเปลี่ยนสายงานเจ้าหน้าที่</h5>
                                                        <div class="modal-subtitle">กำหนดว่าเจ้าหน้าที่แต่ละคนสังกัดสายงานใด</div>
                                                </div>
                                        </div>
                                        <button type="button" class="close text-white" data-dismiss="modal" aria-label="Close" style="font-size: 1.5rem;">
                                                <span aria-hidden="true">&times;</span>
                                        </button>
                                </div>
                                <div class="modal-body p-4">
                                        <div class="modal-hint">
                                                <i class="bi bi-info-circle-fill"></i>
                                                <div>ย้ายเจ้าหน้าที่ระหว่างสายงาน 1 / สายงาน 2 / อื่นๆ ได้โดยแตะปุ่มด้านขวาของแต่ละรายชื่อ ระบบจะคำนวณและวาดข้อมูลในหน้ารายงานให้ใหม่ทันทีหลังกดปิด</div>
                                        </div>

                                        <div class="group-summary">
                                                <div class="group-summary-chip g1">
                                                        <span class="label">สายงาน 1</span>
                                                        <span class="count" id="sumCountG1">0</span>
                                                </div>
                                                <div class="group-summary-chip g2">
                                                        <span class="label">สายงาน 2</span>
                                                        <span class="count" id="sumCountG2">0</span>
                                                </div>
                                                <div class="group-summary-chip other">
                                                        <span class="label">อื่นๆ</span>
                                                        <span class="count" id="sumCountOther">0</span>
                                                </div>
                                        </div>

                                        <div class="group-search-wrap">
                                                <i class="bi bi-search"></i>
                                                <input type="text" class="form-control" id="staffGroupSearch" placeholder="ค้นหาชื่อเจ้าหน้าที่...">
                                        </div>

                                        <div class="staff-group-list" id="staffGroupList">
                                                <!-- JS render -->
                                        </div>
                                </div>
                                <div class="modal-footer bg-light border-0 py-2">
                                        <span class="footer-note"><i class="bi bi-shield-check"></i> บันทึกอัตโนมัติในเบราว์เซอร์นี้</span>
                                        <button type="button" class="btn btn-primary btn-sm px-4" id="btnCloseGroupModal">ปิดและเสร็จสิ้น</button>
                                </div>
                        </div>
                </div>
        </div>

        <!-- Detail Modal -->
        <div class="modal fade" id="detailModal" tabindex="-1" role="dialog" aria-hidden="true">
                <div class="modal-dialog modal-xxl modal-dialog-centered" role="document">
                        <div class="modal-content border-0 shadow-lg">
                                <div class="modal-header bg-light border-0 align-items-center">
                                        <div>
                                                <h5 class="modal-title font-weight-bold text-dark mb-1" id="modalTitle">รายละเอียดข้อมูล</h5>
                                                <p class="text-muted mb-0 small" id="modalSubtitle">Loading...</p>
                                        </div>
                                        <div class="d-flex align-items-center">
                                                <button class="btn btn-outline-success btn-sm rounded-pill mr-3" id="btnExportModal">
                                                        <i class="fas fa-file-excel mr-1"></i> Export Excel
                                                </button>
                                                <button type="button" class="close text-muted" data-dismiss="modal" aria-label="Close" style="font-size: 1.5rem; opacity: 0.7;">
                                                        <span aria-hidden="true">&times;</span>
                                                </button>
                                        </div>
                                </div>
                                <div class="modal-body p-0">
                                        <!-- Search & Filter Bar inside Modal (Optional, purely based on Image 3 which seems to have a clean header) -->
                                        <!-- If needed we can add a search bar here, but Image 3 doesn't explicitly show one, 
                                             however `Report_StatusReplyDetail.php` had one. I'll add a small one. -->
                                        <div class="p-3 bg-white border-bottom d-flex justify-content-between align-items-center">
                                                <div class="input-group input-group-sm" style="width: 250px;">
                                                        <div class="input-group-prepend">
                                                                <span class="input-group-text bg-transparent border-right-0"><i class="fas fa-search text-muted"></i></span>
                                                        </div>
                                                        <input type="text" class="form-control border-left-0" id="modalSearchInput" placeholder="ค้นหา...">
                                                </div>
                                                <div id="modalSummaryStats" class="small text-muted">
                                                        <!-- Dynamic Stats -->
                                                </div>
                                        </div>

                                        <div class="table-responsive" style="max-height: 60vh;">
                                                <table class="table table-hover table-striped mb-0" id="modalTable">
                                                        <thead class="thead-light">
                                                                <tr>
                                                                        <th class="sticky-top">#</th>
                                                                        <th class="sticky-top">เลขที่ตรวจรับ</th>
                                                                        <th class="sticky-top">เลขที่ส่งเบิก</th>
                                                                        <th class="sticky-top" style="min-width:200px;">รายการ</th>
                                                                        <th class="sticky-top text-right" style="min-width:120px;">จำนวนเงิน</th>
                                                                        <th class="sticky-top">เจ้าหนี้/บริษัท</th>
                                                                        <th class="sticky-top" style="min-width:100px;">วันที่ส่งมอบ</th>
                                                                        <th class="sticky-top" style="min-width:100px;">วันที่ตรวจรับ</th>
                                                                        <th class="sticky-top" style="min-width:100px;">วันที่สร้างใบเบิก</th>
                                                                        <th class="sticky-top" style="min-width:100px;">วันที่รับใบขอเบิก</th>
                                                                        <th class="sticky-top text-center" style="font-size:0.8rem;">ระยะเวลา<br>(ส่งมอบ-ตรวจรับ)</th>
                                                                        <th class="sticky-top text-center" style="font-size:0.8rem;">ระยะเวลา<br>(ตรวจรับ-ส่งเบิก)</th>
                                                                        <th class="sticky-top text-center" style="font-size:0.8rem;">ระยะเวลา<br>(ส่งเบิก-รับใบขอเบิก)</th>
                                                                        <th class="sticky-top">ผู้ส่งเบิก</th>
                                                                        <th class="sticky-top">จนท.ทักท้วง</th>
                                                                        <th class="sticky-top text-center">สถานะ</th>
                                                                        <th class="sticky-top" style="min-width:100px;">วันที่ทักท้วง</th>
                                                                        <th class="sticky-top">ข้อความทักท้วง</th>
                                                                </tr>
                                                        </thead>
                                                        <tbody id="modalTableBody">
                                                                <!-- JS will populate -->
                                                        </tbody>
                                                </table>
                                        </div>

                                        <div id="modalLoader" class="d-none justify-content-center align-items-center py-5">
                                                <div class="spinner-border text-primary" role="status">
                                                        <span class="sr-only">Loading...</span>
                                                </div>
                                        </div>
                                </div>
                                <div class="modal-footer bg-light border-0 py-2">
                                        <small class="text-muted mr-auto" id="modalFooterInfo"></small>
                                        <button type="button" class="btn btn-secondary btn-sm" data-dismiss="modal">ปิด</button>
                                </div>
                        </div>
                </div>
        </div>

        <!-- MoM Trend Detail Modal -->
        <div class="modal fade" id="momDetailModal" tabindex="-1" role="dialog" aria-hidden="true">
                <div class="modal-dialog modal-xl modal-dialog-centered" role="document">
                        <div class="modal-content border-0 shadow-lg">
                                <div class="modal-header mom-modal-header border-0 align-items-center">
                                        <h5 class="modal-title font-weight-bold mb-0" id="momModalTitle">
                                                <i class="fas fa-list-ul mr-2"></i>รายการ
                                        </h5>
                                        <button type="button" class="close text-white" data-dismiss="modal" aria-label="Close">
                                                <span aria-hidden="true">&times;</span>
                                        </button>
                                </div>
                                <div class="modal-body p-0">
                                        <div style="max-height: 65vh; overflow-y: auto; overflow-x: hidden;">
                                                <table class="table table-hover mb-0" id="momModalTable">
                                                        <thead class="thead-light">
                                                                <tr>
                                                                        <th class="sticky-top" style="width:13%;">ตรวจรับ</th>
                                                                        <th class="sticky-top" style="width:14%;">สัญญา</th>
                                                                        <th class="sticky-top" style="width:10%;">ใบเบิก</th>
                                                                        <th class="sticky-top" style="width:10%;">ผู้ทำเบิก</th>
                                                                        <th class="sticky-top" style="width:13%;">ผู้รับจ้าง/คู่ค้า</th>
                                                                        <th class="sticky-top text-center" style="width:9%;">วันที่ส่งเบิก</th>
                                                                        <th class="sticky-top text-center" style="width:10%;">สถานะ</th>
                                                                        <th class="sticky-top" style="width:21%;">เหตุผลทักท้วง / รายละเอียด</th>
                                                                </tr>
                                                        </thead>
                                                        <tbody id="momModalBody">
                                                                <!-- JS render -->
                                                        </tbody>
                                                </table>
                                        </div>
                                        <div id="momModalLoader" class="d-none justify-content-center align-items-center py-5">
                                                <div class="spinner-border text-primary" role="status">
                                                        <span class="sr-only">Loading...</span>
                                                </div>
                                        </div>
                                </div>
                                <div class="modal-footer bg-light border-0 py-2">
                                        <small class="text-muted mr-auto" id="momModalFooterInfo"></small>
                                        <button type="button" class="btn btn-secondary btn-sm" data-dismiss="modal">ปิดหน้าต่าง</button>
                                </div>
                        </div>
                </div>
        </div>

        <!-- Monthly Duration Summary Detail Modal (คลิกที่ตัวเลขในตารางสรุประยะเวลาดำเนินการรายเดือน) -->
        <div class="modal fade" id="monthlyDurationDetailModal" tabindex="-1" role="dialog" aria-hidden="true">
                <div class="modal-dialog modal-xl modal-dialog-centered" role="document">
                        <div class="modal-content border-0 shadow-lg">
                                <div class="modal-header mom-modal-header border-0 align-items-center">
                                        <h5 class="modal-title font-weight-bold mb-0" id="durationModalTitle">
                                                <i class="fas fa-list-ul mr-2"></i>รายการ
                                        </h5>
                                        <button type="button" class="close text-white" data-dismiss="modal" aria-label="Close">
                                                <span aria-hidden="true">&times;</span>
                                        </button>
                                </div>
                                <div class="modal-body p-0">
                                        <div style="max-height: 65vh; overflow-y: auto; overflow-x: hidden;">
                                                <table class="table table-hover mb-0" id="durationModalTable">
                                                        <thead class="thead-light">
                                                                <tr>
                                                                        <th class="sticky-top text-center">ลำดับ</th>
                                                                        <th class="sticky-top">เลขที่ตรวจรับ</th>
                                                                        <th class="sticky-top">สัญญา</th>
                                                                        <th class="sticky-top">ใบเบิก</th>
                                                                        <th class="sticky-top">ผู้ทำรายการเบิก</th>
                                                                        <th class="sticky-top">บริษัทคู่ค้า/ผู้รับจ้าง</th>
                                                                        <th class="sticky-top text-center">วันที่ตรวจรับ</th>
                                                                        <th class="sticky-top text-center">วันที่จัดทำใบขอเบิก</th>
                                                                        <th class="sticky-top text-center">วันที่รับใบขอเบิก (คลัง)</th>
                                                                        <th class="sticky-top text-center">จำนวนวัน</th>
                                                                </tr>
                                                        </thead>
                                                        <tbody id="durationModalBody">
                                                                <!-- JS render -->
                                                        </tbody>
                                                </table>
                                        </div>
                                        <div id="durationModalLoader" class="d-none justify-content-center align-items-center py-5">
                                                <div class="spinner-border text-primary" role="status">
                                                        <span class="sr-only">Loading...</span>
                                                </div>
                                        </div>
                                </div>
                                <div class="modal-footer bg-light border-0 py-2">
                                        <small class="text-muted mr-auto" id="durationModalFooterInfo"></small>
                                        <button type="button" class="btn btn-secondary btn-sm" data-dismiss="modal">ปิดหน้าต่าง</button>
                                </div>
                        </div>
                </div>
        </div>

        <!-- Weekly Reason Analysis Modal -->
        <div class="modal fade" id="weekReasonModal" tabindex="-1" role="dialog" aria-hidden="true">
                <div class="modal-dialog modal-xl modal-dialog-centered" role="document">
                        <div class="modal-content border-0 shadow-lg">
                                <div class="modal-header mom-modal-header border-0 align-items-center">
                                        <h5 class="modal-title font-weight-bold mb-0" id="weekReasonModalTitle">
                                                <i class="fas fa-magic mr-2"></i>วิเคราะห์ประเภทเอกสารและเหตุผลที่ถูกทักท้วงสูงสุด
                                        </h5>
                                        <button type="button" class="close text-white" data-dismiss="modal" aria-label="Close">
                                                <span aria-hidden="true">&times;</span>
                                        </button>
                                </div>
                                <div class="modal-body p-3">
                                        <div id="weekTopDefectWrap" class="top-defect-card d-none">
                                                <div class="top-defect-header"><i class="fas fa-award mr-2"></i>5 อันดับข้อบกพร่องยอดฮิตในประเภทเอกสารและใบส่งมอบสัปดาห์นี้</div>
                                                <div id="weekTopDefectBody"></div>
                                        </div>

                                        <div class="reason-registry-header"><i class="fas fa-list-ul mr-2"></i>ทะเบียนรายการใบเบิกคลังที่พบจุดทักท้วงในสัปดาห์ปัจจุบัน</div>

                                        <div id="weekReasonTableWrap" class="d-none">
                                                <div class="table-responsive" style="max-height: 45vh;">
                                                        <table class="table table-hover mb-0" id="weekReasonTable">
                                                                <thead class="thead-light">
                                                                        <tr>
                                                                                <th class="sticky-top" style="width:13%;">ตรวจรับ</th>
                                                                                <th class="sticky-top" style="width:14%;">สัญญา</th>
                                                                                <th class="sticky-top" style="width:10%;">ใบเบิก</th>
                                                                                <th class="sticky-top" style="width:10%;">ผู้ทำเบิก</th>
                                                                                <th class="sticky-top" style="width:13%;">ผู้รับจ้าง/คู่ค้า</th>
                                                                                <th class="sticky-top text-center" style="width:9%;">วันที่ส่งเบิก</th>
                                                                                <th class="sticky-top text-center" style="width:10%;">สถานะ</th>
                                                                                <th class="sticky-top" style="width:21%;">เหตุผลทักท้วง / รายละเอียด</th>
                                                                        </tr>
                                                                </thead>
                                                                <tbody id="weekReasonBody">
                                                                        <!-- JS render -->
                                                                </tbody>
                                                        </table>
                                                </div>
                                        </div>
                                        <div id="weekReasonLoader" class="d-none justify-content-center align-items-center py-5">
                                                <div class="spinner-border text-primary" role="status">
                                                        <span class="sr-only">Loading...</span>
                                                </div>
                                        </div>
                                </div>
                                <div class="modal-footer bg-light border-0 py-2">
                                        <small class="text-muted mr-auto" id="weekReasonFooterInfo"></small>
                                        <button type="button" class="btn btn-secondary btn-sm" data-dismiss="modal">ปิดหน้าต่าง</button>
                                </div>
                        </div>
                </div>
        </div>

        <style>
                /* ป้องกันหน้าเว็บเลื่อน/ขยับซ้าย-ขวา เมื่อเปิด-ปิด modal ซ้ำๆ (เช่น กดตัวเลขใน Heatmap หลายครั้งติดกัน)
                   Bootstrap จะ set inline padding-right ให้ <body> เพื่อชดเชยสกอบราที่หายไป แต่บางครั้งค่านี้ค้างอยู่ไม่ถูกล้างออก
                   จึงบังคับให้เป็น 0 เสมอด้วย !important เพื่อตัดปัญหาการขยับตำแหน่งถาวร */
                body.modal-open {
                        padding-right: 0 !important;
                }

                /* Modal Specific Styles */
                .modal-xxl {
                        max-width: 95vw;
                        /* Wider than xl */
                }

                .modal-content {
                        border-radius: 12px;
                        overflow: hidden;
                }

                .modal-header {
                        /* background: linear-gradient(to right, #f8f9fa, #e9ecef); */
                        padding: 1rem 1.5rem;
                }

                #modalTable thead th {
                        background-color: #007bff;
                        /* Primary Blue from theme */
                        border: none;
                        color: #fff;
                        font-weight: 500;
                        font-size: 0.95rem;
                        white-space: nowrap;
                        padding: 12px 10px;
                        vertical-align: middle;
                }

                #modalTable tbody td {
                        font-size: 0.9rem;
                        vertical-align: middle;
                        padding: 10px;
                        color: #333;
                }

                #modalTable tbody tr:hover {
                        background-color: #f1f8ff;
                }

                .sticky-top {
                        position: sticky;
                        top: 0;
                        z-index: 1020;
                }

                .table-responsive {
                        background-color: #fff;
                }

                /* Custom Scrollbar for modal table */
                .table-responsive::-webkit-scrollbar {
                        width: 8px;
                        height: 8px;
                }

                .table-responsive::-webkit-scrollbar-track {
                        background: #f1f1f1;
                }

                .table-responsive::-webkit-scrollbar-thumb {
                        background: #bbb;
                        border-radius: 4px;
                }

                .table-responsive::-webkit-scrollbar-thumb:hover {
                        background: #999;
                }
        </style>
</body>

</html>