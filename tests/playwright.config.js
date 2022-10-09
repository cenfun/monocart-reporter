const config = {
    name: 'my test',
    globalSetup: require.resolve('./global-setup.js'),
    use: {
        //baseURL: 'https://example.coma/'
        baseURL: 'https://example.com/'
    },
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
