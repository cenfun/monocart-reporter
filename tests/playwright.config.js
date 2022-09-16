const path = require('path');

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
