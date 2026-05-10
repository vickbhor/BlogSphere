const fs = require('fs');
const path = require('path');

function walk(dir) {
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      walk(filePath);
    } else if (filePath.endsWith('.jsx')) {
      let content = fs.readFileSync(filePath, 'utf8');
      content = content.replace(/<img([\s\S]*?)>/g, (match, p1) => {
        if (p1.includes('loading="lazy"')) return match;
        return `<img loading="lazy"${p1}>`;
      });
      fs.writeFileSync(filePath, content);
    }
  }
}

walk('./src');