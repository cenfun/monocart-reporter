// Copy the public demo's social preview image. Metadata lives in the shared HTML template.
const fs = require('node:fs');
const path = require('node:path');

const prepareDocs = (reportDir = path.resolve(__dirname, '../.temp/monocart')) => {
    const htmlPath = path.join(reportDir, 'index.html');
    if (!fs.statSync(htmlPath).isFile()) {
        throw new Error(`Report is not a file: ${htmlPath}`);
    }
    fs.copyFileSync(path.resolve(__dirname, '../assets/og-image.png'), path.join(reportDir, 'og-image.png'));
    console.log(`Copied social preview to ${reportDir}`);
};

if (require.main === module) {
    prepareDocs(process.argv[2] && path.resolve(process.argv[2]));
}

module.exports = prepareDocs;
