
export const getHash = function(key) {
    let hash = {};
    const h = location.hash.slice(1);
    if (h) {
        const usp = new URLSearchParams(h);
        hash = Object.fromEntries(usp);
    }
    if (key) {
        return hash[key];
    }
    return hash;
};

export const setHash = function(key, value) {
    if (!key) {
        return;
    }
    let obj = key;
    if (arguments.length === 2) {
        obj = {};
        obj[key] = value;
    }
    const hash = getHash();
    Object.keys(obj).forEach((k) => {
        hash[k] = obj[k];
    });
    const usp = new URLSearchParams(hash);
    location.hash = usp.toString();
};

export const delHash = function(key) {
    if (!key) {
        location.hash = '';
        return;
    }
    let list = key;
    if (!Array.isArray(key)) {
        list = [key];
    }
    const hash = getHash();
    list.forEach((k) => {
        delete hash[k];
    });
    const usp = new URLSearchParams(hash);
    location.hash = usp.toString();
};
