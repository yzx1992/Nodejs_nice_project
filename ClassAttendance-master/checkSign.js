function checkSignature(params, token){
    //1. 将token、timestamp、nonce三个参数进行字典序排序
    //2. 将三个参数字符串拼接成一个字符串进行sha1加密
    //3. 开发者获得加密后的字符串可与signature对比，标识该请求来源于微信
    var key = [token, params.timestamp, params.nonce].sort().join('');
    var sha1 = require('crypto').createHash('sha1');
    sha1.update(key);
    return  sha1.digest('hex') == params.signature;
}
module.exports=checkSignature;