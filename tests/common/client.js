/*
//============================================================================
async ()=> {
    await delay(1000);
    doNext();
}
*/
window.delay = function(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
};

/*
//============================================================================
//Check something if it's ready until timeout
async ()=> {
    await ready(()=>{
        var boolean = checkSomething();
        if (boolean) {
            return boolean;
        }
    });
    doNext();
}
*/
window.ready = function(checkFn, timeout = 3000, timeoutMsg = '', freq = 100) {
    return new Promise((resolve) => {

        const resFirst = checkFn();
        if (resFirst) {
            resolve(resFirst);
            return;
        }

        let timeout_check;
        const timeout_id = setTimeout(function() {
            clearTimeout(timeout_check);
            const resTimeout = checkFn();
            timeoutMsg = timeoutMsg || resTimeout;
            console.error(`[ready] ${timeout}ms timeout: ${timeoutMsg}`);
            resolve(resTimeout);
        }, timeout);

        const checkStart = function() {
            clearTimeout(timeout_check);
            timeout_check = setTimeout(function() {
                const resCheck = checkFn();
                if (resCheck) {
                    clearTimeout(timeout_id);
                    resolve(resCheck);
                    return;
                }
                checkStart();
            }, freq);
        };

        checkStart();

    });
};

