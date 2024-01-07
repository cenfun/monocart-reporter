/* branches test cases */

const ConditionalExpression = require('./branch/conditional.js');
const IfStatement = require('./branch/if.js');
const LogicalExpression = require('./branch/logical.js');
const SwitchStatement = require('./branch/switch.js');

const uncoveredFunction = () => {
    const list = [1, 2, 3, 4, 5];
    list.forEach((v) => {
        console.log(v);
    });
};

const coveredFunction = () => {
    for (let i = 0; i < 3; i++) {
        if (i > 1) {
            console.log(i);
        } else if (i > 100) {
            uncoveredFunction();
        }
    }
};

// AssignmentPattern
// ((a = 0) => {
//     console.log(a);
// })();

const branch = () => {
    coveredFunction();

    ConditionalExpression();
    IfStatement();
    LogicalExpression();
    SwitchStatement();

};

module.exports = branch;
