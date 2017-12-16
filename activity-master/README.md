#软微活动


## 软件介绍

软微活动是使用 **MEAN**框架搭建的基于微信公众平台的软微活动页面，同学们可以在平台上发起或参加自己喜欢的活动并可以留言相互讨论，结交志同道合的朋友。
<br/>目前只支持微信公众平台，适配微信企业号需要修改相关功能。
<br/>


部署公众号二维码<br/>
![image](https://github.com/beautifuloser/activity/blob/master/public/images/6.pic.jpg)<br/>
关注后点击菜单栏进入应用

## 安装部署

```
1. 安装 Node.js、MongoDB(如果数据库放在本地)
2. 数据库使用MongoDB，托管于MongoLab(https://mlab.com/)，数据库中间件使用waterline.js，可以根据自己的喜好把数据库放到本地或者托管MongoLab，运行程序后会自动创建表结构
3. 将代码放到服务器上，进入代码目录执行`$ npm install` 安装项目所需的依赖包
4. 打开`config`目录下的`config.js`根据需要设置appid、appsecret、mongoURI等信息
5. 在微信测试平台中修改JS接口安全域名，JS接口安全域名只能用实名认证后的网址，将域名地址指向服务器ip:端口号
6. 打开`views`目录下`index.ejs`文件，修改window.onload方法中的appid、redirect_uri等参数
7. 进入`bin`目录，执行`$ node www`启动服务，也可以使用pm2/forever进行部署
8. 设置公众号自定义菜单，将菜单指向域名链接
9. 打开公众号，点击菜单，进入软微活动平台
```

## 使用帮助
进入主页面<br/>
![image](https://github.com/beautifuloser/activity/blob/master/public/images/1.pic.jpg)<br/>
点击导航栏上的左侧菜单栏后显示菜单栏信息，点击相应的按钮会跳转到对应的页面<br/>
![image](https://github.com/beautifuloser/activity/blob/master/public/images/2.pic.jpg)<br/>
点击一个活动后进入活动的详细页面<br/>
![image](https://github.com/beautifuloser/activity/blob/master/public/images/3.pic.jpg)
![image](https://github.com/beautifuloser/activity/blob/master/public/images/4.pic.jpg)<br/>
可以进行参加活动，取消参加，发表留言等操作

## 开发人员
王子微 1601220137

## 项目总结
  经过一段时间的努力，软微活动这个应用已经初具雏形。总体来说，这个项目比较顺利，没有什么难点。但是因为时间不是特别充足，在项目开始时对框架缺乏足够的思考，导致后期的开发过程中遇到一些问题，遇到问题后也没想到最好的办法。以后做项目时一定要注意。
