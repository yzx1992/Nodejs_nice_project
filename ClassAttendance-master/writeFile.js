/**
 * Created by Administrator on 2016/6/12.
 */
//addJsonFile(result);
function addJsonFile(msg,rows){
    var fs = require('fs');
    var moment = require('moment');
    //���ڣ����������һ���ļ�
     console.log("rows[0].courseNumber----------wr"+rows[0].courseNumber);
    var fileName = moment().format("YYYY-MM-DD")+'_'+rows[0].courseNumber+'_'+".txt";
    var data = {
        studentName:msg.xml.FromUserName[0],
        studentNumber:'_____',
        studentLocationX:msg.xml.Location_X[0],
        studentLocationY:msg.xml.Location_Y[0],
        scale:msg.xml.Scale[0],
        loginTime:moment().format("YYYY-MM-DD HH:mm:ss"),
        resultNumber:rows[0].resultMessage
    }
        //������ļ���ʱ��׷��ѧ����Ϣ
        fs.appendFile('./static/'+fileName,JSON.stringify(data, null, 4), function(err) {
            if(err) {
                console.log(err);
            }
        });


}
module.exports = {
    addJsonFile: addJsonFile
};