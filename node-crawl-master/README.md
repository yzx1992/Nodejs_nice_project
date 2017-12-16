       
```
使用nodejs做爬虫已经有一段时间了，利用爬虫技术，期间共做了3个网站
    |-- 361搜索
        |-- 功能: 利用360搜索、爱电影网、百度网盘、虫虫钢琴网、旗米拉网、虾米网等网站现有的功能，
                 帮助用户快速获得下载资源。
        |-- 网址: http://114.215.159.50:7001/
        |-- git库: https://github.com/tsq/361so
    |-- 爱虾米
        |-- 功用: 利用虾米网提供的api，提供搜索并获取艺人档案、评论、歌曲、专辑、图片等信息，
        |-- 网址: http://114.215.159.50:1400/index.html
        |-- git库: https://github.com/tsq/xiami
    |-- 美女图库
        |-- 功能: 看美女,免去原有网站一页只能看一张的纠结!
        |-- 网址: http://114.215.159.50:2014/
        |-- git库:  https://github.com/tsq/girl-gallery

下面是自己的一些总结和心得体会
    |-- 利用爬虫我们能够做什么?
        |-- 获取别的网站现有的api
            |-- 例如自己的361搜索网站中的，当你输入时，跳出的搜索建议，就是来自360搜索的api。
        |-- 对网站功能进行个性化重构
            |-- 例如自己的爱虾米、美女图库。都是对原有网站的重构，即数据来源于你，但是，布局
                我自己来呈现。
    |-- 爬虫需要哪些技术?
        |-- cheerio模块
            |-- 理由: 爬虫最关键的就是网页dom的分析,数据的提取，而cheerio，这个类似服务端版本的
                     jquery可以帮我们快速轻松的完成任务。
            |-- 英文官网: http://matthewmueller.github.io/cheerio/
            |-- api中文翻译: http://cnodejs.org/topic/5203a71844e76d216a727d2e
            |-- git库地址: http://matthewmueller.github.io/cheerio/
        |-- request模块
            |-- 理由: request模块对http的各种请求都做了很好的封装，在做http请求时，可以很容易
                     的获取请求数据，甚至支持cookie的传输。自己之前利用request做过一个restful
                     请求发送的网站: https://github.com/tsq/restful ,可以发现request的功能是
                     多么的强大。
            |-- git库地址: https://github.com/mikeal/request
        |-- 字符串的处理
            |-- 爬来的数据，大多情况下是一大堆字符串，因此如何获得自己想要的那部分字符串就需要熟悉
                js中对字符串的处理，如 substring、indexOf、lastIndexOf、replace等等。
    |-- 前端怎么办?
        |-- 爬虫代码一般放在服务端，因此我们还需要前端技能，在前端把从服务端获得的数据正确的展示。
            至于页面布局展示，如果你不想自己写css可以去:https://wrapbootstrap.com/ 选择一个，
            js框架可以使用jquery、angular等等。
爬虫实战demo
    |-- demo就是本项目'mm'，这个项目是在做美女图库时的测试代码，演示了如何获取想要的数据。
        下面会以suren.js为例，分析如何获取数据。你可以对照着suren.js中的代码看下面的说明。
    |—— demo最后被集成的效果是: http://114.215.159.50:2014/
    |-- suren.js源码分析
        |-- 作用: 获取 ‘http://www.22mm.cc/mm/suren/’页面中所有的图片的src、href、title
        |-- 第一步: 引入request、cheerio、qs模块
        |-- 第二步: var url = 'http://www.22mm.cc/mm/suren/';
                   request(url).pipe((fs.createWriteStream('suren.html')));
                   通过request将这个页面先下载到本地，进行dom分析，分析前，最好用编辑器将这个html
                   代码格式化一下。这样比较方便分析dom结构。
        |-- 第三步: 数据分析
                   |-- 我们想要的src、href、title等数据都是存放在li标签中，li中a便签包含了href和
                       title。li中img标签包含了图片的src。
        |-- 第四步: 数据获取
                   |-- 获取整个html文档,这个html页面都被包装在$对象中了
                                       request(url, function (error, res, body) {
                                       if (!error && res.statusCode == 200) {
                                           var $ = cheerio.load(body);
                                       }}
                   |-- 获取所有的li元素:  var li = $('li');
                   |-- 遍历li数组:    li.each(function (index, ele) {})
                   |-- 获取当前li中的title、src、href数据:
                                         var text = $(this).text();
                                         var src = $('img', this).attr('src');
                                         var href = $('a', this).attr('href');
                   |-- 将数据封装成一个对象，并存在数组中:
                                         var obj = {
                                              src: src,
                                              href: 'http://www.22mm.cc' + href,
                                              text: text
                                          };
                                          arr.push(obj);
        |-- 第五步: 测试结果:
                   |-- 项目根目录下: node suren.js 你将看到:
                        arr: [ { src: 'http://srimg1.meimei22.com/pic/suren/2014-8-4/1/s0.jpg',
                            href: 'http://www.22mm.cc/mm/suren/PiaeaiHdaPPHmdi.html',
                            text: '花样年华' },
                          { src: 'http://srimg1.meimei22.com/pic/suren/2014-7-18/1/s0.jpg',
                            href: 'http://www.22mm.cc/mm/suren/PiaJPeeibJJaCaaPH.html',
                            text: '迷雾 森林' },
                          { src: 'http://srimg1.meimei22.com/pic/suren/2014-7-8/1/s0.jpg',
                            href: 'http://www.22mm.cc/mm/suren/PiaJaeJiPeeaddeHa.html',
                            text: '我喜欢你是安静的' },
                          { src: 'http://srimg1.meimei22.com/pic/suren/2014-6-9/1/s0.jpg',
                            href: 'http://www.22mm.cc/mm/suren/PiaCabiamdaCaaib.html',
                            text: '那年夏天' },
                          { src: 'http://srimg1.meimei22.com/pic/suren/2014-6-6/1/s0.jpg',
                            href: 'http://www.22mm.cc/mm/suren/PiaCaCiaPedaHiiaH.html',
                            text: '公交站台' },
                          { src: 'http://srimg1.meimei22.com/pic/suren/2014-5-29/1/s0.jpg',
                            href: 'http://www.22mm.cc/mm/suren/PiamdbJmiPmaiPJdd.html',
                            text: '竹边' },
                          { src: 'http://srimg1.meimei22.com/pic/suren/2014-5-23/1/s0.jpg',
                            href: 'http://www.22mm.cc/mm/suren/PiamdHPeaHCamHJdi.html',
                            text: '秀气清纯妹妹kik...' },
                          { src: 'http://srimg1.meimei22.com/pic/suren/2014-8-15/1/0.jpg',
                            href: 'http://www.22mm.cc/mm/suren/PiaePmdeCaPammbaJ.html',
                            text: '兔蜜旅行' },
                          { src: 'http://srimg1.meimei22.com/pic/suren/2014-8-13/1/0.jpg',
                            href: 'http://www.22mm.cc/mm/suren/PiaePHmJPeiaHidiJ.html',
                            text: '夏' },
                          { src: 'http://srimg1.meimei22.com/pic/suren/2014-8-12/1/0.jpg',
                            href: 'http://www.22mm.cc/mm/suren/PiaePddbePamadid.html',
                            text: '随意乐呵乐呵' },
                          { src: 'http://srimg1.meimei22.com/pic/suren/2014-8-11/1/0.jpg',
                            href: 'http://www.22mm.cc/mm/suren/PiaePPPJeJiammdmC.html',
                            text: '8月咖啡' },
                          { src: 'http://srimg1.meimei22.com/pic/suren/2014-8-8/1/0.jpg',
                            href: 'http://www.22mm.cc/mm/suren/PiaeaeHbPbJammbPm.html',
                            text: 'Miya，初秋' },
                          { src: 'http://srimg1.meimei22.com/pic/suren/2014-8-7/1/0.jpg',
                            href: 'http://www.22mm.cc/mm/suren/PiaeaJHHJbdaiHbPe.html',
                            text: '瞳-微凉的你' },
                          { src: 'http://srimg1.meimei22.com/pic/suren/2014-8-5/1/0.jpg',
                            href: 'http://www.22mm.cc/mm/suren/PiaeamJdaJJaiHePe.html',
                            text: '夏の逆光' },
                          { src: 'http://srimg1.meimei22.com/pic/suren/2014-8-4/1/0.jpg',
                            href: 'http://www.22mm.cc/mm/suren/PiaeaiHdaPPHmdi.html',
                            text: '花样年华' },
                          { src: 'http://srimg1.meimei22.com/pic/suren/2014-7-31/1/0.jpg',
                            href: 'http://www.22mm.cc/mm/suren/PiaJHPiPeaHammmmb.html',
                            text: '那年青春' },
                          { src: 'http://srimg1.meimei22.com/pic/suren/2014-7-30/1/0.jpg',
                            href: 'http://www.22mm.cc/mm/suren/PiaJHaeJbdmammidm.html',
                            text: '户外街拍校花性感...' },
                          { src: 'http://srimg1.meimei22.com/pic/suren/2014-7-29/1/0.jpg',
                            href: 'http://www.22mm.cc/mm/suren/PiaJdbiibHiamimaC.html',
                            text: '午後微藍' },
                          { src: 'http://srimg1.meimei22.com/pic/suren/2014-7-24/1/0.jpg',
                            href: 'http://www.22mm.cc/mm/suren/PiaJdimCHHbamPdie.html',
                            text: '时尚百变美女吕妍...' },
                          { src: 'http://srimg1.meimei22.com/pic/suren/2014-7-23/1/0.jpg',
                            href: 'http://www.22mm.cc/mm/suren/PiaJdHmiCePaHaHm.html',
                            text: '清纯校花公园迷人...' },
                          { src: 'http://srimg1.meimei22.com/pic/suren/2014-7-21/1/0.jpg',
                            href: 'http://www.22mm.cc/mm/suren/PiaJdPbHPbmamHamJ.html',
                            text: '昙华林贰拾壹号' },
                          { src: 'http://srimg1.meimei22.com/pic/suren/2014-7-18/1/0.jpg',
                            href: 'http://www.22mm.cc/mm/suren/PiaJPeeibJJaCaaPH.html',
                            text: '迷雾 森林' },
                          { src: 'http://srimg1.meimei22.com/pic/suren/2014-7-16/1/0.jpg',
                            href: 'http://www.22mm.cc/mm/suren/PiaJPCibmCPaimiaa.html',
                            text: '樱花树下' },
                          { src: 'http://srimg1.meimei22.com/pic/suren/2014-7-11/1/0.jpg',
                            href: 'http://www.22mm.cc/mm/suren/PiaJPPHmHidaCaadm.html',
                            text: '等待秋天' },
                          { src: 'http://srimg1.meimei22.com/pic/suren/2014-7-10/1/0.jpg',
                            href: 'http://www.22mm.cc/mm/suren/PiaJPaeeCHaamaJdi.html',
                            text: '安静的时光' },
                          { src: 'http://srimg1.meimei22.com/pic/suren/2014-7-8/1/0.jpg',
                            href: 'http://www.22mm.cc/mm/suren/PiaJaeJiPeeaddeHa.html',
                            text: '我喜欢你是安静的' },
                          { src: 'http://srimg1.meimei22.com/pic/suren/2014-7-8/2/0.jpg',
                            href: 'http://www.22mm.cc/mm/suren/PiaJaeeJPCdaddeHa.html',
                            text: '浪漫樱花' },
                          { src: 'http://srimg1.meimei22.com/pic/suren/2014-7-3/1/0.jpg',
                            href: 'http://www.22mm.cc/mm/suren/PiaJaHeaeiiaiamPH.html',
                            text: '夏花瘾' },
                          { src: 'http://srimg1.meimei22.com/pic/suren/2014-7-2/1/0.jpg',
                            href: 'http://www.22mm.cc/mm/suren/PiaJaddeiJCamimib.html',
                            text: 'piko' },
                          { src: 'http://srimg1.meimei22.com/pic/suren/2014-7-1/1/0.jpg',
                            href: 'http://www.22mm.cc/mm/suren/PiaJaPPHCdHamiJim.html',
                            text: '一绺青丝' },
                          { src: 'http://srimg1.meimei22.com/pic/suren/2014-6-30/1/0.jpg',
                            href: 'http://www.22mm.cc/mm/suren/PiaCHadJaHdmiH.html',
                            text: '微醺初夏' },
                          { src: 'http://srimg1.meimei22.com/pic/suren/2014-6-26/1/0.jpg',
                            href: 'http://www.22mm.cc/mm/suren/PiaCdCJbdeeaimdid.html',
                            text: '邻家清纯MM沈乔乔...' },
                          { src: 'http://srimg1.meimei22.com/pic/suren/2014-6-25/1/0.jpg',
                            href: 'http://www.22mm.cc/mm/suren/PiaCdmmabHiamHiiH.html',
                            text: 'leisure time' },
                          { src: 'http://srimg1.meimei22.com/pic/suren/2014-6-23/1/0.jpg',
                            href: 'http://www.22mm.cc/mm/suren/PiaCdHeHCdeamPeid.html',
                            text: '瞳-简单' },
                          { src: 'http://srimg1.meimei22.com/pic/suren/2014-6-19/1/0.jpg',
                            href: 'http://www.22mm.cc/mm/suren/PiaCPbCJdmdammmPC.html',
                            text: '秘密花园' },
                          { src: 'http://srimg1.meimei22.com/pic/suren/2014-6-17/1/0.jpg',
                            href: 'http://www.22mm.cc/mm/suren/PiaCPJdHHHHaHPCda.html',
                            text: '马路少女' },
                          { src: 'http://srimg1.meimei22.com/pic/suren/2014-6-13/1/0.jpg',
                            href: 'http://www.22mm.cc/mm/suren/PiaCPHdCJPeadHJHC.html',
                            text: '明若朝曦' },
                          { src: 'http://srimg1.meimei22.com/pic/suren/2014-6-11/1/0.jpg',
                            href: 'http://www.22mm.cc/mm/suren/PiaCPPdaamamdaPb.html',
                            text: '春天里' },
                          { src: 'http://srimg1.meimei22.com/pic/suren/2014-6-9/1/0.jpg',
                            href: 'http://www.22mm.cc/mm/suren/PiaCabiamdaCaaib.html',
                            text: '那年夏天' },
                          { src: 'http://srimg1.meimei22.com/pic/suren/2014-6-6/1/0.jpg',
                            href: 'http://www.22mm.cc/mm/suren/PiaCaCiaPedaHiiaH.html',
                            text: '公交站台' },
                          { src: 'http://srimg1.meimei22.com/pic/suren/2014-5-30/1/0.jpg',
                            href: 'http://www.22mm.cc/mm/suren/PiamHaCCPaPaCamiC.html',
                            text: '森林の少女' },
                          { src: 'http://srimg1.meimei22.com/pic/suren/2014-5-29/1/0.jpg',
                            href: 'http://www.22mm.cc/mm/suren/PiamdbJmiPmaiPJdd.html',
                            text: '竹边' } ]
    |-- 集成在服务端中
        |-- 使用你自己喜欢的服务端框架将功能集成到api中，在这里我使用的sails框架，所以最后
            api集成的结果就是:
         https://github.com/tsq/girl-gallery/blob/master/api/controllers/PicController.js
    |-- 本项目其他js的说明:
        |-- suren-detail.js
            |-- 获取http://www.22mm.cc/网站美女大图的src
        |-- umei.js
            |-- 获取http://www.umei.cc/网站首页的图片的src
        |-- umei-detail.js
            |-- 获取http://www.umei.cc/网站美女大图的src
        |-- umei-detail-download.js
            |-- 下载http://www.umei.cc/网站美女大图到本地
            |-- 和http://www.22mm.cc/不同的是http://www.umei.cc/网在请求图片数据的时候会检查
                    http header中的 Referer,所以要特殊处理。而不能直接在浏览器中输入图片的url
        |-- 用node分别执行一下这几个js看看吧。特别是umei-detail-download.js，执行完后你将看到
            一张高清美女图。
    |-- 其它感悟
        |-- 编码的处理：
            |-- 有很多网站并非采用utf-8编码，所以爬来的数据可能是乱码，需要进行一些处理。
                '361搜索'工程中就有很多类似的处理。
        |-- 字符串的处理
            |-- 爬虫过程中经常需要进行对字符串进行处理，需要掌握好js中对字符串的处理，
                例如‘美女图库’项目中大图的获取，获取的图片src中，该网站故意将'pic'换成了'big'，
                因此需要自己处理一下。		
```
        
                    
                    
                    
                                           

            
        
           
