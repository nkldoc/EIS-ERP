var script1 = document.createElement("script");
var script2 = document.createElement("script");
var script3 = document.createElement("script");

script1.src = "../../js/ext-3.4.0/adapter/jquery/ext-jquery-adapter.js";
script2.src = "../../js/ext-3.4.0/ext-all-debug.js";
script3.src = "../../js/Ext.ux.util.js";

document.getElementsByTagName("head")[0].appendChild(script1);
script1.onload = function() {
  document.getElementsByTagName("head")[0].appendChild(script2);
};
script2.onload = function() {
  document.getElementsByTagName("head")[0].appendChild(script3);
};
script3.onload = function() {
  let items = [];
  let arr = [];
  $(".table_report > thead > tr > th").each(function(e) {
    items.push({
      text: $(this).text(),
      checked: true,
      handler: function(item) {
        checked(item, e);
      }
      // checked: (jQuery.inArray(2, arr) !== -1) ? true : false
    });
  });

  const checked = function(item, val) {
    if (item.checked == true) {
      // ซ่อนคอลัม
      if (jQuery.inArray(val, arr) !== -1) {
        arr.splice($.inArray(val, arr), 1);
      }
    } else {
      // แสดงคอลัม
      arr.push(val);
    }
    let hidden = jQuery.inArray(val, arr) !== -1 ? false : true;
    $(".table_report > thead > tr > th:eq(" + val + ")").prop("hidden", hidden);
    $(".table_report > tbody > tr").each(function(i) {
      let colChildren = 0;
      let oneChk = false;
      $(this)
        .children()
        .each(function(ii) {
          colChildren += $(this).attr("colspanall") === undefined ? 1 : parseInt($(this).attr("colspanall"));
          if (val + 1 <= colChildren && oneChk == false) {
            if ($(this).attr("colspanall") === undefined) {
              $(this).prop("hidden", hidden);
            } else {
              let colspan = parseInt($(this).attr("colspan"));
              let col = hidden ? colspan - 1 : colspan + 1;
              $(this).attr("colspan", col);

              if (col == 0) {
                $(this).prop("hidden", true);
              } else {
                $(this).prop("hidden", false);
              }
            }
            oneChk = true;
          }
        });
    });
  };
  let menu = new Ext.menu.Menu({
    id: "menu",
    items: items,
    listeners: {
      afterrender: function(button) {
        button.el.on("contextmenu", function(e) {
          e.stopEvent();
        });
      },
      click: function(me, i, e, eOpts) {
        e.stopEvent();
      }
    }
  });
  $("html").on("contextmenu", function(e) {
    if (e.ctrlKey == true) {
      Ext.EventObject.stopEvent();
      menu.showAt(Ext.EventObject.getXY());
      e.preventDefault();
      e.stopPropagation();
    }
  });
};

$(window).on("load", function() {
  /* freeze table head */
  $(".table_report")
    .find("thead tr th")
    .addClass("class-sticky");
});
/* active row table */
$(".table_report > tbody > tr").click(function() {
  $(".table_report > tbody > tr").removeClass("active");
  $(this).addClass("active");
});
let th = $(".table_report thead");
for (var i = 0; i < th.length; i++) {
  var tableHeaderTop = th[i].getBoundingClientRect().top;
  var ths = $(th[i]).find("th");
  for (var ii = 0; ii < ths.length; ii++) {
    var thd = ths[ii];
    thd.style.top = thd.getBoundingClientRect().top - tableHeaderTop + "px";
  }
}
