const hash = {

    get: function(key) {
        let data = {};
        const h = location.hash.slice(1);
        if (h) {
            const usp = new URLSearchParams(h);
            data = Object.fromEntries(usp);
        }
        if (key) {
            return data[key];
        }
        return data;
    },

    set: function(key, value) {
        if (!key) {
            return;
        }
        let obj = key;
        if (arguments.length === 2) {
            obj = {};
            obj[key] = value;
        }
        const data = hash.get();
        Object.keys(obj).forEach((k) => {
            data[k] = obj[k];
        });
        const usp = new URLSearchParams(data);
        location.hash = usp.toString();
    },

    remove: function(key) {
        if (!key) {
            location.hash = '';
            return;
        }
        let list = key;
        if (!Array.isArray(key)) {
            list = [key];
        }
        const data = hash.get();
        list.forEach((k) => {
            delete data[k];
        });
        const usp = new URLSearchParams(data);
        location.hash = usp.toString();
    }
};


export default hash;
