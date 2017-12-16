function checkSignature(params, token){
    //1. ��token��timestamp��nonce�������������ֵ�������
    //2. �����������ַ���ƴ�ӳ�һ���ַ�������sha1����
    //3. �����߻�ü��ܺ���ַ�������signature�Աȣ���ʶ��������Դ��΢��
    var key = [token, params.timestamp, params.nonce].sort().join('');
    var sha1 = require('crypto').createHash('sha1');
    sha1.update(key);
    return  sha1.digest('hex') == params.signature;
}
module.exports=checkSignature;