const Util = {

    delay: function(ms) {
        return new Promise((resolve) => {
            setTimeout(resolve, ms);
        });
    }

};

module.exports = Util;
