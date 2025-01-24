#!/usr/bin/env node
const WebSocket = require('ws');
const readline = require('readline');
const chalk = require('chalk');

// 创建命令行交互界面
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// 配置
const CONFIG = {
    SERVER_URL: 'ws://121.196.205.225:9999',
    PASSWORD: '9527'
};

let username = '';
let ws = null;

// 清屏函数
function clearScreen() {
    process.stdout.write('\x1Bc');
}

// 显示欢迎信息
function showWelcome() {
    console.log(chalk.green('=== 神秘树洞聊天室 ==='));
    console.log(chalk.gray('输入 /quit 退出聊天室'));
    console.log(chalk.gray('输入 /clear 清屏'));
    console.log('------------------------');
}

// 连接WebSocket服务器
function connectToServer() {
    ws = new WebSocket(CONFIG.SERVER_URL);

    ws.on('open', () => {
        console.log(chalk.green('✓ 已连接到聊天室'));
        // 发送加入消息
        ws.send(JSON.stringify({
            type: 'join',
            username: username
        }));
    });

    ws.on('message', (data) => {
        try {
            const message = JSON.parse(data);
            if (message.username === 'System') {
                console.log(chalk.yellow(`${message.message}`));
            } else {
                const isOwnMessage = message.username === username;
                const formattedMessage = isOwnMessage ? 
                    chalk.green(`${message.username}: ${message.message}`) :
                    chalk.blue(`${message.username}: ${message.message}`);
                console.log(formattedMessage);
            }
        } catch (error) {
            console.error('Error processing message:', error);
        }
    });

    ws.on('error', (error) => {
        console.error(chalk.red('连接错误:', error.message));
    });

    ws.on('close', () => {
        console.log(chalk.red('已断开连接'));
        process.exit(0);
    });
}

// 处理用户输入
function handleUserInput() {
    rl.question('', (input) => {
        if (input.trim() === '/quit') {
            console.log(chalk.yellow('再见！'));
            ws.close();
            rl.close();
            return;
        }

        if (input.trim() === '/clear') {
            clearScreen();
            showWelcome();
            handleUserInput();
            return;
        }

        if (input.trim()) {
            ws.send(JSON.stringify({
                type: 'message',
                username: username,
                message: input
            }));
        }

        handleUserInput();
    });
}

// 登录流程
function login() {
    clearScreen();
    console.log(chalk.green('=== 神秘树洞聊天室 ==='));
    
    rl.question(chalk.blue('请输入你的用户名: '), (name) => {
        username = name.trim() || `游客${Math.floor(Math.random() * 1000)}`;
        
        rl.question(chalk.blue('请输入密码: '), (password) => {
            if (password === CONFIG.PASSWORD) {
                clearScreen();
                showWelcome();
                connectToServer();
                handleUserInput();
            } else {
                console.log(chalk.red('密码错误！'));
                login();
            }
        });
    });
}

// 启动程序
login(); 