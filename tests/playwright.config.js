
//create link
const fs = require('fs');
const path = require('path');

const existingPath = path.resolve(__dirname, '../');
const newPath = path.resolve(__dirname, '../node_modules/monocart-reporter');
//will be created by sf install link (runtime component)
if (fs.existsSync(newPath)) {
    fs.unlinkSync(newPath);
}
fs.symlinkSync(existingPath, newPath);

const config = {
    reporter: [
        ['list'],
        ['json', {
            outputFile: path.resolve(__dirname, '../.temp/json/results.json')
        }],
        ['html', {
            outputFolder: path.resolve(__dirname, '../.temp/html'),
            outputFile: 'results.html',
            open: 'never'
        }],
        ['junit', {
            outputFile: path.resolve(__dirname, '../.temp/junit/results.xml')
        }],
        ['monocart-reporter', {
            outputFile: path.resolve(__dirname, '../.temp/monocart/index.html')
        }]
    ]
};

module.exports = config;
