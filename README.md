GAMU
===========================
gamu 基于 Browsersync 和 gulp 开发, 集成了前端调试, 构建, 编译等开发流程, 帮助开发者提高开发效率;


##命令步骤
1. npm i -g  // 全局安装依赖

2. gm init / gm i   // 初始化

3. gm build // 打包静态文件

##目录结构描述

```javascript

├── README.md                   // help
│
├── app                         // 入口文件夹
│   ├── css                     // 样式文件夹
│   │    └── vendor
│   ├── font                    // 字体文件夹
│   ├── images                  // 图片文件夹
│   ├── js                      // 脚本文件夹
│   │    └── vendor
│   ├── media                   // 多媒体文件夹
│   └── template                // 模板文件夹
│
├── bin
│
├── gulpfile.js
│
└── config.js                   // 自定义配置文件

```

##注意事项说明

1. 执行 gm init 命令时, 如果没有 app 文件夹，则会默认创建

2. config.js 可配置开发环境下的端口号，索引文件夹，索引文件以及打包时是否启用 hash ，是否对文件进行压缩

3. css, js 文件夹下的 vendor 文件夹打包时不会进行处理, 建议将外来引用的 css, js 放入 vendor , 如引入的 jQuery 源文件, 放到对应 js/vendor 下;

4. 关于样式的打包问题: 执行打包时, 样式文件将进行合并为一个命名为 main.css 的文件, less, sass 将会编译后进行合并, 所以建议开发时, 直接外链引入 main.css 即可
  
  ```javascript
    <link rel="stylesheet" type="text/css" href="css/main.css">
  ```

5. template 文件夹为模板文件夹, 可将页面的 header, footer 放到此处, 打包时将会忽略此文件夹

6. 模板引入的命令为 
  ```javascript
    // 基本命令行
    @@include("./template/head.html")

    // 带参命令行
    @@include("./template/head.html", {
			"page": "index"
    })
  ```

  根据携带参数添加 class
  ```javascript

    // index.html
    @@include("./template/head.html", {
			"page": "index"
    })

    // 模板文件 head.html
    <div class="menu @@page">
    ...
    </div>

    <div class="menu @@if (page === 'index') {active}">
    ...
    </div>
  ```
  编译后
  ```javascript

    // 模板文件 head.html
    <div class="menu index">
    ...
    </div>

    <div class="menu active">
    ...
    </div>
  ```
  **更多详情可参考 [gulp-file-include](https://www.npmjs.com/package/gulp-include-file) 介绍**

  #### 注意！注意！注意！
  #### 参数必须用双引号包裹, 否则报错

  ##### 正确写法
  **`"page": "index"`**
  
  ##### 错误写法
  **`'page': 'index'`**

  **` page: index`**

  ##### (待补充...)