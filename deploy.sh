#!/bin/bash

# 确保脚本以 root 权限运行
if [ "$EUID" -ne 0 ]; then 
    echo "请使用 sudo 运行此脚本"
    exit 1
fi

# 更新包列表
echo "正在更新包列表..."
apt update

# 安装 Node.js
echo "正在安装 Node.js..."
apt install -y nodejs npm

# 安装 Apache2
echo "正在安装 Apache2..."
apt install -y apache2

# 安装 git
echo "正在安装 git..."
apt install -y git

# 创建临时目录
temp_dir=$(mktemp -d)
cd "$temp_dir"

# 克隆仓库
echo "正在下载游戏代码..."
git clone https://github.com/robertsong2000/game_collection.git
if [ $? -ne 0 ]; then
    echo "下载代码失败"
    exit 1
fi

# 复制游戏文件到 Apache 目录
echo "正在部署游戏文件..."
rm -rf /var/www/html/*
cp -r game_collection/* /var/www/html/

# 设置适当的权限
chown -R www-data:www-data /var/www/html
chmod -R 755 /var/www/html

# 进入网站目录并启动 Node.js 服务器
echo "启动 Node.js 服务器..."
cd /var/www/html
nohup node server.js > /var/log/node-server.log 2>&1 &

# 保存进程 ID 以便后续管理
echo $! > /var/run/game-server.pid

# 清理临时文件
cd /
rm -rf "$temp_dir"

# 验证安装
echo "验证安装..."
node_version=$(node -v)
apache_version=$(apache2 -v | grep "Server version")

echo "安装完成！"
echo "Node.js 版本: $node_version"
echo "Apache2 版本: $apache_version"
echo "Apache2 服务状态:"
systemctl status apache2 | grep Active

echo -e "\n游戏集合已部署到 http://localhost 或 http://服务器IP"
echo "Node.js 服务器已在后台启动"
echo "服务器日志位于: /var/log/node-server.log"
echo "服务器 PID 保存在: /var/run/game-server.pid" 