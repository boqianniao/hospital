#!/bin/bash

# 医院前端项目启动脚本 (macOS/Linux)
# 使用方法: ./start.sh

set -e

echo "🏥 启动医院前端项目..."
echo ""

# 检查 JDK 环境
if [ -z "$JAVA_HOME" ]; then
    echo "❌ 错误: 未找到 JAVA_HOME 环境变量"
    echo "请先安装 JDK 21 或更高版本"
    exit 1
fi

JWEBSERVER="$JAVA_HOME/bin/jwebserver"

if [ ! -f "$JWEBSERVER" ]; then
    echo "❌ 错误: 未找到 jwebserver 工具"
    echo "位置: $JWEBSERVER"
    echo "请确保使用 JDK 18 或更高版本"
    exit 1
fi

# 配置端口
PORT=5500
BASE_URL="http://localhost:$PORT/index.html"

echo "📁 前端目录: $(pwd)"
echo "🌐 访问地址: $BASE_URL"
echo ""
echo "正在启动静态服务器..."
echo "按 Ctrl+C 停止服务"
echo ""

# 延迟打开浏览器（等待服务器启动）
(
    sleep 2
    if command -v open &> /dev/null; then
        open "$BASE_URL"
    elif command -v xdg-open &> /dev/null; then
        xdg-open "$BASE_URL"
    else
        echo "⚠️  无法自动打开浏览器，请手动访问: $BASE_URL"
    fi
) &

# 启动静态服务器
"$JWEBSERVER" -p "$PORT"
