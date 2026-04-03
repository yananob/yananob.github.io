const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

const dir = 'runthetrail';

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
    </style>
</head>
<body>
${content}
</body>
</html>`;

function processMarkdownFiles(directory) {
    const files = fs.readdirSync(directory).filter(file => file.endsWith('.md'));

    files.forEach(filename => {
        const filePath = path.join(directory, filename);
        let content = fs.readFileSync(filePath, 'utf8');

        // 1. Specific title updates before stripping
        if (filename === 'privacy.md') {
            // Ensure title is consistent
            content = content.replace(/^# Privacy Policy/m, '# RUN THE TRAIL Privacy Policy');
        }

        // 2. Identify RUN THE TRAIL as a software development organization
        // We'll replace mentions of "sole proprietorship" or similar terms if they exist
        content = content.replace(/a sole proprietorship/gi, 'a software development organization');

        // Specific injection for privacy.md if not already there
        if (filename === 'privacy.md' && !content.includes('software development organization')) {
             content = content.replace(/(created by \*\*RUN the TRAIL\*\*)/, '$1, a software development organization,');
        }

        // 3. Remove any content preceding the first occurrence of "RUN THE TRAIL" (case-insensitive)
        const match = content.match(/RUN THE TRAIL/i);
        if (match && match.index > 0) {
            content = content.substring(match.index);
            // Ensure it starts with a header if we've stripped the '#'
            if (!content.startsWith('#')) {
                content = '# ' + content;
            }
        }

        // 4. Convert Markdown to HTML
        const htmlContent = marked.parse(content);

        // 5. Generate title dynamically from the first # header
        let title = 'RUN THE TRAIL';
        const titleMatch = content.match(/^#\s+(.+)$/m);
        if (titleMatch) {
            title = titleMatch[1].trim().replace(/\*\*/g, ''); // Remove bolding if any
        }

        const finalHtml = template(title, htmlContent);

        // 6. Save as .html
        const outPath = path.join(directory, filename.replace('.md', '.html'));
        fs.writeFileSync(outPath, finalHtml);
        console.log(`Generated ${outPath} (Title: ${title})`);
    });
}

processMarkdownFiles(dir);
