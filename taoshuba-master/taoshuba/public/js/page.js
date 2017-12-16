var pageSize = 15;
var curPage=0;
var lastPage;
var direct=0;
var len;
var page;
var begin;
var end;


$(document).ready(function display(){
    len =$("#mytable tr").length - 1;
    page=len % pageSize==0 ? len/pageSize : Math.floor(len/pageSize)+1;
    // alert("page==="+page);
    curPage=1;
    displayPage();

    document.getElementById("btn0").innerHTML="当前 " + curPage + "/" + page + " 页    每页〉 ";
    document.getElementById("sjzl").innerHTML="数据总量 " + len + "";
    document.getElementById("pageSize").value = pageSize;



    $("#btn1").click(function firstPage(){
        curPage=1;
        direct = 0;
        displayPage();
    });
    $("#btn2").click(function frontPage(){
        direct=-1;
        displayPage();
    });
    $("#btn3").click(function nextPage(){
        direct=1;
        displayPage();
    });
    $("#btn4").click(function lastPage(){
        curPage=page;
        direct = 0;
        displayPage();
    });
    $("#btn5").click(function changePage(){
        curPage=document.getElementById("changePage").value * 1;
        if (!/^[1-9]\d*$/.test(curPage)) {
            alert("请输入正整数");
            return ;
        }
        if (curPage > page) {
            alert("超出数据页面");
            return ;
        }
        direct = 0;
        displayPage();
    });


    $("#pageSizeSet").click(function setPageSize(){
        pageSize = document.getElementById("pageSize").value;
        if (!/^[1-9]\d*$/.test(pageSize)) {
            alert("请输入正整数");
            return ;
        }
        len =$("#mytable tr").length - 1;
        page=len % pageSize==0 ? len/pageSize : Math.floor(len/pageSize)+1;
        curPage=1;
        direct=0;
        firstPage();
    });
});

function displayPage(){
    if(curPage <=1 && direct==-1){
        direct=0;
        alert("已经是第一页了");
        return;
    } else if (curPage >= page && direct==1) {
        direct=0;
        alert("已经是最后一页了");
        return ;
    }

    lastPage = curPage;


    if (len > pageSize) {
        curPage = ((curPage + direct + len) % len);
    } else {
        curPage = 1;
    }


    document.getElementById("btn0").innerHTML="当前 " + curPage + "/" + page + " 页    每页〉 ";

    begin=(curPage-1)*pageSize + 1;
    end = begin + 1*pageSize - 1;


    if(end > len ) end=len;
    $("#mytable tr").hide();
    $("#mytable tr").each(function(i){
        if((i>=begin && i<=end) || i==0 )
            $(this).show();
    });
}