/*global $, jQuery, alert,
    lastLeafId:true,
    fullLeafId:true,
    serverPostLike
*/

function addTree() {
    'use strict';
    $('<div class="tree_part"><div class="tree_part01shadow"></div><div class="tree_part02shadow"></div><div class="tree_part01"></div><div class="tree_part02"></div></div>').appendTo($("#tree_body"));
}

function closeLeave() {
    'use strict';
    var i, style;
    if (lastLeafId > -1) {
        $("#le_" + lastLeafId).css("z-index", 1);
    }
    if (fullLeafId > -1) {
        i = fullLeafId;
        if ($("#le_" + i).hasClass("fullshow")) {
            style = $("#le_" + i).attr("ostyle");
            $("#le_" + i).attr("style", style);
            $("#le_" + i).css("z-index", 999);
            $("#le_" + i).removeClass("fullshow");
            lastLeafId = fullLeafId;
        }
    }
}

function leaveOnClick(ele) {
    'use strict';
    var style, top, id, i, node;
    node = $(ele).parent().parent();
    if ($(node).hasClass("fullshow")) {
        if (lastLeafId > -1) {
            $("#le_" + lastLeafId).css("z-index", 1);
        }
        style = $(node).attr("ostyle");
        $(node).attr("style", style);
        $(node).css("z-index", 999);
        $(node).removeClass("fullshow");
        id = $(node).attr("sid");
        lastLeafId = id;
    } else {
        closeLeave();
        style = $(node).attr("style");
        top = ($(window).scrollTop() + 0.1 * $(window).height());
        $(node).attr("ostyle", style);
        style = "transform: translate(0, " + top + "px);-webkit-transform: translate(0, " + top + "px);";
        $(node).attr("style", style);
        $(node).css("z-index", 1000);
        $(node).addClass("fullshow");
        id = $(node).attr("sid");
        fullLeafId = id;
    }
}

function removeLeaf(id) {
    'use strict';
    if (fullLeafId === id) {
        closeLeave();
        fullLeafId = -1;
        lastLeafId = -1;
    }
    if (lastLeafId === id) {
        lastLeafId = -1;
    }
    $("#le_" + id).remove();
}

function setLeafUID(id, uid) {
    'use strict';
    $("#le_" + id).attr("uid", uid);
}

function createLeaf(id, uid, text, name, color, delay, islike) {
    'use strict';
    var left, top, angel, likestyle;
    top = id * 250;
    if (id % 4 === 0) {
        angel = 5;
        left = -500 + Math.tan(angel / 180 * Math.PI) * top;
    } else if (id % 4 === 1) {
        angel = -5;
        left = 500 + Math.tan(angel / 180 * Math.PI) * top;
    } else if (id % 4 === 2) {
        angel = 10;
        left = -1400 + Math.tan(angel / 180 * Math.PI) * top;
    } else if (id % 4 === 3) {
        angel = -10;
        left = 1400 + Math.tan(angel / 180 * Math.PI) * top;
    }
    if (islike === 1) {
        likestyle = "display:none;";
    } else {
        likestyle = "display:block;";
    }
    while (top / 5 - 200 > $("#tree_body").height()) {
        addTree();
    }
    $('<div class="leaf noselect" id="le_' + id + '" sid=' + id + ' uid=' + uid + ' style="' +
            'transform: scale(0.2) rotate(' + angel + 'deg) translate(' + left + 'px, ' + top + 'px);' +
            ' -webkit-transform: scale(0.2) rotate(' + angel + 'deg) translate(' + left + 'px, ' + top + 'px);" ostyle="">' +
            '<div class="leaf_main"><div class="leaf_back" onclick="leaveOnClick(this)">' +
            '<div class="shape_back shape_text"></div>' +
            '<div class="shape_heart shape_text color0' + color + '"></div></div>' +
            '<div class="leaf_info" onclick="leaveOnClick(this)"><div class="leaf_text">' + text +
            '</div><div class="leaf_name">' + name +
            '</div></div><div class="button_like" style="' + likestyle + '" onclick="likeOnClick(this)"></div></div></div>')
        .hide()
        .delay(delay)
        .fadeIn()
        .appendTo($("#leaves"));
}

function createLeafFrom(id, text, name, left, top, angel, color) {
    'use strict';
    $('<div class="leaf noselect" id="le_' + id + '" sid=' + id + ' uid=-1 style="' +
            'transform:rotate(' + angel + 'deg) translate(' + left + 'px, ' + top + 'px);' +
            '-webkit-transform:rotate(' + angel + 'deg) translate(' + left + 'px, ' + top + 'px);" ostyle="">' +
            '<div class="leaf_main"><div class="leaf_back" onclick="leaveOnClick(this)">' +
            '<div class="shape_back shape_text"></div>' +
            '<div class="shape_heart shape_text color0' + color + '"></div></div>' +
            '<div class="leaf_info" onclick="leaveOnClick(this)"><div class="leaf_text">' + text +
            '</div><div class="leaf_name">' + name +
            '</div></div><div class="button_like" onclick="likeOnClick(this)"></div></div></div>')
        .appendTo($("#leaves"));
}

function resumeLeafStyle(id) {
    'use strict';
    var style, left, top, angel;
    top = id * 250;
    if (id % 4 === 0) {
        angel = 5;
        left = -500 + Math.tan(angel / 180 * Math.PI) * top;
    } else if (id % 4 === 1) {
        angel = -5;
        left = 500 + Math.tan(angel / 180 * Math.PI) * top;
    } else if (id % 4 === 2) {
        angel = 10;
        left = -1400 + Math.tan(angel / 180 * Math.PI) * top;
    } else if (id % 4 === 3) {
        angel = -10;
        left = 1400 + Math.tan(angel / 180 * Math.PI) * top;
    }
    while (top / 5 - 200 > $("#tree_body").height()) {
        addTree();
    }
    style = "transform: scale(0.2) rotate(" + angel + "deg) translate(" + left + "px, " + top + "px);-webkit-transform: scale(0.2) rotate(" + angel + "deg) translate(" + left + "px, " + top + "px);";
    $("#le_" + id).attr("style", style);
    $("#le_" + id).children().css("opacity", ".7");
}

function textChange() {
    'use strict';
    if ($('#send_text').val() !== "") {
        $("#input_text").css("opacity", "0");
        var str = $('#send_text').val();
        $("#charcount01").css("opacity", "1");
        $("#charcount01").html(70 - str.length);
        if (str.length <= 70) {
            $("#charcount01").css("color", "#888");
            $("#send_text").css("box-shadow", "0 0 30px rgba(100, 100, 100, 1) inset");
        } else {
            $("#charcount01").css("color", "#F88");
        }
    } else {
        $("#input_text").css("opacity", "1");
        $("#charcount01").html("70");
        $("#charcount01").css("opacity", "0");
    }
}

function nameChange() {
    'use strict';
    if ($('#send_name').val() !== "") {
        $("#input_name").hide();
        var str = $('#send_name').val();
        $("#charcount02").css("opacity", "1");
        $("#charcount02").html(8 - str.length);
        if (str.length <= 8) {
            $("#charcount02").css("color", "#888");
            $("#send_name").css("box-shadow", "0 0 30px rgba(100, 100, 100, 1) inset");
        } else {
            $("#charcount02").css("color", "#F88");
        }
    } else {
        $("#input_name").show();
        $("#charcount02").html("8");
        $("#charcount02").css("opacity", "0");
    }
}

function setNotification(message, t, c) {
    'use strict';
    var type, color, ele, newele;
    switch (t) {
    case 0:
        type = "icon_happy";
        break;
    case 1:
        type = "icon_unhappy";
        break;
    case 2:
        type = "icon_exclamation-c";
        break;
    case 3:
        type = "icon_stop";
        break;
    case 4:
        type = "icon_bug";
        break;
    default:
        type = "icon_exclamation-c";
        break;
    }
    switch (c) {
    case 0:
        color = "greenback";
        break;
    case 1:
        color = "redback";
        break;
    case 2:
        color = "silverback";
        break;
    default:
        color = "silverback";
        break;
    }
    if (document.getElementById("notiarea").hasAttribute("class")) {
        document.getElementById("notiarea").removeAttribute("class");
    }
    if (document.getElementById("notiimage").hasAttribute("class")) {
        document.getElementById("notiimage").removeAttribute("class");
    }
    document.getElementById("notiarea").setAttribute("class", color);
    document.getElementById("notiimage").setAttribute("class", type);
    document.getElementById("notimessage").innerHTML = message;
    ele = document.getElementById("notification");
    newele = ele.cloneNode(true);
    ele.parentNode.replaceChild(newele, ele);
}

function likeOnClick(node) {
    'use strict';
    var id;
    document.title = "";
    id = $(node).parent().parent().attr("uid");
    if (id !== -1) {
        serverPostLike(id);
        $(node).css("animation", "buttonexpand .6s")
            .css("-webkit-animation", "buttonexpand .6s")
            .fadeOut();
    }
}

function newComer(i) {
    'use strict';
    switch (i) {
    case 0:
        setNotification("欢迎打开爱情树！", 0, 0);
        break;
    case 1:
        setNotification("你可以在这里倾诉", 2, 2);
        break;
    case 2:
        setNotification("也可以在这里聆听", 4, 2);
        break;
    case 3:
        setNotification("每一片小小的叶子", 2, 2);
        break;
    case 4:
        setNotification("都承载着一片真心", 4, 2);
        break;
    case 5:
        setNotification("但是请注意", 3, 1);
        break;
    case 6:
        setNotification("恶作剧是不行的哦", 1, 1);
        break;
    case 7:
        setNotification("那么", 2, 2);
        break;
    case 8:
        setNotification("开始留下回忆吧！", 0, 0);
        break;
    case 9:
        return;
    }
    setTimeout(function () {
        newComer(i + 1);
    }, 2500);
}