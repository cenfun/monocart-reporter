const path = require('path');

// code coverage API
const startCoverage = async (page) => {
    await Promise.all([
        page.coverage.startJSCoverage(),
        page.coverage.startCSSCoverage()
    ]);
};

const stopCoverage = async (page, testInfo, options = {}) => {
    const [jsCoverage, cssCoverage] = await Promise.all([
        page.coverage.stopJSCoverage(),
        page.coverage.stopCSSCoverage()
    ]);
    const filter = options.filter;
    const list = [... jsCoverage, ... cssCoverage].filter((item) => {
        item.basename = path.basename(item.url);
        item.extname = path.extname(item.url);
        item.dirname = path.dirname(item.url);
        if (typeof filter === 'function') {
            return filter(item);
        }
    });

    await testInfo.attach('coverage', {
        body: Buffer.from('coverage'),
        contentType: 'text/html'
    });

    return list;
};

const takeCoverage = async (page) => {

};


module.exports = {
    startCoverage,
    stopCoverage,
    takeCoverage
};
