var session_out = false;
/************detect if a browser window active*************/
var hidden = "hidden";
// Standards:
if (hidden in document) document.addEventListener("visibilitychange", onchange);
else if ((hidden = "mozHidden") in document) document.addEventListener("mozvisibilitychange", onchange);
else if ((hidden = "webkitHidden") in document) document.addEventListener("webkitvisibilitychange", onchange);
else if ((hidden = "msHidden") in document) document.addEventListener("msvisibilitychange", onchange);
// IE 9 and lower:
else if ("onfocusin" in document) document.onfocusin = document.onfocusout = onchange;
// All others:
else window.onpageshow = window.onpagehide = window.onfocus = window.onblur = onchange;
/**********************************************************/
function onchange(evt) {
  var status = document.visibilityState === "visible" ? "focus" : "blur";
  if (status === "focus") {
    $.post("session_info.php", {}, function (response, status) {
      var obj = $.parseJSON(Ext.Text_Decode(response));
      if (obj.debug) {
        session_info = obj.data;
        user_id = session_info.user_id == undefined ? 0 : session_info.user_id;
        if (user_id > 0) {
          location.href = "http://" + location.host + "/nmu_eis/";
        } else {
          if (!session_out) {
            console.log('session_out');
            session_out = true;
          }
        }
      }
    });
  } else if (status === "blur") {
  }
}
