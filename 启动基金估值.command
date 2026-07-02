#!/bin/bash
# 基金估值实时计算 —— macOS 启动脚本
# 双击本文件即可运行(首次可能需要授权,见文件末尾说明)

# 切换到脚本所在目录
cd "$(dirname "$0")" || exit 1

echo ""
echo "  正在启动基金估值网页服务..."
echo ""

# 探测 Node.js:依次尝试 系统 PATH -> Homebrew(Apple Silicon/Intel) -> WorkBuddy 托管版
NODE_EXE=""
if command -v node >/dev/null 2>&1; then
  NODE_EXE="$(command -v node)"
elif [ -x "/opt/homebrew/bin/node" ]; then
  NODE_EXE="/opt/homebrew/bin/node"
elif [ -x "/usr/local/bin/node" ]; then
  NODE_EXE="/usr/local/bin/node"
elif [ -x "$HOME/.workbuddy/binaries/node/versions/22.22.2/bin/node" ]; then
  NODE_EXE="$HOME/.workbuddy/binaries/node/versions/22.22.2/bin/node"
fi

if [ -z "$NODE_EXE" ]; then
  echo "  [错误] 未找到 Node.js,无法启动服务器。"
  echo "  请先安装 Node.js: https://nodejs.org/"
  echo "  或用 Homebrew 安装: brew install node"
  echo ""
  echo "  按回车键关闭本窗口..."
  read -r
  exit 1
fi

echo "  已找到 Node: $NODE_EXE"
echo "  服务地址: http://localhost:8765/"
echo "  稍后将自动打开浏览器,按 Ctrl+C 或关闭本窗口即停止服务。"
echo ""

# 延迟 2 秒后用默认浏览器打开固定地址(后台子进程,不阻塞服务器)
( sleep 2; open "http://localhost:8765/" ) &

# 前台运行服务器:关闭本窗口或 Ctrl+C 即停止
"$NODE_EXE" "$(dirname "$0")/server.js"

echo ""
echo "  服务已停止。按回车键关闭本窗口..."
read -r
