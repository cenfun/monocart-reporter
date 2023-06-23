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

}

init(window._my_stop_key);
