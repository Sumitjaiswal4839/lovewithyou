const fs = require('fs');
const path = require('path');

function getFiles(dir, files = []) {
  const fileList = fs.readdirSync(dir);
  for (const file of fileList) {
    const name = `${dir}/${file}`;
    if (fs.statSync(name).isDirectory()) {
      getFiles(name, files);
    } else {
      files.push(name);
    }
  }
  return files;
}

const allTsxFiles = getFiles('app').filter(f => f.endsWith('.tsx'));

for (const file of allTsxFiles) {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('bg-dark-bg')) {
    content = content.replace(/bg-dark-bg/g, 'bg-background');
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
  }
}
