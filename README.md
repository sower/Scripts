# 自用脚本

## 项目概述

这是一个用于存放个人常用脚本的仓库，包含 Tampermonkey 脚本和 Bookmarklet 脚本，用于提升日常浏览和工作效率。

## 项目信息

- **依赖管理**: 使用 Bun 环境运行
- **技术栈**: TypeScript, Terser (JavaScript 压缩)

## 目录结构

- `tampermonkey/`：存放 Tampermonkey 脚本
- `bookmarklet/`：存放 Bookmarklet 脚本

## 安装与使用

### 安装依赖

```bash
bun install
```

### 构建 Bookmarklet

```bash
bun run build
```

## 脚本管理

### Tampermonkey 脚本

Tampermonkey 脚本存放在 `tampermonkey/` 目录下，可直接导入油猴使用。

### Bookmarklet 脚本

Bookmarklet 脚本存放在 `bookmarklet/` 目录下，构建后会生成 HTML 页面供下载和使用。
