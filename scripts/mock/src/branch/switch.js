/* eslint-disable default-case */

// 4 + 3 + 4 + 4 + 4 + 3 = 22
const SwitchStatement = (n) => {
    switch (n) {
        case 1:
            console.log(1);
            break;
        case 2:
        case 3:
            console.log(2);
            break;
        default:
            console.log('default');
    }
};
const SwitchStatement_1 = (n) => {
    switch (n) {
        case 1:
            console.log(1);
            break;
        case 2:
        case 3:
            console.log(2);
    }
    SwitchStatement(n);
};
const SwitchStatement_2 = (n) => {
    switch (n) {
        case 1:
            console.log(1);
            break;
        case 2:
        case 3:
            console.log(2);
            break;
        default:
            console.log('default');
    }
    SwitchStatement(n);
};
const SwitchStatement_3 = (n) => {
    switch (n) {
        case 1:
            console.log(1);
            break;
        case 2:
        case 3:
            console.log(2);
            break;
        default:
            console.log('default');
    }
    SwitchStatement(n);
};
const SwitchStatement_4 = (n) => {
    switch (n) {
        case 1:
            console.log(1);
            break;
        case 2:
        case 3:
            console.log(2);
            break;
        default:
            console.log('default');
    }
    SwitchStatement(n);
};
const SwitchStatement_5 = (n) => {
    switch (n) {
        case 1:
            console.log(1);
            break;
        case 2:
        case 3:
            console.log(2);
            break;
    }
    SwitchStatement(n);
};


module.exports = () => {
    SwitchStatement_1(1);
    SwitchStatement_2(2);
    SwitchStatement_3(3);
    SwitchStatement_4(4);
    SwitchStatement_5(5);
};
