export function foo(argument) {
    console.log('this is foo');

    if (argument) {
        console.log('covered foo argument');
    }
}

export function bar(argument) {
    console.log('this is bar');

    if (argument) {
        console.log('covered bar argument');
    }
}

export function start() {
    console.log('this is start');

    foo(true);
}

export function privateFunction() {
    console.log('this id privateFunction');
}

function init() {
    console.log('this is init');
}

init();
