
function callback() {

}

function other() {

}

function method(v) {
    // console.log("method", v);
    if (v === 2) {
        console.log(v);
    }
    if (v % 3 === 0) {
        callback();
    }
    if (v === 3) {
        console.log(v);
    }

    return v === 'other' ? () => {
        console.log('never covered');
    } : other;
}

const main = () => {
    // console.log('main');
    method(1);
    method(2);

    const a = 10;
    if (a === 11) {
        callback();
    }

    for (let i = 0; i < 1000; i++) {
        method(i);
    }

    const f = false;
    if (f) {
        console.log('never covered');
    }

    const { compress, decompress } = window['lz-utils'];

    const str = '📙 Emoji — 😃 💁👌🎍😍';

    console.assert(str === decompress(compress(str)));

};

window.onload = () => {
    main();
};
