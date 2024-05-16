# PaperPlane API [![Build Status](https://drone.paperplane.cc/api/badges/jia-niang/paperplane-api/status.svg)](https://drone.paperplane.cc/jia-niang/paperplane-api)

为 https://app.paperplane.cc 提供 API 支持。  
[原始代码仓库](https://git.paperplane.cc/jia-niang/paperplane-api) · [Github 代码镜像](https://github.com/PaperplaneJS/webapi) · [CI/CD](https://drone.paperplane.cc/jia-niang/paperplane-api)

## 本地调试开发

本项目对系统内已安装的应用有要求：

- 必须已安装 Node.js 20 及以上版本，这是必须的运行条件；
- 如果有用到 `puppeteer` 相关功能（例如每日下班提醒生成图片），则需求已安装 Chrome；
- 如果有用到 `simple-git` 相关功能（例如 Git 周报助手），则需求已安装 Git。

为了让本地和云端环境一致，建议使用 Docker 镜像运行。

## macOS 在 Docker 中运行（推荐）

此运行方式需要已安装 Docker。
此运行方式对环境依赖较小，且可以做到和部署后的服务端环境保持一致，推荐使用此方式来运行。

```bash
# 启动
docker compose up

# 如果需要执行其它命令，可以进入容器的 bash
docker exec -it paperplane-api-local bash
```

## Windows 在 Docker 中运行（Windows 环境推荐）

请注意：在 Windows 系统下，Docker 的挂载目录可能无法即时监听文件更改，表现为启动项目极慢、更改了代码后不能重新编译等问题。
因此推荐使用 wsl2 配合 VSCode 的 [WSL 扩展](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-wsl) 来进行开发。

Windows 使用 wsl2 运行本项目的准备工作：

- 本机已安装 [wsl2](https://learn.microsoft.com/zh-cn/windows/wsl/install)；
- 本机已安装 Docker，并在安装时选择 “使用 wsl2 引擎”，或是在 wsl2 中已安装 Docker；
- 在 VSCode 中安装 WSL 扩展，[点此链接安装](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-wsl)，如果你使用了其他的编辑器 / IDE，请自行寻找对应的插件；
- 在 wsl 子系统中，可能需要安装 Git，可以这样做：`sudo apt-get update && sudo apt-get install git`。

安装 WSL 扩展后，VSCode 左侧边栏会出现 “远程资源管理器”，此时便可以在 wsl 子系统中克隆仓库并打开。
建议转到 VSCode “扩展” 页面，部分扩展需要在子系统中重新安装一遍。

运行项目：
打开 VSCode 终端，此时终端已连接到 wsl 子系统中，执行：

```bash
# 启动项目
docker compose up
```

启动项目后，新开一个终端，通过以下命令进入项目所在的容器内：

```bash
# 进入容器内的终端
docker exec -it paperplane-api-local bash
```

此时就可以执行 `yarn add` 等命令了。

## 本机运行

需求 Node.js 的 20 及以上版本，[点此下载最新版](https://nodejs.org/) 或者 [点此选择一个版本下载](https://nodejs.org/en/download/releases)；安装完 Node.js 后，请运行 `npm i -g yarn --registry=https://registry.npmmirror.com` 来安装 `yarn`，这也是一个必备的依赖项。

安装依赖：

```bash
yarn
```

启动：

```bash
# 开发模式
yarn dev

# 编译构建+生产模式运行
yarn build && yarn start:prod
```

## 关于 Prisma

项目使用 `prisma` 来持久化存储数据库表结构关系。

特性：
- 开发调试时，通过 `/prisma/schema.prisma` 来修改数据库表结构，修改后通过执行 `yarn dbgen` 生成新的 TypeScript 类型；
- 在全新的环境开发时，执行一次 `yarn dbpush` 来把定义好的数据结构应用于当前数据库；后续请勿再执行此命令，否则必须丢弃全部数据才能执行 `yarn dbmi`；
- 每次发布新版本，如果涉及到数据库表结构的修改，需要在开发环境运行 `yarn dbmi` 生成迁移所需的 SQL 文件且自动存储于 `/prisma/..` 目录，然后一同提交代码；CI/CD 会在部署前通过 `yarn dbdeploy:prod` 运行这些迁移。

## 基础镜像

因为使用到 `puppeteer`、`git` 等工具，对运行环境有要求，Node.js 基础镜像无法满足需求，需要使用特定的基础镜像来运行。
注意，请不要使用 `-slim`、`-alpine` 类型的镜像，它们缺少一些指令（例如 `ps`）会导致某些功能运行时报错。

在文件 `Dockerfile` 中可以看到使用 [`paperplanecc/paperplane-api-base`](https://hub.docker.com/r/paperplanecc/paperplane-api-base) 作为基础镜像。
此镜像是专门为本项目准备、已事前构建好的。

也可以自行构建基础镜像，此处给出基础镜像的构建方式：

```Dockerfile
FROM node:20.13.0

RUN apt-get update 

RUN apt-get install -y git

RUN apt-get install -y wget gnupg

RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update 
    
RUN apt-get install -y fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf fonts-noto-color-emoji --no-install-recommends

RUN apt-get install -y google-chrome-stable libxss1 --no-install-recommends

RUN rm -rf /var/lib/apt/lists/*

ENV PUPPETEER_EXECUTABLE_PATH /usr/bin/google-chrome-stable

CMD ["google-chrome-stable"]
```

注意构建的步骤中需要访问 Google，请确保具备国际互联网访问能力。

## 问题排查

在 Apple Silicon 设备上运行失败时（一般发生于调用 `puppeteer` 的场景），可按照以下步骤解决问题：

- 打开 Docker Desktop；
- 使用快捷键 `Commend` + `,` 打开设置；
- 选择 “Features in development” 选项卡；
- 勾选 “Use Rosetta for x86/amd64 emulation on Apple Silicon”；
- 点击右下角 “Apply & restart”，使设置生效。
