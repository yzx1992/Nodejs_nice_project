/**
 * Created by sunny on 16/5/2.
 */

'use strict'
var ejs = require('ejs');
var heredoc = require('heredoc');
var tpl_reply = heredoc(function(){/*
 <xml>
 <Encrypt><![CDATA[<%= msg_encypt %>]]></Encrypt>
 <MsgSignature><![CDATA[<%= msg_signature %>]]></MsgSignature>
 <TimeStamp><%= timestamp %></TimeStamp>
 <Nonce><![CDATA[<%= nonce %>]]></Nonce>
 </xml>
*/});
//ejs编译这个函数
var compiled = ejs.compile(tpl_reply);
exports= module.exports={
	compiled:compiled
}









