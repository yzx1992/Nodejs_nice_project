var crypto = require('crypto');

var debug = require('debug');
var log = debug('webot-example:log');
var verbose = debug('webot-example:verbose');
var error = debug('webot-example:error');

var _ = require('underscore')._;
var search = require('../lib/support').search;
var geo2loc = require('../lib/support').geo2loc;
var talk = require('../lib/support').talk;

var package_info = require('../package.json');

/**
 * 初始化路由规则
 */
module.exports = exports = function(webot){
    var reg_help = /^(帮助|help|\?)$/i    //*****************************加了帮助
  webot.set({
    // name 和 description 都不是必须的
    name: 'hello help',
    description: '获取使用帮助，发送 help',
    pattern: function(info) {
      //首次关注时,会收到subscribe event
      return info.is('event') && info.param.event === 'subscribe' || reg_help.test(info.text);
    },
    handler: function(info){
      var reply = {
        title: '欢迎使用北大软微只能机器人助手软小薇',
          pic: 'http://image.baidu.com/search/down?tn=download&word=download&ie=utf8&fr=detail&url=http%3A%2F%2Fww2.sinaimg.cn%2Flarge%2F005yZdI7jw1efrw21jsehj30fk078aap.jpg&thumburl=http%3A%2F%2Fimg5.imgtn.bdimg.com%2Fit%2Fu%3D1623061980%2C4247400873%26fm%3D21%26gp%3D0.jpg',
          url: 'http://adviser.ss.pku.edu.cn/wx/bszn/',
        description: [
            '目前开放的功能:',
            '输入more来查看开放的所有功能',
            '软小薇聊天',
            '语音识别（小薇能听你说话啦）',
            '地图查找，发送: go 地点',
            '百度搜索，发送: s 关键词',
            '试试说出你关心的话题：比如:帮我查一下立项实习',
            'PS: 点击下面的「查看全文」将跳转到问题导航页'
        ].join('\n')
      };
      // 返回值如果是list，则回复图文消息列表
      return reply;
    }
  });

  // more查看当前所有规则
  webot.set(/^more$/i, function(info){
    var reply = _.chain(webot.gets()).filter(function(rule){
      return rule.description;
    }).map(function(rule){
      //console.log(rule.name)
      return '> ' + rule.description;
    }).join('\n').value();

    return ['我的主人还没教我太多东西,你可以考虑帮我加下.\n可用的指令:\n'+ reply,
      '我的学习能力可强啦！当前可用指令：\n' + reply];
  });

  // 加载简单的纯文本对话，用单独的 yaml 文件来定义
  require('js-yaml');
  webot.dialog(__dirname + '/dialog.yaml');


  function do_search(info, next){
    // pattern的解析结果将放在param里
    var q = info.param[1];
    log('searching: ', q);
    // 从某个地方搜索到数据...
    return search(q , next);
  }

  // 可以通过回调返回结果
  webot.set('search', {
    description: '发送: s 关键词 ',
    pattern: /^(?:搜索?|search|百度|s\b)\s*(.+)/i,
    //handler也可以是异步的
    handler: do_search
  });


    // 地图查找
    webot.set('mapsearch', {
        description: "查地图，发送: go 地点",
        pattern: /^(go\b)\s*(.+)/i,
        handler: function(info) {
            var location = info.param[2];
            var reply = {
                title: '地图查找',
                description: '点击查看' + location + '查找结果',
                pic: 'http://mmbiz.qpic.cn/mmbiz/RvqOnD4phkHvIN8MTppYr4CuQ4WtZMQRPia2YP4yVcyzp6R4ZZOfJceUiaibvBtbKan2maEYEuia878ficgOoVpAYUA/0',
                url: 'http://api.map.baidu.com/geocoder?address=' + location + '&output=html'
            }
            return reply;
        }
    });

    webot.set('课表', {
        description: '查课表,发送"课表"',
        pattern: /课表|什么课|啥课|在哪儿上课/,
        handler: function(info){
            var kebiao =
            {
                type: 'image',
                title: '课表',
                mediaId: '"p1p4qG8O09R7FuLJDA2E5q8DlBMjKo5bOi202j22yhs2x5a1YfAeydSJDdfmg55R',
                description: '北大软微课表'}
            return kebiao;
        }
    });
    webot.set('校历', {
        description: '查校历,发送"校历"',
        pattern: /校历/,
        handler: function(info){
            var xiaoli =
            {title: '校历',
                description: '北大校历',
                url: 'http://www.ss.pku.edu.cn/index.php/calendar'};
            return xiaoli;
        }
    });
    webot.set('食堂几点开门', {
        description: '问我食堂开门时间',
        // pattern 既可以是函数，也可以是 regexp 或 字符串(模糊匹配)
        pattern: /食堂|饭堂|餐厅|开饭|吃饭/,
        // 回复handler也可以直接是字符串或数组，如果是数组则随机返回一个子元素
        handler: ['早餐:07:30 ~ 09:00 午餐:11:00 ~ 12:30 晚餐:17:00 ~ 18:30']
    });
    webot.set('图书馆几点开门', {
        description: '问我图书馆开门时间',
        // pattern 既可以是函数，也可以是 regexp 或 字符串(模糊匹配)
        pattern: /图书馆*/,
        // 回复handler也可以直接是字符串或数组，如果是数组则随机返回一个子元素
        handler: ['周一至周日 8:00 ~ 22:30']
    });
    webot.set('校车', {
        description: '想知道校车几点开吗? 发送:校车',
        // pattern 既可以是函数，也可以是 regexp 或 字符串(模糊匹配)
        pattern: /校车/,
        // 回复handler也可以直接是字符串或数组，如果是数组则随机返回一个子元素
        handler: ['北大（中关村）---学院（大兴）发车时间：' +
        '早上7:20、中午13:00' +
        '乘车地点：北京大学理教西侧学院（大兴）---北大（中关村）' +
        '发车时间：中午11:40、下午17:10' +
        '乘车地点：软微学院研发楼北侧' +
        '提示：学生需排队，待老师上车后，学生依次上车.' +
        '寒暑假学院中午校车取消，晚间校车照常。']
    });
    webot.set('校医院电话', {
        description: '想知道校医院电话吗? 发送:校医院',
        // pattern 既可以是函数，也可以是 regexp 或 字符串(模糊匹配)
        pattern: /校医院*/,
        // 回复handler也可以直接是字符串或数组，如果是数组则随机返回一个子元素
        handler: ['62751084']
    });
    webot.set('快递电话', {
        description: '想知道快递电话吗? 发送:快递电话',
        // pattern 既可以是函数，也可以是 regexp 或 字符串(模糊匹配)
        pattern: /快递|(上门)?取件(的)?电话/,
        // 回复handler也可以直接是字符串或数组，如果是数组则随机返回一个子元素
        handler: ['顺丰:13911014533  中通:18911766250  圆通:010-53314326  天天快递:15110087895']
    });
    webot.set('维修电话', {
        description: '想知道维修电话吗? 发送:维修电话',
        // pattern 既可以是函数，也可以是 regexp 或 字符串(模糊匹配)
        pattern: /维修|修理师傅(的)?电话/,
        // 回复handler也可以直接是字符串或数组，如果是数组则随机返回一个子元素
        handler: ['61273600 61273700']
    });
    webot.set('宿管电话', {
        description: '想知道宿管电话吗? 发送:宿管电话',
        // pattern 既可以是函数，也可以是 regexp 或 字符串(模糊匹配)
        pattern: /宿管/,
        // 回复handler也可以直接是字符串或数组，如果是数组则随机返回一个子元素
        handler: ['61273554 61273544']
    });
    webot.set('值班电话', {
        description: '想知道值班电话吗? 发送:值班电话',
        // pattern 既可以是函数，也可以是 regexp 或 字符串(模糊匹配)
        pattern: /值班电话*/,
        // 回复handler也可以直接是字符串或数组，如果是数组则随机返回一个子元素
        handler: ['24小时值班电话 61273588'+
        '水电维修 61273600  61273700'+
        '网络中心 61273641'+
        '教务 61273664    61273671'+
        '实习就业办 61273668      61273741     61273733'+
        '财务 61273691 61273603'+
        '招生 62767180     62761919'+
        '宿管 张师傅 61273544  王师傅 61273554'+
        '保安电话：61273500']
    });
    webot.set('导师双选', {
        description: '导师双选',
        // pattern 既可以是函数，也可以是 regexp 或 字符串(模糊匹配)
        pattern: /导师/,
        // 回复handler也可以直接是字符串或数组，如果是数组则随机返回一个子元素
        handler: ['时间：新生导师双选工作一般于每年9、10月份进行。'+
        '双选方式:通过系统以“师生双向选择+协调”的方式进行。具体流程及相关细节说明详见届时发布的通知。']
    });
    webot.set('四六级', {
        description: '四六级',
        // pattern 既可以是函数，也可以是 regexp 或 字符串(模糊匹配)
        pattern: /四六级*/,
        // 回复handler也可以直接是字符串或数组，如果是数组则随机返回一个子元素
        handler: ['大学英语四、六级考试每年组织两次（考试时间：6月、12月），报名时间为3月和9月的某一周，报名时必须持本人的学生证（或一卡通）,否则不予办理, 报考六级的同学必须携带四级证书（2005年6月以前报考的）或成绩单（425分以上）方有资格报考六级。报名具体时间及照片的采集时间请关注教务发布的相关通知（北大校内门户、学院主页、学院论坛），错过报名及照相时间将无补报和补照机会。']
    });
    webot.set('立项', {
        description: '立项',
        pattern: /立项/,
        handler: function(info){
            var lixiang =
            {title: '立项',
                description: '立项',
                url: 'http://adviser.ss.pku.edu.cn/wx/bszn/html/sxlx.html'};
            return lixiang;
        }
    });
    webot.set('论文', {
        description: '论文',
        pattern: /论文/,
        handler: function(info){
            var lunwen =
            {title: '论文',
                description: '论文',
                url: 'http://adviser.ss.pku.edu.cn/wx/bszn/html/lwkt.html'};
            return lunwen;
        }
    });
    webot.set('在读证明', {
        description: '在读证明',
        pattern: /在读证明*/,
        handler: function(info){
            var lunwen =
            {title: '在读证明',
                description: '在读证明',
                url: 'http://adviser.ss.pku.edu.cn/wx/bszn/html/zdzm.html'};
            return lunwen;
        }
    });
    webot.set('申请学位', {
        description: '申请学位',
        pattern: /申请学位*/,
        handler: function(info){
            var lunwen =
            {title: '申请学位',
                description: '申请学位',
                url: 'http://adviser.ss.pku.edu.cn/wx/bszn/html/sqxwlc.html'};
            return lunwen;
        }
    });
    webot.set('盖章', {
        description: '盖章',
        pattern: /盖章/,
        handler: function(info){
            var lunwen =
            {title: '盖章',
                description: '盖章',
                url: 'http://adviser.ss.pku.edu.cn/wx/bszn/html/gxygz.html'};
            return lunwen;
        }
    });
    webot.set('水电充值', {
        description: '水电充值',
        pattern: /交水费*|交电费*|充水费*|充电费*|水电充值*/,
        handler: function(info){
            var lunwen =
            {title: '水电充值',
                description: '水电充值',
                url: 'http://adviser.ss.pku.edu.cn/wx/bszn/html/sdkcz.html'};
            return lunwen;
        }
    });
    webot.set('缴费', {
        description: '缴费',
        pattern: /交费|交钱|缴费*/,
        handler: function(info){
            var lunwen =
            {title: '缴费',
                description: '缴费',
                url: 'http://adviser.ss.pku.edu.cn/wx/bszn/html/xsjfsf.html'};
            return lunwen;
        }
    });
    webot.set('校园卡', {
        description: '校园卡',
        pattern: /校园卡/,
        handler: function(info){
            var lunwen =
            {title: '校园卡',
                description: '校园卡',
                url: 'http://adviser.ss.pku.edu.cn/wx/bszn/html/xykbl.html'};
            return lunwen;
        }
    });
    webot.set('学生证注册', {
        description: '学生证注册',
        pattern: /学生证注册*/,
        handler: function(info){
            var lunwen =
            {title: '学生证注册',
                description: '学生证注册',
                url: 'http://adviser.ss.pku.edu.cn/wx/bszn/html/xszzc.html'};
            return lunwen;
        }
    });
    webot.set('火车票', {
        description: '火车票',
        pattern: /火车票*/,
        handler: function(info){
            var lunwen =
            {title: '火车票',
                description: '火车票',
                url: 'http://adviser.ss.pku.edu.cn/wx/bszn/html/hcpyhk.html'};
            return lunwen;
        }
    });
    webot.set('实习结项', {
        description: '实习结项',
        pattern: /实习结项*/,
        handler: function(info){
            var lunwen =
            {title: '实习结项',
                description: '实习结项',
                url: 'http://adviser.ss.pku.edu.cn/wx/bszn/html/sxjx.html'};
            return lunwen;
        }
    });
    webot.set('成绩单', {
        description: '成绩单',
        pattern: /成绩单/,
        handler: function(info){
            var lunwen =
            {title: '成绩单',
                description: '成绩单',
                url: 'http://adviser.ss.pku.edu.cn/wx/bszn/html/dycjd.html'};
            return lunwen;
        }
    });
    webot.set('答辩', {
        description: '答辩',
        pattern: /答辩/,
        handler: function(info){
            var lunwen =
            {title: '答辩',
                description: '答辩',
                url: 'http://adviser.ss.pku.edu.cn/wx/bszn/html/sqlwdb.html'};
            return lunwen;
        }
    });
    webot.set('学籍', {
        description: '学籍',
        pattern: /学籍/,
        handler: function(info){
            var lunwen =
            {title: '学籍',
                description: '学籍',
                url: 'http://adviser.ss.pku.edu.cn/wx/bszn/html/xjyd.html'};
            return lunwen;
        }
    });
    webot.set('车证', {
        description: '车证',
        pattern: /车证/,
        handler: function(info){
            var lunwen =
            {title: '车证',
                description: '车证',
                url: 'http://adviser.ss.pku.edu.cn/wx/bszn/html/blcz.html'};
            return lunwen;
        }
    });
    webot.set('退宿', {
        description: '退宿',
        pattern: /退宿/,
        handler: function(info){
            var lunwen =
            {title: '退宿',
                description: '退宿',
                url: 'http://adviser.ss.pku.edu.cn/wx/bszn/html/xsts.html'};
            return lunwen;
        }
    });
    webot.set('就业', {
        description: '就业',
        pattern: /就业/,
        handler: function(info){
            var lunwen =
            {title: '就业',
                description: '就业',
                url: 'http://adviser.ss.pku.edu.cn/wx/bszn/html/jysw.html'};
            return lunwen;
        }
    });
    webot.set('服务电话', {
        description: '服务电话',
        pattern: /服务电话*/,
        handler: function(info){
            var lunwen =
            {title: '服务电话',
                description: '服务电话',
                url: 'http://adviser.ss.pku.edu.cn/wx/bszn/html/zxffdh.html'};
            return lunwen;
        }
    });

    // 图灵机器人
    webot.set('talk', {
        description: "软小薇聊天,支持语音哦，跟我讲讲今天的新鲜事儿~",
        pattern: /.*/,
        handler: talk
    });

    //所有消息都无法匹配时的fallback
    webot.set(/.*/, function(info){
        // 利用 error log 收集听不懂的消息，以利于接下来完善规则
        // 你也可以将这些 message 存入数据库
        log('unhandled message: %s', info.text);
        info.flag = true;
        return '你发送了「' + info.text + '」,可惜我太笨了,听不懂. 发送: help 查看可用的指令';
    });
};
