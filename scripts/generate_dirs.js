const fs = require('fs');
const path = require('path');

// 读取 README.md 文件
const readmePath = path.join(__dirname, '..', 'README.md');
const content = fs.readFileSync(readmePath, 'utf-8');

// 匹配 Markdown 链接格式：[文本](/路径/文件.md)
const linkRegex = /\[([^\]]+)\]\(([^\)]+)\)/g;
let match;

// 存储所有需要创建的目录和文件
const dirsToCreate = new Set();
const filesToCreate = new Set();

// 提取所有链接
while ((match = linkRegex.exec(content)) !== null) {
    const [, , filePath] = match;
    if (filePath.startsWith('/') && filePath.endsWith('.md')) {
        // 移除开头的 / 并获取完整路径
        const fullPath = path.join(__dirname, '..', filePath.slice(1));

        // 获取目录路径
        const dirPath = path.dirname(fullPath);
        dirsToCreate.add(dirPath);
        filesToCreate.add(fullPath);
    }
}

// 创建目录
for (const dir of dirsToCreate) {
    if (!fs.existsSync(dir)) {
        console.log(`创建目录: ${dir}`);
        fs.mkdirSync(dir, { recursive: true });
    }
}

// 创建文件（如果不存在）
for (const file of filesToCreate) {
    if (!fs.existsSync(file)) {
        console.log(`创建文件: ${file}`);
        fs.writeFileSync(file, `# ${path.basename(file, '.md')}\n\n> 待编写\n`, 'utf-8');
    }
}

console.log('目录结构生成完成！');