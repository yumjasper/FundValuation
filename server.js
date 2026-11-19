// 基金估值网页 - 本地静态服务器
// 由 启动基金估值.bat 调用,也可手动: node server.js
const http = require("http");
const https = require("https");
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

// ---- 历史净值代理:解决浏览器跨域/Referer 限制 ----
// 前端请求 /api/lsjz?code=014805&page=1&per=40
// 由本进程带正确 Referer 转发到天天基金 JSON 接口,原样回传 JSON
function proxyLsjz(req, res) {
  const q = new URLSearchParams(req.url.split("?")[1] || "");
  const code = (q.get("code") || "").replace(/[^0-9]/g, "");
  const page = parseInt(q.get("page") || "1", 10) || 1;
  const per = Math.min(parseInt(q.get("per") || "40", 10) || 40, 200);
  if (!code) { res.writeHead(400, { "Content-Type": "application/json;charset=utf-8" }); res.end('{"ErrCode":-1,"ErrMsg":"missing code"}'); return; }
  const target = `https://api.fund.eastmoney.com/f10/lsjz?fundCode=${code}&pageIndex=${page}&pageSize=${per}&_=${Date.now()}`;
  const opt = {
    headers: {
      "Referer": "https://fundf10.eastmoney.com/",
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
      "Accept": "application/json, text/plain, */*"
    }
  };
  https.get(target, opt, (up) => {
    let buf = [];
    up.on("data", (c) => buf.push(c));
    up.on("end", () => {
      const body = Buffer.concat(buf).toString("utf8");
      res.writeHead(200, {
        "Content-Type": "application/json;charset=utf-8",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-store"
      });
      res.end(body);
    });
  }).on("error", (e) => {
    res.writeHead(502, { "Content-Type": "application/json;charset=utf-8" });
    res.end(JSON.stringify({ ErrCode: -2, ErrMsg: "proxy error: " + e.message }));
  });
}

const server = http.createServer((req, res) => {
  let urlPath = decodeURIComponent(req.url.split("?")[0]);
  if (urlPath === "/api/lsjz") { proxyLsjz(req, res); return; }
  if (urlPath === "/") urlPath = "/" + ENTRY;
  let filePath = path.join(DIR, urlPath);
  // 防目录穿越
  if (!filePath.startsWith(DIR)) { res.writeHead(403); res.end("403"); return; }
  // 目录请求(如 /014805 或 /014805/)自动补 index.html
  try {
    if (fs.statSync(filePath).isDirectory()) filePath = path.join(filePath, "index.html");
  } catch (e) { /* 不存在则交给下面 readFile 返回 404 */ }
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
