const fs = require('fs');
const path = require('path');

// create link for test
const existingPath = path.resolve(__dirname, '../');
const newPath = path.resolve(__dirname, '../node_modules/monocart-reporter');
// will be created by sf install link
if (fs.existsSync(newPath)) {
    fs.unlinkSync(newPath);
}
fs.symlinkSync(existingPath, newPath);
