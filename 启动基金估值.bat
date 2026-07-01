@echo off
chcp 936 >nul
title 基金估值实时计算
cd /d "%~dp0"

echo.
echo   正在启动基金估值网页服务...
echo.

rem 探测 Node.js:优先系统 node,回退到 WorkBuddy 托管版
set "NODE_EXE="
where node >nul 2>nul
if %errorlevel%==0 (
    set "NODE_EXE=node"
) else (
    if exist "%USERPROFILE%\.workbuddy\binaries\node\versions\22.22.2\node.exe" (
        set "NODE_EXE=%USERPROFILE%\.workbuddy\binaries\node\versions\22.22.2\node.exe"
    )
)

if "%NODE_EXE%"=="" (
    echo   [错误] 未找到 Node.js,无法启动服务器。
    echo   请先安装 Node.js: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo   已找到 Node,开始启动...
echo   服务地址: http://localhost:8765/
echo   稍后将自动打开浏览器,关闭本窗口即停止服务。
echo.

rem 延迟后用默认浏览器打开固定地址(独立进程,不阻塞服务器)
start "" cmd /c "timeout /t 2 >nul & start "" http://localhost:8765/"

rem 前台运行服务器:关闭本窗口即停止
"%NODE_EXE%" "%~dp0server.js"

echo.
echo   服务已停止。
pause
