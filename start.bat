@echo off
chcp 65001 >nul

REM 医院前端项目启动脚本 (Windows)
REM 使用方法: 双击运行 或 命令行执行 start.bat

echo 🏥 启动医院前端项目...
echo.

REM 检查 JDK 环境
if "%JAVA_HOME%"=="" (
    echo ❌ 错误: 未找到 JAVA_HOME 环境变量
    echo 请先安装 JDK 21 或更高版本
    pause
    exit /b 1
)

set "JWEBSERVER=%JAVA_HOME%\bin\jwebserver.exe"

if not exist "%JWEBSERVER%" (
    echo ❌ 错误: 未找到 jwebserver 工具
    echo 位置: %JWEBSERVER%
    echo 请确保使用 JDK 18 或更高版本
    pause
    exit /b 1
)

REM 配置端口和访问地址
set PORT=5500
set "BASE_URL=http://localhost:%PORT%/index.html"

echo 📁 前端目录: %CD%
echo 🌐 访问地址: %BASE_URL%
echo.
echo 正在启动静态服务器...
echo 按 Ctrl+C 停止服务
echo.

REM 延迟打开浏览器（使用 PowerShell 实现）
powershell -Command "Start-Sleep -Seconds 2; Start-Process '%BASE_URL%'" >nul 2>&1

REM 启动静态服务器
"%JWEBSERVER%" -p %PORT%
