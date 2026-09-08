const fs = require('fs');

const html = fs.readFileSync('index.html', 'utf8');
const css = fs.readFileSync('styles.css', 'utf8');

const classMatch = css.match(/\.([a-zA-Z0-9_-]+)/g);
if (classMatch) {
  const uniqueClasses = [...new Set(classMatch.map(c => c.slice(1)))];
  const unused = [];
  
  for (const cls of uniqueClasses) {
    // Check if class exists in HTML (rudimentary check)
    // Looking for class="... cls ..." or similar
    const regex = new RegExp('class=[\'"][^\'"]*\\b' + cls + '\\b[^\'"]*[\'"]');
    // Also check for JS id or querySelector, just in case
    const inJs = new RegExp('\\b' + cls + '\\b');
    
    if (!regex.test(html) && !inJs.test(html)) {
      // Also check app.js
      const js = fs.readFileSync('app.js', 'utf8');
      if (!inJs.test(js)) {
        unused.push(cls);
      }
    }
  }
  console.log('Potentially unused classes: ' + unused.join(', '));
}
