const { execSync } = require('child_process');
const iconv = require('iconv-lite');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function summarizeAndPush() {
    try {
        // 1. 暂存所有更改
        console.log('Staging all changes...');
        execSync('git add .');

        // 2. 获取已更改的文件列表以总结更改 (使用 --porcelain=v1)
        console.log('Getting changed files...');
        let changedFiles = [];
        try {
            // 使用 binary 编码获取原始 buffer，然后用 iconv-lite 解码
            const statusOutputBuffer = execSync('git status --porcelain=v1', { encoding: 'utf-8' });
            const lines = statusOutputBuffer.split('\n').filter(line => line.trim() !== '');

            lines.forEach(line => {
                // 匹配状态码和文件名，文件名可能包含空格并用引号括起来
                const match = line.trim().match(/^([A-Z]|\?){1,2}\s+"?(.*?)"?$/);
                if (match && match[2]) {
                    let filename = match[2];
                    // 对于重命名或复制的文件，Git status --porcelain=v1 的输出格式是 'R  old_name -> new_name'
                    // 我们需要提取 new_name
                    if (match[1].startsWith('R') || match[1].startsWith('C')) {
                        const renameMatch = filename.match(/^(.*?) -> (.*?)$/);
                        if (renameMatch && renameMatch[2]) {
                            filename = renameMatch[2];
                        }
                    }
                    changedFiles.push(filename);
                }
            });

        } catch (e) {
            console.error('Error getting git status:', e.message);
            // 如果获取状态失败，则无法继续，抛出错误或退出
            throw new Error('Failed to get git status.');
        }

        // 移除重复项 (虽然porcelain输出通常不重复，但以防万一)
        changedFiles = [...new Set(changedFiles)];

        // 3. 自动总结提交信息
        const commitMessage = `feat: update content\n\nChanged files:\n${changedFiles.join('\n')}`;
        console.log(`Generated commit message:\n${commitMessage}`);

        // 4. 提交更改前确认
        const commitConfirm = await askQuestion('Do you want to commit these changes? (y/n): ');
        if (commitConfirm.toLowerCase() !== 'y') {
            console.log('Commit aborted by user.');
            rl.close();
            return;
        }

        // 5. 提交更改
        console.log('Committing with message:', commitMessage);
        execSync(`git commit -m "${commitMessage}"`);
        console.log('Changes committed successfully.');

        // 6. 推送到 origin main 前确认
        const pushConfirm = await askQuestion('Do you want to push to origin main? (y/n): ');
        if (pushConfirm.toLowerCase() !== 'y') {
            console.log('Push aborted by user.');
            rl.close();
            return;
        }

        // 7. 推送到 origin main
        console.log('Pushing to origin main...');
        execSync('git push origin main');
        console.log('Successfully pushed to origin main.');

    } catch (error) {
        console.error('Error during Git operations:', error.message);
    } finally {
        rl.close();
    }
}

function askQuestion(query) {
    return new Promise(resolve => {
        rl.question(query, ans => {
            resolve(ans);
        });
    });
}

summarizeAndPush();