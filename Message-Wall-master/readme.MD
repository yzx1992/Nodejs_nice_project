# Wish Tree
A wish tree allows people to post their words about love and wishes.
Visit Demo: https://bit.do/lovetree
![Feature Image](feature.jpg)

# Features
* Lovely Page Design
* Smooth Animation
* Easily Send & Like
* Bad words filter

# Technologies
* Express Web Framework
* Mongoose ODM
* Font Awesome Icons
* jQuery Library

# 中文介绍

## 应用介绍
本应用是一个类似于留言墙的自由留言页面，同时支持消息的点赞和简单的恶劣词汇过滤系统。页面具有清新优雅的外观、流畅的动画和亮丽的色彩风格，交互方式简单明了，能够很好的让用户浏览和纪录自己的理想、感情与愿望。

## 系统部署
您可以在自己的服务器上测试和使用本应用，但需要具备以下系统环境：

Node.js >= 0.6.0
MongoDB >= 2.0
npm >= 1.0.0

您需要使用npm工具来获取其它第三方模块支持

您可能需要增加服务器与数据库的某些环境参数来正常使用本应用

## 使用帮助
本页面支持以下功能：

点击页面右下角的撰写按钮来发送新留言，留言的文本和昵称均有字数限制（会有明显提醒），留言发送后后台服务器会进行恶劣词汇审查，不符合要求的留言会被取消。

用户可以点击愿望树上的留言叶片来查看留言详情，以及对与自己喜欢的留言进行点赞。

留言叶片会通过AJAX在后台加载，当用户下拉页面时愿望树会不断增长，直到所有留言叶片显示完毕。

页面中使用一个简单的消息通知系统来对用户的各种操作进行反馈，如发送成功、网络错误等等。

## 开发人员信息
* 概念设计 Apollo Wayne
* 前端开发 Apollo Wayne
* 后端开发 Apollo Wayne