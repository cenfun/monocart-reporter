// point type
type Point = {
    x: number,
    y: number
}

const fun = (p: Point, pointIn: Point) => {
    const str: string = "hello world";
    console.log(p, pointIn, str);
    return str;
}


const typescript = (p: Point, s: string) => {
    /* 
       typescript block comment
    */
    const pointIn: Point = {
        x: 1,
        y: 2
    }

    // typescript line comment

    const v = fun(p, pointIn);

    console.log(p, s, v);

}

module.exports = typescript;