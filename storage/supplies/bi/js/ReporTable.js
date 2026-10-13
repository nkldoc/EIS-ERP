	$("#tableSearch").on("keyup", function() {
			let value = $(this).val().toLowerCase();
			$("table tbody tr").filter(function() {
				$(this).toggle($(this).text().toLowerCase().indexOf(value) > -1);
			});
		});
		$("#toggleCol").on("change", function() {
			let colIndex = 3;
			$("table tr").each(function() {
				$(this).find("td:eq(" + colIndex + "), th:eq(" + colIndex + ")").toggle();
			});
		});
		let expanded = false;

		// document.getElementById("toggleAllBtn").addEventListener("click", function() {
		// 	const allDetails = document.querySelectorAll(".expandable-content");
		// 	const isAnyOpen = [...allDetails].some(e => e.classList.contains("show"));

		// 	allDetails.forEach(e => {
		// 		if (isAnyOpen) {
		// 			e.classList.remove("show");
		// 		} else {
		// 			e.classList.add("show");
		// 		}
		// 	});

		// 	this.textContent = isAnyOpen ? "เปิดทั้งหมด" : "ปิดทั้งหมด";
		// });

		let count = $('#myTable tbody tr:visible').length;
		$('#rowCount').text(`แสดงทั้งหมด ${count} รายการ`);

		function Po_OpenPdf(file_id, file_name) {
      console.log(file_id)
      console.log(file_name)
      // console.log(Ext.part_file_pdf)
			file_name = file_name.replaceAll("/", "-");
			var today = new Date();
			var dd = String(today.getDate()).padStart(2, "0");
			var mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
			var yyyy = today.getFullYear();
			today = yyyy + "-" + mm + "-" + dd;
			var tap_random = "Tap_" + Math.floor(Math.random() * 100000);
			if (file_id.indexOf("hdr") > 0) {
				file_name = file_name + "_" + "เอกสารใบเบิก_" + today;
			} else if (file_id.indexOf("dtl") > 0) {
				file_name = file_name + "_" + "เอกสารประกอบใบเบิก_" + today;
			} else if (file_id.indexOf("pay") > 0) {
				file_name = file_name + "_" + "เอกสารการจ่ายเงิน_" + today;
			} else if (file_id.indexOf("all") > 0) {
				file_name = file_name + "_" + "เอกสาร_" + today;
			}

			function enc(str) {
				var encoded = "";
				for (i = 0; i < str.length; i++) {
					var a = str.charCodeAt(i);
					var b = a ^ 123; // bitwise XOR with any number, e.g. 123
					encoded = encoded + String.fromCharCode(b);
				}
				return encoded;
			}
			// var Url = "http://" + location.host + "/nmu/po/api/PDF_View.php/" + file_name + ".pdf?code_F=" + enc(file_id.slice(0, -4)) + "&file_name=" + file_name;
			// window.open(Url);
			// return;
			var mapForm = document.createElement("form");
			mapForm.target = tap_random;
			mapForm.method = "GET"; //GET & POST
			mapForm.action = "https://eis.vajira.ac.th/NMU_EIS/po/api/PDF_View.php/" + file_name + ".pdf?T=" + tap_random;

			var mapInput = document.createElement("input");
			mapInput.type = "text";
			mapInput.name = "code_F";
			mapInput.value = enc(file_id.slice(0, -4));
			mapForm.appendChild(mapInput);

			var mapInput2 = document.createElement("input");
			mapInput2.type = "text";
			mapInput2.name = "file_name";
			mapInput2.value = file_name;
			mapForm.appendChild(mapInput2);

			var mapInput3 = document.createElement("input");
			mapInput3.type = "text";
			mapInput3.name = "T";
			mapInput3.value = tap_random;
			mapForm.appendChild(mapInput3);

			document.body.appendChild(mapForm);
			map = window.open("", tap_random);
			if (map) {
				mapForm.submit();
			} else {
				alert("ไฟล์ PDF มีปัญหา");
			}
		}
		// $("#filterStatus").on("change", function() {
		// 	// console.log($(this));
		// 	let value = $(this).val();
		// 	$("table tbody tr").each(function() {
		// 		const match = $(this).text().indexOf(value) > -1;
		// 		// console.log(match);
		// 		$(this).toggle(!value || match);
		// 	});
		// });