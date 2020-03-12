<a href="https://www.npmjs.com/package/jet-deploy"><img src="https://img.shields.io/npm/v/jet-deploy.svg" alt="npm-version"></a> <img src="https://img.shields.io/npm/dm/jet-deploy.svg" alt="download-num"> <img src="https://img.shields.io/badge/node-%3E=8.16.0-brightgreen.svg" alt="node"> <img src="https://img.shields.io/npm/l/jet-deploy.svg" alt="license"> <img src="https://img.shields.io/badge/platform-MacOS%7CLinux%7CWindows-lightgrey.svg" alt="platform">

# Jet-Deploy

对于前后端分离的项目，使用 Vue、React、Angular 构建完成的单页面应用，或是包含 html 页面的静态资源，亦或任意格式的文件资源，Jet-Deploy 可以帮助你将要发布的文件快速上传到远程服务器的指定目录，高效协助项目应用的测试、或部署。

## 全局安装

```bash
yarn global add jet-deploy #或者 npm install jet-deploy -g
```

## 全局使用

```bash
➜  react-demo ➜  jet-deploy --help
Usage: index [options]

Options:
  -V, --version              output the version number
  -h --host [ip]             服务器地址 (default: "")
  -p --port [number]         服务器端口 (default: 0)
  -u --user [string]         服务器用户名 (default: "")
  -P --password [string]     服务器密码 (default: "")
  -r --remotePath [string]   服务器目标路径 (default: "")
  -i --includeHtml [string]  是否包含 html 文件 (default: true)
  -h, --help                 output usage information
```

#### 基本功能

```bash
# 将当前目录下的 dist 目录中的所有文件上传到远程服务器
jet-deploy dist

# 将 /User/furic/wwww/project-demo/dist 目录下所有文件上传到远程服务器
jet-deploy /User/furic/wwww/project-demo/dist

# 将当前目录下的 dist 目录中的所有文件上传到远程服务器的 /root/www 目录下
jet-deploy dist -r /root/www #或者 jet-deploy dist -remotePath /root/www

# 将当前目录下的 dist 目录中的所有静态文件（不包括html）上传到远程服务器
jet-deploy dist -i false # 或者 jet-deploy dist --includeHtml false

# 配置默认的服务器参数
jet-deploy dist --host 10.211.55.3 --port 22 --user root --password 123456 --remotePath /root/www

```

#### 使用示例

```bash
➜  react-demo ➜  jet-deploy dist
+--------------------------------------------+
|                                            |
|   欢迎使用jet-deploy应用文件远端部署工具        |
|                                            |
+--------------------------------------------+
? 请填写服务器IP地址： 10.211.55.3
? 请填写服务器端口号： 22
? 请填写服务器用户名： root
? 请填写服务器密码： [hidden]
? 请填写服务器目标路径： /root/www
成功上传：asset-manifest.json
成功上传：favicon.ico
成功上传：index.html
成功上传：manifest.json
成功上传：precache-manifest.4181eb8e15bbf21d18c638b21a1f5735.js
成功上传：service-worker.js
成功上传：lib/es6-promise.min.js
成功上传：lib/fastclick.js
成功上传：static/css/2.f7b7b57a.chunk.css
成功上传：static/css/index.a0329fdf.chunk.css
成功上传：static/js/2.f3063d09.chunk.js
成功上传：static/js/2.f3063d09.chunk.js.LICENSE.txt
成功上传：static/js/2.f3063d09.chunk.js.map
成功上传：static/js/index.d2342c63.chunk.js
成功上传：static/js/runtime-index.dd1f1907.js
deploy succeed.
```

## 项目中本地安装

```bash
yarn add jet-deploy -D #或者 npm install jet-deploy --save-dev
```

## 项目中本地使用

在项目的`package.json`文件中配置`scripts`。

```json
{
  "name": "project-demo",
  "scripts": {
    "deploy": "jet-deploy dist --host 10.211.55.3 --port 22 --user root --password 123456 --remotePath /root/www"
  }
}
```

执行：

```bash
yarn deploy #或者 npm run deploy
```

> 如果不便于公开服务器密码，`--password`参数可以省略，将在命令行中动态输入服务器密码。

## License

[MIT](http://opensource.org/licenses/MIT)

Copyright (c) 2020-present, [chanjet-fe](https://github.com/chanjet-fe).
