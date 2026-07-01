// 基金估值网页 - 本地静态服务器
// 由 启动基金估值.bat 调用,也可手动: node server.js
const http = require("http");
const fs = require("fs");
const path = require("path");

const DIR = __dirname;
const PORT = 8765;
const ENTRY = "fund-valuation.html";

const MIME = {
  ".html": "text/html;charset=utf-8",
  ".js": "text/javascript;charset=utf-8",
  ".css": "text/css;charset=utf-8",
  ".json": "application/json;charset=utf-8",
  ".png": "image/png",
  ".ico": "image/x-icon"
};

const server = http.createServer((req, res) => {
  let urlPath = decodeURIComponent(req.url.split("?")[0]);
  if (urlPath === "/") urlPath = "/" + ENTRY;
  const filePath = path.join(DIR, urlPath);
  // 防目录穿越
  if (!filePath.startsWith(DIR)) { res.writeHead(403); res.end("403"); return; }
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end("404 Not Found"); return; }
    const ext = path.extname(filePath).toLowerCase();
    // 禁止缓存:保证每次拿到最新文件,避免浏览器用旧版JS(导致"添加没反应"等bug)
    res.writeHead(200, {
      "Content-Type": MIME[ext] || "application/octet-stream",
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      "Pragma": "no-cache",
      "Expires": "0"
    });
    res.end(data);
  });
});

server.on("error", (e) => {
  if (e.code === "EADDRINUSE") {
    console.log("端口 " + PORT + " 已被占用,可能服务器已在运行。");
    console.log("请直接在浏览器打开: http://localhost:" + PORT + "/");
  } else {
    console.log("启动失败: " + e.message);
  }
  setTimeout(() => process.exit(1), 300);
});

server.listen(PORT, () => {
  console.log("==================================================");
  console.log("  基金估值服务已启动");
  console.log("  访问地址: http://localhost:" + PORT + "/");
  console.log("  关闭本窗口即可停止服务");
  console.log("==================================================");
});
