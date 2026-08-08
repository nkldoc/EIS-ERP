$(document).ready(function() {
  let socket = io("http://" + Ext.getInfo.serverName + ":3000");

  socket.emit("onOpen", JSON.stringify({}));

  socket.on("onMessage", function(msg) {
    let li = "";
    $(".div-online").empty();
    if (msg.success == true) {
      msg.data.forEach(element => {
        li +=
          "<li>" +
          "<div style='position: relative;'>" +
          "<div style='float:left;'>" +
          "<img src='images/ic-user.jpg'>" +
          "<div class='sp-status " +
          (element.status == 1 ? "sp-online" : "sp-offline") +
          "'></div>" +
          "<span class='sp-username'>" +
          element.title +
          " " +
          element.name +
          "</span>" +
          "<span class='sp-costname'>" +
          element.costname +
          "</span>" +
          "</div>" +
          "<div class='sp-position'>" +
          element.position +
          "</div>" +
          "<div style='clear:both;'></div>" +
          "</li>";
      });
      $(".div-online").html("<ul>" + li + "</ul>");
    }
  });

  socket.on("onAlertMsg", function(msg) {
    Ext.MessageBox.alert("แจ้งเตือน", msg.data);
  });
});
