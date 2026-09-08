const fs = require('fs');

const htmlPath = 'index.html';
const newHtmlPath = 'C:\\Users\\murli\\.gemini\\antigravity-ide\\brain\\a17166e0-41ad-4063-ad0d-01ceede27bb2\\scratch\\new_pricing_content.html';

let html = fs.readFileSync(htmlPath, 'utf8');
const newHtml = fs.readFileSync(newHtmlPath, 'utf8');

const regex = /(<!-- Segmented Tab Nav -->)[\s\S]*?(<!-- History Section \(Dynamically Populated\) -->)/;
html = html.replace(regex, newHtml + '\n\n        ');

fs.writeFileSync(htmlPath, html, 'utf8');
console.log('Updated index.html tabs via Node.');
