const namespace = 'prg';

const key = (k) => {
    return `${namespace}_${k}`;
};

const store = {
    get(k, dv = '') {
        const v = window.localStorage.getItem(key(k));
        if (v === null) {
            return dv;
        }
        return v;
    },
    set(k, v) {
        window.localStorage.setItem(key(k), v);
    },
    remove(k) {
        window.localStorage.removeItem(key(k));
    }
};

export default store;
