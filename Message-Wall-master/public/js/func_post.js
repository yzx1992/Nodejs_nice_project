/*global $, jQuery, alert,
    leavesCount:true,
    createLeaf,
    setNotification,
    setLeafUID,
    removeLeaf,
    newComer
*/

/*Global variables & functions:
    leavesCount: the count of the leaves than have been drawn on the page
        used to set the leaf id and layout
        add 1 when new leaf is drawn
        minus 1 when leaf is removed
    createLeaf: Add one new leaf with several options on the page
        WATCH OUT, this function has many parameters
    setNotification: Call the notification bar to send the message to user
        easy to use
    setLeafUID: Set the unique ID on the leaf which is created just now,
        the unique ID must be returned by the server
    removeLeaf: Remove one leaf,
        the leaf must be the one that cannot be created normally,
        this could happen when the network is bad
    newComer: Show some welcome words to new user
*/

//Post the like clicked event to the server
//Parameters: serPostLike(uid[unique ID])
function serverPostLike(uid) {
    'use strict';
    //Add ajax request for like count
    //Try several request if fail
    //No need to handle success
    var postData;
    postData = {
        uid: uid
    };
    $.post("/leaf/like", postData, null, "json")
        .done(function (data) {
            setNotification("点赞成功！（≧∇≦）", 0, 0);
        })
        .fail(function () {
        });
}

//Add new leaves when the screen is scrolled to the end
//Parameters: serverPostAddLeaves(num[number of new request leaves])
function serverPostAddLeaves(num) {
    'use strict';
    var i, postData, leaves;
    postData = {
        start: leavesCount,
        count: num
    };
    $.post("/leaf/get", postData, null, "json")
        .done(function (data) {
            if (data.success) {
                leaves = data.params.memories;
                for (i = 0; i < leaves.length; i = i + 1) {
                    //Set the largest number of the leaves
                    //Parameters: createLeaf(id, uid, message, name, color[1~8], display delay[ms], is liked[1:true;0:false]);
                    /*jslint nomen: true*/
                    createLeaf(leavesCount, leaves[i]._id, leaves[i].text, leaves[i].name, leaves[i].color, i * 100, data.params.liked[i]);
                    /*jslint nomen: false*/
                    leavesCount += 1;
                }
            } else {
                leaves = null;
            }
        })
        .fail(function () {
            leaves = null;
        });
}

//Post the new leaf to server the user create just now
//Parameters: serverPostLeaf(uid, message, name, color[1~8]);
function serverPostNewLeaf(text, name, color) {
    'use strict';
    var postData = {
        text: text,
        name: name,
        color: color
    };
    $.post("/leaf/add", postData, null, "json")
        .done(function (data) {
            if (data.success) {
                $("#le_" + leavesCount).children().css("opacity", "1");
                $("#sendbox").removeClass("sending");
                setNotification("心愿收到！(*´∀｀*)", 0, 0);
                setLeafUID(leavesCount, data.params.id);
                leavesCount += 1;

                $("#send_text").val("");
                $("#send_name").val("");
                $("#charcount01").html("70");
                $("#charcount02").html("8");
                $("#charcount01").css("opacity", "0");
                $("#charcount02").css("opacity", "0");
                $("#input_text").css("opacity", "1");
                $("#input_name").show();
            } else {
                removeLeaf(leavesCount);
                $("#sendbox").removeClass("sending");
                if (data.message === "BAD WORDS") {
                    setNotification("文本包含恶劣词汇！", 1, 1);
                } else if (data.message === "SEND LIMIT") {
                    setNotification("请勿频繁发送消息！", 1, 1);
                } else {
                    setNotification("发送失败！ヽ(≧Д≦)", 1, 1);
                }
            }
        })
        .fail(function () {
            removeLeaf(leavesCount);
            $("#sendbox").removeClass("sending");
            setNotification("网络错误！ヽ(≧Д≦)", 1, 1);
        });
}

//Entrance of the program
function init() {
    'use strict';
    $("#tree_star").css("opacity", 1);
    $("#sendbox").fadeIn();
    $("#notification").show();
    var i, color, firstCome;
    //Check if the user is firstly open the page
    firstCome = false;
    $.post("/ifnew", {}, null, "json")
        .done(function (data) {
            firstCome = data.params.ifnew;
            if (firstCome) {
                newComer(0);
            } else {
                setNotification("欢迎回来！*(^o^)*", 0, 0);
            }
        });
    serverPostAddLeaves(20);
}