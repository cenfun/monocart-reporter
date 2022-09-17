const config = {
    reporter: [
        ['list'],
        ['json', {
            outputFile: '.temp/json/results.json'
        }],
        ['html', {
            //relative config path not process.cwd ?
            outputFolder: '../.temp/html',
            outputFile: 'results.html',
            open: 'never'
        }],
        ['junit', {
            outputFile: '.temp/junit/results.xml'
        }],
        //['monocart-reporter']
        ['monocart-reporter', {
            outputFile: '.temp/monocart/index.html'
        }]
    ]
};

module.exports = config;
