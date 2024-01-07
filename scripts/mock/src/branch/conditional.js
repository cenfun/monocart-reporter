
// 5 x 4 = 20
const ConditionalExpression = (tf1, tf2) => {
    const a = tf1 ? 'true' : 'false';
    console.log(a);
    const b = tf2 ? 'true' : 'false';
    console.log(b);
};
const ConditionalExpression_11 = (tf1, tf2) => {
    const a = tf1 ? 'true' : 'false';
    console.log(a);
    const b = tf2 ? 'true' : 'false';
    console.log(b);
    ConditionalExpression(tf1, tf2);
};
const ConditionalExpression_10 = (tf1, tf2) => {
    const a = tf1 ? 'true' : 'false';
    console.log(a);
    const b = tf2 ? 'true' : 'false';
    console.log(b);
    ConditionalExpression(tf1, tf2);
};
const ConditionalExpression_01 = (tf1, tf2) => {
    const a = tf1 ? 'true' : 'false';
    console.log(a);
    const b = tf2 ? 'true' : 'false';
    console.log(b);
    ConditionalExpression(tf1, tf2);
};
const ConditionalExpression_00 = (tf1, tf2) => {
    const a = tf1 ? 'true' : 'false';
    console.log(a);
    const b = tf2 ? 'true' : 'false';
    console.log(b);
    ConditionalExpression(tf1, tf2);
};


module.exports = () => {

    ConditionalExpression_11(true, true);
    ConditionalExpression_10(true, false);
    ConditionalExpression_01(false, true);
    ConditionalExpression_00(false, false);
};
