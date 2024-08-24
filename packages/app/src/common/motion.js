class Motion extends EventTarget {

    static START = 'start';
    static MOVE = 'move';
    static END = 'end';
    static STOP = 'stop';

    constructor(options) {
        super();
        this.constructorOptions = options;
        // if stopped then stop everything
        this.stopped = true;
    }

    generateOptions(options) {
        return {
            // default is Easing.linear
            easing: null,

            // total time
            duration: 100,

            // from data
            from: 0,
            // till data
            till: 1,
            // current data(private)
            data: 0,

            ... this.constructorOptions,
            ... options
        };
    }

    stop() {
        if (this.stopped) {
            return this;
        }
        // stop everything now
        this.stopped = true;
        this.cancelAnimationFrame();
        this.trigger(Motion.STOP, this.data);
        return this;
    }

    start(options) {
        this.stop();
        this.stopped = false;
        this.options = this.generateOptions(options);

        // ready
        this.initCalculation();
        // first time move, start potion
        this.data = this.calculateHandler(0);
        this.trigger(Motion.START, this.data);
        // if call stop in start callback
        if (this.stopped) {
            return this;
        }
        // init start time
        this.time = Date.now();
        this.requestAnimationFrame(this.moveHandler);
        return this;
    }

    requestAnimationFrame(callback) {
        this.requestId = window.requestAnimationFrame(() => {
            callback.apply(this);
        });
    }

    cancelAnimationFrame() {
        window.cancelAnimationFrame(this.requestId);
    }

    getEasing(easing) {
        if (typeof easing === 'function') {
            return easing;
        }
        return function(k) {
            return k;
        };
    }

    moveHandler() {
        // move
        const now = Date.now();
        const t = now - this.time;
        const d = this.duration;
        if (t < d) {
            const k = t / d;
            this.data = this.calculateHandler(k);
            this.trigger(Motion.MOVE, this.data);
            this.requestAnimationFrame(this.moveHandler);
            return;
        }
        // ====================================
        // end
        this.cancelAnimationFrame();
        // require last time move
        this.data = this.calculateHandler(1);
        this.trigger(Motion.MOVE, this.data);
        // end
        this.trigger(Motion.END, this.data);
    }

    // ================================================================================

    initCalculation() {

        const os = this.options;
        this.duration = this.toNum(os.duration, true) || 0;
        this.easing = this.getEasing(os.easing);
        // console.log(this.easing);

        // for object keys cache
        this.calculateKeys = null;

        const from = os.from;
        const till = os.till;

        if (this.isNum(from) && this.isNum(till)) {
            this.calculateType = this.calculateNumber;
            return;
        }

        if (from && typeof from === 'object' && till && typeof till === 'object') {
            this.calculateType = this.calculateObject;
            return;
        }

        this.calculateType = this.calculateNone;
    }

    calculateHandler(k) {
        const p = this.easing(k);
        const os = this.options;
        return this.calculateType(p, os.from, os.till);
    }

    calculateObject(p, from, till) {
        const d = {};
        if (this.calculateKeys) {
            this.calculateKeys.forEach((k) => {
                d[k] = this.calculateNumber(p, from[k], till[k]);
            });
            return d;
        }
        // first time cache calculate keys
        this.calculateKeys = [];
        Object.keys(from).forEach((k) => {
            const fv = from[k];
            const tv = till[k];
            // first time number checking
            if (this.isNum(fv) && this.isNum(tv)) {
                d[k] = this.calculateNumber(p, fv, tv);
                this.calculateKeys.push(k);
            }
        });
        return d;
    }

    calculateNumber(p, from, till) {
        return (till - from) * p + from;
    }

    calculateNone(p, from, till) {
        return from;
    }

    // ================================================================================

    bind(eventType, handler, options) {
        this.addEventListener(eventType, handler, options);
    }

    unbind(eventType, handler, options) {
        this.removeEventListener(eventType, handler, options);
    }

    trigger(eventType, eventData) {
        this.dispatchEvent(new CustomEvent(eventType, {
            detail: eventData
        }));
    }

    // ================================================================================

    isNum(num) {
        if (typeof num !== 'number' || isNaN(num)) {
            return false;
        }
        const isInvalid = function(n) {
            if (n === Number.MAX_VALUE || n === Number.MIN_VALUE || n === Number.NEGATIVE_INFINITY || n === Number.POSITIVE_INFINITY) {
                return true;
            }
            return false;
        };
        if (isInvalid(num)) {
            return false;
        }
        return true;
    }

    // format to a valid number
    toNum(num, toInt) {
        if (typeof num !== 'number') {
            num = parseFloat(num);
        }
        if (isNaN(num)) {
            num = 0;
        }
        if (toInt && !Number.isInteger(num)) {
            num = Math.round(num);
        }
        return num;
    }

    // ================================================================================

    destroy() {
        this.stop();
        this.unbind();
    }

}


export default Motion;
