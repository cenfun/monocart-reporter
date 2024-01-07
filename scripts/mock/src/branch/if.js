// 5 x 10 = 50 ( (count if) x 2 )
const IfStatement = (tf1, tf2) => {

    if (tf1) {
        console.log('if1');
    }

    if (tf1) {
        console.log('if2');
    } else if (tf2) {
        console.log('ifelse2');
    }

    if (tf1) {
        console.log('if3');
    } else if (tf2) {
        console.log('ifelse3');
    } else {
        console.log('else3');
    }

};

const IfStatement_11 = (tf1, tf2) => {

    if (tf1) {
        console.log('if1');
    }

    if (tf1) {
        console.log('if2');
    } else if (tf2) {
        console.log('ifelse2');
    }

    if (tf1) {
        console.log('if3');
    } else if (tf2) {
        console.log('ifelse3');
    } else {
        console.log('else3');
    }

    IfStatement(tf1, tf2);

};
const IfStatement_10 = (tf1, tf2) => {

    if (tf1) {
        console.log('if1');
    }

    if (tf1) {
        console.log('if2');
    } else if (tf2) {
        console.log('ifelse2');
    }

    if (tf1) {
        console.log('if3');
    } else if (tf2) {
        console.log('ifelse3');
    } else {
        console.log('else3');
    }

    IfStatement(tf1, tf2);

};
const IfStatement_01 = (tf1, tf2) => {

    if (tf1) {
        console.log('if1');
    }

    if (tf1) {
        console.log('if2');
    } else if (tf2) {
        console.log('ifelse2');
    }

    if (tf1) {
        console.log('if3');
    } else if (tf2) {
        console.log('ifelse3');
    } else {
        console.log('else3');
    }

    IfStatement(tf1, tf2);

};
const IfStatement_00 = (tf1, tf2) => {

    if (tf1) {
        console.log('if1');
    }

    if (tf1) {
        console.log('if2');
    } else if (tf2) {
        console.log('ifelse2');
    }

    if (tf1) {
        console.log('if3');
    } else if (tf2) {
        console.log('ifelse3');
    } else {
        console.log('else3');
    }

    IfStatement(tf1, tf2);

};

module.exports = () => {
    IfStatement_11(true, true);
    IfStatement_10(true, false);
    IfStatement_01(false, true);
    IfStatement_00(false, false);
};
