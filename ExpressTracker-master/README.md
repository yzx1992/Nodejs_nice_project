# ExpressHelper
##应用介绍
基于微信企业号平台的求取快递和帮取快递小应用
##系统部署
- `/data`:数据库配置,token及自定义菜单设置
- `/verify`:企业服务器验证
- `/public`:页面静态目录
- `config.js`:corpid及secret
- `index.js`:web服务器及相关路由
- `/w_express/app`:微信回调模式使用服务器,对消息进行处理

##使用帮助
1. 点击**求取**按钮,进去表单页面填写快递相关信息,提交后即可在请求列表中查看
2. 点击**帮取**按钮,进入请求列表页面,该页面限定列举6个请求,点击页面下方的**查看更多**链接可查看所有可领取的请求,选择请求,弹出信息确认框,点击**确定**后,请求方和领取方均会收到消息提示对方信息
3. 点击**我的**按钮,进入**我的请求**页面,该页面列出所有我发布的待领取的请求,点击单个请求,可进行该请求的编辑和删除操作
4. 直接回复文字消息,如天天,顺丰等快递公司,可查询有关请求 
5. **w_express** 尝试用koa框架，进行服务器验证，票据获取，消息回复等。
6. 另有一些文件功能暂时搁置，存在多余文件
 
##开发人员信息
黄凯凯 1501210918
孙晴 1501210986