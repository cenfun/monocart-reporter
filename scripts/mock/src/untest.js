/*
Checking full source coverage
If there are source files in your project that not load in your tests, the coverage should be uncovered in the reports.
*/

const example = (a) => {
    if (a) {
        console.log(a);
    }
};


module.exports = () => {
    // this file not in the tests

    example();

};
