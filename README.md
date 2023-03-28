# PaperPlane API

## 本地调试开发

本项目对系统内已安装的应用有要求：

- 需求 Chrome，因为用到了 `puppeteer`；
- 需求 Git，因为用到了 `simple-git`；
- 请注意 `canvas` 如果二进制包下载失败，会尝试在本地构建，此时极容易出错。

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

请注意：在 Windows 系统下，Docker 的挂载目录可能无法即时监听文件更改，表现为更改了代码后不会及时重新编译。
因此推荐使用 wsl2 配合 VSCode 的 [WSL 扩展](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-wsl) 来进行开发。

Windows 使用 wsl2 运行本项目的准备工作：

- 本机已安装 [wsl2](https://learn.microsoft.com/zh-cn/windows/wsl/install)；
- 本机已安装 Docker，并在安装时选择 “使用 wsl2 引擎”，或是在 wsl2 中已安装 Docker；
- 在 VSCode 中安装 WSL 扩展，[点此链接](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-wsl)；
- 在 wsl 子系统中，需要安装 Git，可以这样做：`sudo apt-get update && sudo apt-get install git`。

安装 WSL 扩展后，VSCode 左侧边栏会出现 “远程资源管理器”，此时便可以在 wsl 子系统中克隆仓库并打开。
建议转到 VSCode “扩展” 页面，部分扩展需要在子系统中重新安装一遍。

首次运行前需执行的指令（仅需执行一次，用于拷贝 ssh 密钥）：

```bash
# 请在 Windows 的命令行输入：
wsl

# 此时进入 wsl 子系统中

# 先复制 .ssh
cp -r .ssh ~/

# 设置正确的权限，这一步可能会要求输入密码
chmod 600 ~/.ssh/*
```

运行项目：
打开 VSCode 终端，此时终端已连接到 wsl 子系统中，执行：

```bash
# 启动项目
docker compose up

# 如果需要执行其它命令，可以进入容器的 bash
docker exec -it paperplane-api-local bash
```


## 本机运行

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

## 基础镜像

因为使用到 `puppeteer`、`git` 等工具，对运行环境有要求，Node.js 基础镜像无法满足需求，需要使用特定的基础镜像来运行。
注意，请不要使用 `-slim`、`-alpine` 类型的镜像，它们会导致开发运行时报错重启。

在文件 `Dockerfile` 中可以看到使用 `paperplanecc/paperplane-api-base` 作为基础镜像。

此处给出基础镜像的构建方式：

```Dockerfile
FROM node:19

RUN apt-get update && apt-get install -y git

RUN apt-get update \
    && apt-get install -y wget gnupg \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
      --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

ENV PUPPETEER_EXECUTABLE_PATH /usr/bin/google-chrome-stable

CMD ["google-chrome-stable"]
```

构建和推送镜像：

```bash
docker build -t paperplanecc/paperplane-api-base:latest .
docker push paperplanecc/paperplane-api-base
```

这些步骤需要访问 Google，需要国际互联网访问能力。

## 问题排查

在 Apple Silicon 设备上运行失败时，可按照以下步骤解决问题：

- 打开 Docker Desktop；
- 使用快捷键 `Commend` + `,` 打开设置；
- 选择 “Features in development” 选项卡；
- 勾选 “Use Rosetta for x86/amd64 emulation on Apple Silicon”；
- 点击右下角 “Apply & restart”，使设置生效。
