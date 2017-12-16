/*global $, jQuery, alert,
    lastLeafId:true,
    fullLeafId:true,
    leavesCount:true,
    createLeafFrom,
    resumeLeafStyle,
    closeLeave,
    setNotification,
    serverPostNewLeaf,
    serverPostAddLeaves
*/

$(document).ready(function () {
    'use strict';

    var cHour, left1;
    cHour = (new Date()).getHours();

    $("#back").css("opacity", 1 - Math.abs(cHour - 12) / 12);

    left1 = 80 * (18 - cHour) / 12 - 10;
    if (left1 > 70) {
        left1 = 70;
    }
    $("#sun").css("left", left1 + "vw");
    $("#sun").css("top", Math.abs(cHour - 12) / 12 * 30 + "vh");
    $("#sun").css("opacity", 1.1 - Math.abs(cHour - 12) / 6);
    $("#sun").fadeIn();

    cHour = cHour + 12;
    if (cHour > 24) {
        cHour -= 24;
    }
    left1 = 80 * (18 - cHour) / 12 - 10;
    if (left1 > 70) {
        left1 = 70;
    }
    $("#moon").css("left", left1 + "vw");
    $("#moon").css("top", Math.abs(cHour - 12) / 12 * 30 + "vh");
    $("#moon").css("opacity", 1.1 - Math.abs(cHour - 12) / 6);
    $("#moon").fadeIn();

    $("#sendbox").click(function () {
        if ($(this).hasClass("sending")) {
            return;
        }
        if (!($(this).hasClass("expandbox")) && $(this).css("opacity") === "1") {
            $(this).addClass("expandbox");
            var color = parseInt(Math.random() * 8, 10) + 1;
            $("#sendleaf .shape_heart").removeClass("color01 color02 color03 color04 color05 color06 color07 color08 ").addClass("color0" + color);
            $("#sendleaf").attr("color", color);
            $("#send_text").focus();
        }
        $("#sendleaf").css("opacity", "1");
        if (!($("#sendleaf").hasClass("expandbox"))) {
            $("#sendleaf").addClass("expandbox");
        }
        if (!($("#sendbuttons").hasClass("expandbox"))) {
            $("#sendbuttons").addClass("expandbox");
        }
    });

    $(".button_like").click(function () {});

    $("#button_cancel").click(function () {
        if ($("#sendbox").hasClass("expandbox")) {
            $("#sendbox").removeClass("expandbox");
        }
        if ($("#sendleaf").hasClass("expandbox")) {
            $("#sendleaf").removeClass("expandbox");
        }
        if ($("#sendbuttons").hasClass("expandbox")) {
            $("#sendbuttons").removeClass("expandbox");
        }
    });

    $("#button_submit").click(function () {
        var color, text, name;
        color = $("#sendleaf").attr("color");
        text = $("#send_text").val();
        name = $("#send_name").val();
        if (text.length === 0 || text.length > 70) {
            $("#send_text").focus();
            $("#send_text").css("box-shadow", "0 0 30px rgba(250, 100, 100, 1) inset");
        } else if (name.length === 0 || name.length > 8) {
            $("#send_name").focus();
            $("#send_name").css("box-shadow", "0 0 30px rgba(250, 100, 100, 1) inset");
        } else {
            $("#sendbox").addClass("sending");

            text = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/(?:\r\n|\r|\n)/g, '<br />');
            name = name.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

            createLeafFrom(leavesCount, text, name, 0, ($("body").scrollTop() + $(window).height() * 0.96) - $(window).width() * 0.8, 0, color);
            resumeLeafStyle(leavesCount);

            serverPostNewLeaf(text, name, color);

            $("#sendleaf").css("opacity", "0");
            if ($("#sendbox").hasClass("expandbox")) {
                $("#sendbox").removeClass("expandbox");
            }
            if ($("#sendleaf").hasClass("expandbox")) {
                $("#sendleaf").removeClass("expandbox");
            }
            if ($("#sendbuttons").hasClass("expandbox")) {
                $("#sendbuttons").removeClass("expandbox");
            }
        }
    });

    $("#send_name").bind("keypress", {}, function (e) {
        var code = e.KeyCode || e.which;
        if (code === 13) {
            $("#button_submit").click();
        }
    });

    $("#tree").click(function () {
        closeLeave();
    });

    $("#back").click(function () {
        closeLeave();
    });

    $(window).scroll(function () {
        if ($(this).scrollTop() + $(this).height() > $("body").height() - 42) {
            if (!$("#sendbox").hasClass("sending")) {
                serverPostAddLeaves(10);
            }
        }
    });
});