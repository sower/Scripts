import { minify } from "terser";
import { readdir, readFile, mkdir, writeFile, access, stat, rm } from "fs/promises";
import path from "path";

// 配置参数
const CONFIG = {
  inputDir: "./bookmarklet", // 源文件目录
  outputFile: "./dist/bookmarklet.html", // 输出文件
  htmlTitle: "Ylem's Bookmarklet Collection", // 页面标题
};

// 小书签定义
interface BookmarkletResult {
  name: string;
  description: string;
  url: string;
}

async function buildBookmarklet(file: string): Promise<BookmarkletResult> {
  const filePath = path.join(CONFIG.inputDir, file);
  const code = await readFile(filePath, "utf8");

  // 文件顶部可选的注释 (提取描述)
  const firstLine = code.split("\n")[0];
  // @ts-ignore
  const description = firstLine.startsWith("//") ? firstLine.replace("//", "").trim() : "";

  // 使用terser压缩混淆
  const result = await minify(code, {
    mangle: { toplevel: true },
    compress: { drop_console: false },
    format: {
      comments: false,
    },
  });

  // 转换为Bookmarklet格式
  let name = path.basename(file, ".js");
  // 处理文件名：替换 . 和 - 为空格，并将首字母大写
  name = name.replace(/[.-]/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
  const encoded = encodeURIComponent(`(function(){${result.code}})();`);
  return { name, description, url: `javascript:${encoded}` };
}

async function generateBookmarklets() {
  try {
    const outputDir = path.dirname(CONFIG.outputFile);

    // 检查并清空输出目录
    if (await directoryExists(outputDir)) {
      await emptyDirectory(outputDir);
    }

    // 创建输出目录
    await mkdir(outputDir, { recursive: true });

    // 获取所有JS文件
    const files = (await readdir(CONFIG.inputDir)).filter((f) => f.endsWith(".js"));

    if (files.length === 0) {
      console.log("No JS files found in directory:", CONFIG.inputDir);
      return;
    }

    // 处理每个文件
    const bookmarklets = await Promise.all(files.map(buildBookmarklet));

    // 读取package.json版本号
    const version = await readPackageVersion();

    // 生成HTML
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="A collection of useful bookmarklets for myself using in daily life.">

  <title>${CONFIG.htmlTitle}</title>
  <style>
    body {
      font-family: 'Arial', sans-serif;
      margin: 0;
      padding: 0;
      background: #f9f9f9;
      color: #333;
    }
    header {
      background-color: #007bff;
      color: white;
      padding: 20px;
      text-align: center;
    }
    header h1 {
      margin: 0;
      font-size: 2rem;
    }
    main {
      padding: 20px;
      max-width: 800px;
      margin: 0 auto;
    }
    .bookmarklet-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    .bookmarklet-item {
      background: white;
      margin: 10px 0;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      padding: 15px 20px;
      display: flex;
      transition: box-shadow 0.2s ease;
    }
    .bookmarklet-item:hover {
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }
    .bookmarklet-item a {
      text-decoration: none;
      color: #007bff;
      font-weight: bold;
      font-size: 1.2rem;
    }
    .bookmarklet-item a:hover {
      text-decoration: underline;
    }
    .bookmarklet-desc {
      color: #666;
      font-size: 0.9rem;
      margin-top: 5px;
    }
    footer {
      text-align: center;
      margin-top: 20px;
      padding: 20px 0;
      background: #007bff;
      color: white;
    }
  </style>
</head>
<body>
  <header>
    <h1>${CONFIG.htmlTitle}</h1>
    <b>Version: ${version}</b>
  <header/>

  <main>
    <h2>Available Bookmarklets</h2>
    <p>Drag these links to your bookmarks bar:</p>
    <ul class="bookmarklet-list">
      ${bookmarklets
        .map(
          (b) => `<li class="bookmarklet-item">
            <div><a href="${b.url}" title="${b.name}" class="bookmarklet">${b.name}</a>
            <p class="bookmarklet-desc">${b.description}</p>
            </div>
          </li>`
        )
        .join("")}
    </ul>
  </main>
  <footer>
    <p>Generated with ❤️ by Ylem</p>
  </footer>
</body>
</html>`;

    // 写入文件
    await writeFile(CONFIG.outputFile, htmlContent);
    console.log(`Generated ${bookmarklets.length} bookmarklets to ${CONFIG.outputFile}`);
  } catch (error) {
    console.error("Generation failed:", error);
  }
}

// 检查目录是否存在
async function directoryExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

// 清空目录
async function emptyDirectory(dirPath: string): Promise<void> {
  const items = await readdir(dirPath);
  for (const item of items) {
    const fullPath = path.join(dirPath, item);
    const stats = await stat(fullPath);
    if (stats.isDirectory()) {
      await emptyDirectory(fullPath);
      await rm(fullPath, { recursive: true });
    } else {
      await rm(fullPath);
    }
  }
}

// 读取package.json版本号
async function readPackageVersion(): Promise<string> {
  const packageJsonPath = path.join(process.cwd(), "package.json");
  const packageJson = JSON.parse(await readFile(packageJsonPath, "utf8"));
  return packageJson.version || "Unknown";
}

generateBookmarklets();
