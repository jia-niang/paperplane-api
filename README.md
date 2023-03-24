# PaperPlane API

## 本地调试开发

本项目对系统内已安装的应用有要求：

- 需求 Chrome，因为用到了 `puppeteer`；
- 需求 Git，因为用到了 `simple-git`；
- 请注意 `canvas` 如果二进制包下载失败，会尝试在本地构建，此时极容易出错。

为了让本地和云端环境一致，建议使用 Docker 镜像运行。

## 本机 Docker 运行（推荐）

```bash
# 启动
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
在文件 `Dockerfile` 中可以看到使用 `paperplanecc/paperplane-api-base` 作为基础镜像。

此处给出基础镜像的构建方式：

```Dockerfile
FROM node:19-slim

RUN apt-get update && apt-get install -y git

RUN apt-get update \
    && apt-get install -y wget gnupg \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
      --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

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