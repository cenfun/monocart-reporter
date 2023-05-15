class Concurrency {

    constructor(maxCount = 10) {
        this.maxCount = maxCount;
        this.list = [];
    }

    addItem(item) {
        this.list.push(item);
    }

    addList(list) {
        this.list = this.list.concat(list);
    }

    start(handler) {
        // must be async function
        if (typeof handler !== 'function') {
            return;
        }
        this.handler = handler;
        this.count = 0;
        return new Promise((resolve) => {
            this.resolve = resolve;
            this.next();
        });
    }

    next() {
        // console.log(`list: ${this.list.length} count: ${this.count}`);

        // if has clear
        if (!this.resolve) {
            return;
        }

        if (!this.list.length) {
            // no list but has in progress count
            if (this.count > 0) {
                return;
            }
            // all finish
            this.resolve();
            this.clear();
            return;
        }

        // out of concurrency count, just wait
        if (this.count >= this.maxCount) {
            return;
        }

        const item = this.list.shift();
        this.count += 1;

        // async handler
        this.handler(item).finally(() => {
            this.count -= 1;
            this.next();
        });

        this.next();
    }

    clear() {
        this.list = [];
        this.handler = null;
        this.count = 0;
        this.resolve = null;
    }

}

module.exports = Concurrency;
