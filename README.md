# PaperPlane API [![Build Status](https://drone.paperplane.cc/api/badges/jia-niang/paperplane-api/status.svg)](https://drone.paperplane.cc/jia-niang/paperplane-api)

网站后台，同时也为 https://app.paperplane.cc 提供 API 支持。  
[原始代码仓库](https://git.paperplane.cc/jia-niang/paperplane-api) · [Github 代码镜像](https://github.com/PaperplaneJS/webapi) · [CI/CD](https://drone.paperplane.cc/jia-niang/paperplane-api)

# 运行需求

本项目对系统内已安装的应用有要求：

- 必须已安装 Node.js 20 及以上版本，这是必须的运行条件；
- 如果有用到 `puppeteer` 相关功能（例如每日下班提醒生成图片），则需求已安装 Chrome/Chromium；
- 如果有用到 `simple-git` 相关功能（例如 Git 周报助手），则需求已安装 Git。

为了让本地和云端环境一致，建议使用 Docker 来运行，项目中随附有相关配置，见下文。

---

本项目对外部服务有要求：

- 必须能正常连接 PostgreSQL、Redis、RabbitMQ，否则无法启动；
- 必须配置 OpenAI 或 Azure OpenAI 的令牌不为空，否则会导致 SDK 初始化失败报错；
- 如果用到文件存储相关功能（例如每日下班提醒生成图片），则需求正确配置兼容 S3 规范的存储服务；
- 如果用到第三方数据接口（例如每日下班提醒生成图片），则需求正确配置百度地图和聚合数据等第三方数据 API 令牌；
- 企微相关功能需要配置 IP 白名单，聚合数据、OpenAI 等服务需要网络连接通畅；
- 如果用到本机运行状态相关功能，则需求能连接到 Docker Engine API。

这些配置均写在 `.env`、`.env.example` 中，可以参照其中的注释来设置。

---

注意：现在不再使用 `@nestjs/config` 来配置环境变量，因为其他工具（例如 `prisma`）并不能通过它来读取变量，所以现在统一使用 `dotenv` 配置，这导致环境变量文件更改后，必须重新运行项目才能生效。

# 运行指南

## macOS 在 Docker 中运行

此运行方式需要已安装 Docker。  
此运行方式对环境依赖较小，且可以做到和部署后的服务端环境保持一致，推荐使用此方式来运行。

```bash
# 启动
docker compose up

# 如果需要执行其它命令，可以进入容器的 bash
docker exec -it paperplane-api-local bash
```

如果遇到启动问题以及 puppeteer 报错，可以参考文末的疑难解答部分。

## Windows 通过 wsl2 在 Docker 中运行

不推荐直接在 Windows 中启动 Docker 进行开发，因为 Windows 系统和 Docker 容器之间的文件交互性能较差，挂载目录可能无法即时监听文件更改，表现为启动项目极慢、更改了代码后不能马上重新编译等问题。

推荐使用 wsl2 创建一个 Ubuntu 子系统，在其中使用 Docker 并配合 VSCode 的远程开发能力来进行开发。

步骤：

- 本机已安装 [wsl2](https://learn.microsoft.com/zh-cn/windows/wsl/install)；
- 本机已安装 Docker，并在安装时选择 “使用 wsl2 引擎”，或是在 wsl2 中自行安装 Docker；
- 在 VSCode 中安装远程开发套件，[点此链接安装](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.vscode-remote-extensionpack)，它包含了 SSH 远程开发、容器远程开发等多个工具，可以直接连接 wsl，且连接后会自动初始化远程环境；如果你使用了其他的编辑器 / IDE，请自行寻找对应的插件。

> 你也可以只安装 [WSL 扩展](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-wsl)，此时也可以连接到 wsl，但 Git 等工具还需要手动安装一遍（指令 `sudo apt-get update && sudo apt-get install git`），所以不推荐单独使用这个扩展。

安装扩展后，VSCode 左侧边栏会出现 “远程资源管理器”，此时便可以在 wsl 子系统中克隆仓库并打开。  
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

## 使用 VSCode 的 “开发容器” 在 Docker 中运行

此方式可利用隔离环境测试某个代码分支、某次提交或某次拉取请求，这些场合首选此方式运行项目。

此方法会使用 `.devcontainer` 目录以及其中的配置文件，请确保已安装 Docker 以及 VSCode [远程开发扩展](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.vscode-remote-extensionpack)。

步骤：

- 点击 VSCode 左侧边栏的 “远程资源管理器”；
- 下拉菜单选择 “开发容器”，此处会列出当前运行的 Docker 容器；
- 点击 “+” 图标，在弹出的菜单中选择 “在容器中打开当前文件夹”，此时 VSCode 会自动创建一个 Docker 容器，将拷贝项目文件放入并连接到容器内的文件系统和终端，此时请稍作等待，因为 VSCode 需要在容器中安装扩展以及 Git 等工具；
- 这种方式不会自动安装依赖，请打开终端并运行 `yarn`，依赖安装完成后，可以运行 `yarn dev` 启动项目。

注意 Windows 系统下直接启动开发容器，修改文件仍然无法及时反馈到容器中。如果有实时调试的需求，请在 wsl 环境中克隆项目并从中启动开发容器。

## 本机直接运行

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

需要注意的是，puppeteer 调用浏览器时，浏览器窗口可能会一闪而过；同时浏览器的默认字体在 Windows、macOS、Linux 系统上均不同，显示效果也会存在差异，使用 Docker 运行则不会有此问题。

# 关于 Prisma

项目使用 `prisma` 来持久化存储数据库表结构关系，建议安装 IDE 扩展（[VSCode 扩展](https://marketplace.visualstudio.com/items?itemName=Prisma.prisma)）。

特性：

- 开发调试时，通过 `/prisma/schema.prisma` 来修改数据库表结构，修改后通过执行 `yarn dbgen` 生成新的 TypeScript 类型；
- 如果使用 VSCode，建议在执行 `yarn dbgen` 后使用快捷键 `Ctrl/Command` + `Shift` + `P`，选择 “重启 TS 服务器” 加载新类型；
- 在全新的环境开发时，请先手动执行一次 `yarn dbpush` 来把定义好的数据结构应用于当前数据库；后续请勿再执行此命令，否则必须丢弃全部数据才能执行 `yarn dbmi`；
- 每次发布新版本，如果涉及到数据库表结构的修改，需要在开发环境运行 `yarn dbmi` 生成迁移所需的 SQL 文件且自动存储于 `/prisma/..` 目录，然后一同提交代码；CI/CD 会在部署前通过 `yarn dbdeploy:prod` 运行这些迁移。

# 疑难解答

## 关于基础镜像

因为使用到 `puppeteer`、`git` 等工具，对运行环境有要求，Node.js 基础镜像无法满足需求，需要使用特定的基础镜像来运行。
注意，请不要使用 `-slim`、`-alpine` 类型的镜像，它们缺少一些指令（例如 `ps`）会导致某些功能运行时报错。

在文件 `Dockerfile` 中可以看到使用 [`paperplanecc/paperplane-api-base`](https://hub.docker.com/r/paperplanecc/paperplane-api-base) 作为基础镜像。  
此镜像是专门为本项目准备、已事前构建好的。

也可以自行构建基础镜像，此处给出基础镜像的构建方式：

```Dockerfile
FROM node:20.13.0

RUN apt-get update

RUN apt-get install -y git

RUN apt-get install -y chromium --no-install-recommends

RUN apt-get install -y fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf fonts-noto-color-emoji  --no-install-recommends

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true

ENV PUPPETEER_EXECUTABLE_PATH /usr/bin/chromium
```

构建的步骤中需要访问 Google，请确保具备国际互联网访问能力。  
因为 Chrome 在非 macOS 的 arm64 平台没有提供二进制包，所以使用 Chromium 浏览器。

## macOS 的 Docker 问题

注：目前已提供 arm 架构的基础镜像，以下这些因为芯片架构导致的问题不再会遇到了。

出现 “Rosetta is only intended to run on Apple Silicon with a macOS host using Virtualization.framework with Rosetta mode enabled” 问题时：

- 请将 Docker Desktop 更新到最新版，这是关键步骤；
- 使用快捷键 `Commend` + `,` 打开设置；
- 确保 “Use Virtualization framework” 已勾选；
- 点击右下角 “Apply & restart”，使设置生效。

调用 prisma 时出现 “assertion failed [block != nullptr]: BasicBlock requested for unrecognized address” 等问题时：

- 建议将 Docker Desktop 更新到最新版；
- 使用快捷键 `Commend` + `,` 打开设置；
- 确保 “Use Virtualization framework” 已勾选；
- 建议勾选 “Use containerd for pulling and storing images”，注意勾选此选项并接受后，Docker 将清空所有镜像和容器，就像被重新安装了一样；
- 如果勾选 “Use Rosetta for x86/amd64 emulation on Apple Silicon”，则会使用 Rosetta2 对非 arm 的容器进行转译运行，这可以解决本项目曾遇到的 puppeteer 无法运行的问题，不勾选则使用 QEMU 来模拟 x86_64 环境，此处推荐勾选，并结合上一条步骤一同使用；
- 点击右下角 “Apply & restart”，使设置生效。
