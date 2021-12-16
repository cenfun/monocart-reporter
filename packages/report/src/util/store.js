const store = {
    key(k) {
        return `prg_${k}`;
    },
    get(k, dv = '') {
        k = store.key(k);
        const v = window.localStorage.getItem(k);
        if (v === null) {
            return dv;
        }
        return v;
    },
    set(k, v) {
        k = store.key(k);
        window.localStorage.setItem(k, v);
    }
};

export default store;