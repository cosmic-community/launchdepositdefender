const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

async function injectConsoleCapture() {
  try {
    const scriptContent = fs.readFileSync(path.join(__dirname, '../public/dashboard-console-capture.js'), 'utf8');
    const inlineScript = `<script>${scriptContent}</script>`;
    
    const htmlFiles = await glob('.next/**/*.html', { ignore: '.next/cache/**' });
    
    let injectedCount = 0;
    
    for (const file of htmlFiles) {
      let content = fs.readFileSync(file, 'utf8');
      
      if (!content.includes('dashboard-console-capture') && content.includes('</head>')) {
        content = content.replace('</head>', `${inlineScript}</head>`);
        fs.writeFileSync(file, content);
        injectedCount++;
      }
    }
    
    console.log(`✅ Console capture script injected into ${injectedCount} HTML files`);
  } catch (error) {
    console.error('❌ Failed to inject console capture script:', error);
    process.exit(1);
  }
}

injectConsoleCapture();