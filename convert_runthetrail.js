const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

const baseDir = 'runthetrail';

const template = (title, content) => `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 2rem;
        }
        h1, h2, h3 { color: #111; border-bottom: 1px solid #eee; padding-bottom: 0.3rem; }
        a { color: #0066cc; text-decoration: none; }
        a:hover { text-decoration: underline; }
        hr { border: 0; border-top: 1px solid #eee; margin: 2rem 0; }
        ul { padding-left: 1.5rem; }
        p { margin: 1rem 0; }
        pre { background: #f6f8fa; padding: 1rem; overflow: auto; border-radius: 6px; }
        code { font-family: ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, Liberation Mono, monospace; font-size: 85%; }
    </style>
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

        const finalHtml = template(title, htmlContent);

        // 5. Save as .html
        const outPath = filePath.replace('.md', '.html');
        fs.writeFileSync(outPath, finalHtml);
        console.log(`Generated ${outPath} (Title: ${title})`);
    });
}

processMarkdownFiles(baseDir);
