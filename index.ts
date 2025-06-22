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
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap" rel="stylesheet">

  <title>${CONFIG.htmlTitle}</title>
  <style>
    :root {
      --primary-color: #4a90e2;
      --background-color: #f4f7f9;
      --card-background: #ffffff;
      --text-color: #333333;
      --subtle-text-color: #666666;
      --shadow-color: rgba(0, 0, 0, 0.08);
    }
    body {
      font-family: 'Inter', 'Arial', sans-serif;
      margin: 0;
      padding: 0;
      background-color: var(--background-color);
      color: var(--text-color);
      line-height: 1.6;
    }
    header {
      background: linear-gradient(135deg, #4a90e2, #007bff);
      color: white;
      padding: 40px 20px;
      text-align: center;
      border-bottom: 5px solid #3a7ac8;
    }
    header h1 {
      margin: 0;
      font-size: 2.5rem;
      font-weight: 700;
    }
    header b {
        display: inline-block;
        margin-top: 10px;
        background-color: rgba(255, 255, 255, 0.2);
        padding: 5px 15px;
        border-radius: 15px;
        font-size: 0.9rem;
    }
    main {
      padding: 30px 20px;
      max-width: 800px;
      margin: 0 auto;
    }
    main h2 {
        font-size: 1.8rem;
        border-bottom: 2px solid var(--primary-color);
        padding-bottom: 10px;
        margin-bottom: 10px;
    }
    .bookmarklet-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    .bookmarklet-item {
      background: var(--card-background);
      margin: 15px 0;
      border-radius: 10px;
      box-shadow: 0 4px 6px var(--shadow-color);
      padding: 20px 25px;
      transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
    }
    .bookmarklet-item:hover {
      transform: translateY(-3px);
      box-shadow: 0 7px 10px rgba(0, 0, 0, 0.12);
    }
    .bookmarklet-item a.bookmarklet {
      text-decoration: none;
      color: var(--primary-color);
      font-weight: bold;
      font-size: 1.3rem;
      display: inline-block;
      margin-bottom: 8px;
    }
    .bookmarklet-item a.bookmarklet:hover {
      text-decoration: underline;
    }
    .bookmarklet-desc {
      color: var(--subtle-text-color);
      font-size: 1rem;
      margin: 0;
    }
    footer {
      text-align: center;
      margin-top: 40px;
      padding: 20px;
      background-color: #343a40;
      color: white;
    }
    footer p {
        margin: 0;
    }
  </style>
</head>
<body>
  <header>
    <h1>${CONFIG.htmlTitle}</h1>
    <b>Version: ${version}</b>
  </header>

  <main>
    <h2>Available Bookmarklets</h2>
    <p>Drag these links to your bookmarks bar:</p>
    <ul class="bookmarklet-list">
      ${bookmarklets
        .map(
          (b) => `<li class="bookmarklet-item">
            <a href="${b.url}" title="${b.name}" class="bookmarklet">${b.name}</a>
            <p class="bookmarklet-desc">${b.description}</p>
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
