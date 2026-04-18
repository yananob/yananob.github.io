const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

const baseDir = 'runthetrail';

const template = (title, content, cssPath) => `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <link rel="stylesheet" href="${cssPath}">
</head>
<body>
${content}
</body>
</html>`;

function getAllMarkdownFiles(dirPath, arrayOfFiles) {
    const files = fs.readdirSync(dirPath);

    arrayOfFiles = arrayOfFiles || [];

    files.forEach(function(file) {
        if (fs.statSync(dirPath + "/" + file).isDirectory()) {
            arrayOfFiles = getAllMarkdownFiles(dirPath + "/" + file, arrayOfFiles);
        } else {
            if (file.endsWith(".md")) {
                arrayOfFiles.push(path.join(dirPath, "/", file));
            }
        }
    });

    return arrayOfFiles;
}

function processMarkdownFiles(directory) {
    const files = getAllMarkdownFiles(directory);

    files.forEach(filePath => {
        let content = fs.readFileSync(filePath, 'utf8');
        const filename = path.basename(filePath);

        // 1. Specific updates
        if (filename === 'privacy.md') {
            content = content.replace(/^# Privacy Policy/m, '# RUN THE TRAIL Privacy Policy');
        }

        content = content.replace(/a sole proprietorship/gi, 'a software development organization');

        if (filename === 'privacy.md' && !content.includes('software development organization')) {
             content = content.replace(/(created by \*\*RUN the TRAIL\*\*)/, '$1, a software development organization,');
        }

        // 2. Remove any content preceding the first occurrence of "RUN THE TRAIL" or the first H1
        // For apps, they might not have "RUN THE TRAIL" at the beginning, so we check for H1 too.
        const runTheTrailMatch = content.match(/RUN THE TRAIL/i);
        const h1Match = content.match(/^#\s+/m);

        let startIndex = -1;
        if (runTheTrailMatch && (h1Match === null || runTheTrailMatch.index < h1Match.index)) {
            startIndex = runTheTrailMatch.index;
        } else if (h1Match) {
            startIndex = h1Match.index;
        }

        if (startIndex > 0) {
            content = content.substring(startIndex);
            if (!content.startsWith('#')) {
                content = '# ' + content;
            }
        }

        // 3. Convert Markdown to HTML
        const htmlContent = marked.parse(content);

        // 4. Generate title dynamically from the first # header
        let title = 'RUN THE TRAIL';
        const titleMatch = content.match(/^#\s+(.+)$/m);
        if (titleMatch) {
            title = titleMatch[1].trim().replace(/\*\*/g, '').replace(/<[^>]*>?/gm, ''); // Remove bolding and tags
        }

        // 4.5 Calculate relative path to style.css
        const depth = filePath.split(path.sep).length - baseDir.split(path.sep).length - 1;
        const cssPath = (depth > 0 ? '../'.repeat(depth) : '') + 'style.css';

        const finalHtml = template(title, htmlContent, cssPath);

        // 5. Save as .html
        const outPath = filePath.replace('.md', '.html');
        fs.writeFileSync(outPath, finalHtml);
        console.log(`Generated ${outPath} (Title: ${title})`);
    });
}

processMarkdownFiles(baseDir);
