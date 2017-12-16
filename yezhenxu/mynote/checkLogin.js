/**
 * Created by zhenxuye on 2017/5/12.
 */
function noLogin(req,res,next) {
    if(!req.session.user){
        console.log('抱歉，您还没有登录 ！');
        return res.redirect('/login');

    }
    next();
}

exports.noLogin=noLogin;