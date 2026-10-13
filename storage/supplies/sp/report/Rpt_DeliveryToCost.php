<?php
//include("../api/List_RepStatisticDetail.php");
include("../../lib/export/exportUtil.php");
if ($_REQUEST["action"] == "excel") {
    $export = new exportUtil();
    $caption = "รายงานโครงการ";
    $export->headerExcel($caption);
    
    
}
?>
<!DOCTYPE html>
<html lang="th">
    <head>
        <meta charset="UTF-8">
        <title>รายงานโครงการ</title>
        <style>
            table {
                border-collapse: collapse;
                width: 100%;
                font-size: 14px;
            }
            th, td {
                border: 1px solid #ccc;
                padding: 6px;
                text-align: right;
            }
            th {
                background: #e0f0ff;
            }
            td:first-child, th:first-child {
                text-align: left;
            }
            tr.selected {
                background: #ffd966;
            }
            tfoot td {
                font-weight: bold;
                background: #d9ead3;
            }
        </style>
    </head>
    <body>
        <h2>รายงานโครงการ</h2>
        <table id="reportTable">
            <thead>
                <tr>
                    <th>หน่วยงาน</th>
                    <th>ปี 65</th>
                    <th>ปี 66</th>
                    <th>ปี 67</th>
                    <th>ปี 68</th>
                    <th>PO Lot1</th>
                    <th>PO Lot2</th>
                    <th>PO Lot3</th>
                    <th>PO Lot4</th>
                    <th>PO Lot5</th>
                    <th>PO Lot6</th>
                    <th>PO Lot7</th>
                    <th>PO Lot8</th>
                    <th>PO Lot9</th>
                    <th>PO Lot10</th>
                    <th>PO Lot11</th>
                    <th>PO Lot12</th>
                    <th>PO Lot13</th>
                    <th>คงเหลือ65</th>
                    <th>คงเหลือ66</th>
                    <th>คงเหลือ67</th>
                    <th>คงเหลือ68</th>
                    <th>ยอดรวมคงเหลือ</th>
                    <th>ยอดเงินที่เข้าไปทั้งหมด</th>
                </tr>
            </thead>
            <tbody></tbody>
            <tfoot>
                <tr id="summaryRow">
                    <td>รวม</td>
                    <!-- summary จะเติมด้วย JS -->
                </tr>
            </tfoot>
        </table>

        <script>
            function formatCurrency(num) {
                return num.toLocaleString("th-TH", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                });
            }
            async function loadReport() {
                const res = await fetch("Rpt_DeliveryToCostData.php");
                const data = await res.json();
                const tbody = document.querySelector("#reportTable tbody");
                const summaryRow = document.querySelector("#summaryRow");

                // ตัวเก็บผลรวม
                let sumBudget65 = 0, sumBudget66 = 0, sumBudget67 = 0, sumBudget68 = 0;
                let sumPO = Array(13).fill(0);
                let sumRemain = Array(4).fill(0);
                let sumTotalRemain = 0, sumTotal = 0;

                data.forEach(row => {
                    const tr = document.createElement("tr");

                    tr.innerHTML = `
          <td>${row.unit}</td>
          <td>${formatCurrency(row.budget65)}</td>
          <td>${formatCurrency(row.budget66)}</td>
          <td>${formatCurrency(row.budget67)}</td>
          <td>${formatCurrency(row.budget68)}</td>
          ${row.po.map(v => `<td>${v ? formatCurrency(v) : "-"}</td>`).join("")}
          ${row.remain.map(v => `<td>${v ? formatCurrency(v) : "-"}</td>`).join("")}
          <td>${formatCurrency(row.sum)}</td>
          <td>${formatCurrency(row.total)}</td>
        `;

                    // Select row event
                    tr.addEventListener("click", () => {
                        document.querySelectorAll("tbody tr").forEach(r => r.classList.remove("selected"));
                        tr.classList.add("selected");
                    });

                    tbody.appendChild(tr);

                    // รวมค่า
                    sumBudget65 += row.budget65;
                    sumBudget66 += row.budget66;
                    sumBudget67 += row.budget67;
                    sumBudget68 += row.budget68;
                    row.po.forEach((v, i) => sumPO[i] += v);
                    row.remain.forEach((v, i) => sumRemain[i] += v);
                    sumTotalRemain += row.sum;
                    sumTotal += row.total;
                });

                // เติม summary row
                summaryRow.innerHTML = `
          <td>รวม</td>
          <td>${formatCurrency(sumBudget65)}</td>
          <td>${formatCurrency(sumBudget66)}</td>
          <td>${formatCurrency(sumBudget67)}</td>
          <td>${formatCurrency(sumBudget68)}</td>
          ${sumPO.map(v => `<td>${v ? formatCurrency(v) : "-"}</td>`).join("")}
          ${sumRemain.map(v => `<td>${v ? formatCurrency(v) : "-"}</td>`).join("")}
          <td>${formatCurrency(sumTotalRemain)}</td>
          <td>${formatCurrency(sumTotal)}</td>
        `;
            }
            loadReport();
        </script>
    </body>
</html>

