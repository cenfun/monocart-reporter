// 5 x 5 = 25
const LogicalExpression = (tf1, tf2) => {

    for (let i = 0; i < 2; i++) {
        const a = tf1 || tf2;
        const b = tf2 || tf1 || a;
        console.log(b);
    }

    if (tf1) {
        const c = tf2 || 2;
        console.log(c);
    }

};
const LogicalExpression_11 = (tf1, tf2) => {
    const a = tf1 || tf2;
    const b = tf2 || tf1 || a;
    console.log(b);
    LogicalExpression(tf1, tf2);
};
const LogicalExpression_10 = (tf1, tf2) => {
    const a = tf1 || tf2;
    const b = tf2 || tf1 || a;
    console.log(b);
    LogicalExpression(tf1, tf2);
};
const LogicalExpression_01 = (tf1, tf2) => {
    const a = tf1 || tf2;
    const b = tf2 || tf1 || a;
    console.log(b);
    LogicalExpression(tf1, tf2);
};
const LogicalExpression_00 = (tf1, tf2) => {
    const a = tf1 || tf2;
    const b = tf2 || tf1 || a;
    console.log(b);
    LogicalExpression(tf1, tf2);
};


module.exports = () => {

    LogicalExpression_11(true, true);
    LogicalExpression_10(true, false);
    LogicalExpression_01(false, true);
    LogicalExpression_00(false, false);
};
