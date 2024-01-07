require('../minify/comments.js');

require('../minify/demo.js');

const { ignore } = require('./ignore.js');

const branch = require('./branch.js');
const typescript = require('./typescript.ts');

const component = require('./component.js');

function foo(argument) {
    console.log('this is foo');

    if (argument) {
        console.log('covered foo argument');
    }
}

function bar(argument) {
    console.log('this is bar');

    if (argument) {
        console.log('covered bar argument');
    }
}

function start() {
    console.log('this is start');

    foo(true);
}

const out_fun = () => {
    const out_sub_fun = () => {

    };

    return out_sub_fun;
};

function privateFunction() {
    console.log('this is privateFunction');

    function sub_function() {
        console.log('this is sub function');
        out_fun();
    }

    sub_function();

    const af = () => {
        return [1, 2, 3];
    };

    af().forEach(function(it) {
        console.log(it);
    });
}

function init(stop) {
    console.log('this is init');
    start();

    if (stop) {
        console.log('stop in init');
        return;
    }

    const inline = (a) => {
        console.log('this is inline');
        if (a) {
            console.log('covered inline argument');
        }
    };

    const list = [inline];

    list.forEach((i) => {
        i();
    });

    const f = false;
    if (f) {
        privateFunction();
    }

}

const onload = (something) => {
    console.log('this is onload');
    if (something) {
        console.log('stop with something');
        return;
    }
    console.log('on loaded');

    ignore();
    typescript();
    branch();
    component();

    const number = something ? 1 : 2;
    return number;

};


// one line but two statements
init(window._my_stop_key); onload(window._my_something);


module.exports = {
    foo, bar, start
};
