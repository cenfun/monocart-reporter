// point type
type UPoint = {
    x: number,
    y: number
}

const method = (p: UPoint, pointIn: UPoint) => {
    const str: string = "hello world";
    console.log(p, pointIn, str);
    return str;
}


const main = (p: UPoint, s: string) => {
    /* 
       typescript block comment
    */
    const pointIn: UPoint = {
        x: 1,
        y: 2
    }

    // typescript line comment

    const v = method(p, pointIn);

    console.log(p, s, v);

}

module.exports = main;