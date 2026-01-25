# 部署指南

本项目支持多种静态网站托管平台，包括 GitHub Pages、Vercel、Netlify 等。

## GitHub Pages 部署

### 方法一：使用 GitHub Actions（推荐）

1. **启用 GitHub Pages**
   - 进入仓库的 Settings → Pages
   - Source 选择 "GitHub Actions"

2. **配置 Secrets（可选）**
   - 进入 Settings → Secrets and variables → Actions，按需添加：
   - `SITE_URL`：站点地址。未设置时默认为 `https://<用户名>.github.io/<仓库名>/`；自定义域名时设为 `https://你的域名/`。
   - `BASE_PATH`：仅在使用自定义域名且站点在根路径时设置，Value 填 `/`。未设置时自动为 `/<仓库名>/`（项目站必须如此，否则会出现 “does not contain the requested file” / 缺 `index.html`）。

3. **推送代码**
   - 将代码推送到 `main` 分支
   - GitHub Actions 会自动构建并部署到 GitHub Pages

4. **访问网站**
   - 部署完成后，访问：`https://<你的用户名>.github.io/<仓库名>/`

### 方法二：手动部署

1. 本地构建：
   ```bash
   pnpm build
   ```

2. 将 `dist` 目录的内容推送到 `gh-pages` 分支

## Vercel 部署

1. 将代码推送到 GitHub
2. 在 [Vercel](https://vercel.com) 导入项目
3. Vercel 会自动检测 Astro 项目并完成部署

## Netlify 部署

1. 将代码推送到 GitHub
2. 在 [Netlify](https://www.netlify.com) 导入项目
3. 构建命令：`pnpm build`
4. 发布目录：`dist`

## 环境变量配置

如果需要使用环境变量配置 site URL，可以在以下位置设置：

- **GitHub Actions**: 在仓库的 Secrets 中设置 `SITE_URL`
- **Vercel**: 在项目设置中添加环境变量 `SITE_URL`
- **Netlify**: 在站点设置中添加环境变量 `SITE_URL`

## 自定义域名

如果使用自定义域名：

1. 在 `astro.config.mjs` 中设置 `site` 为你的域名
2. 在托管平台配置域名解析
3. 确保域名以 `/` 结尾（如 `https://example.com/`）

## 注意事项

- GitHub Pages 的 base path 如果仓库名不是 `fuwari`，需要设置为 `/<仓库名>/`
- 确保 `trailingSlash` 设置为 `"always"` 以保持 URL 一致性
- 构建前确保所有依赖都已安装
