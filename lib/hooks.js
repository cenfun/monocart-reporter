
const EC = require('eight-colors');

const extensionsRegex = /\.ts$|\.mts$|\.cts$/;

async function load(url, context, nextLoad) {

    if (extensionsRegex.test(url) && !url.includes('/node_modules/')) {

        const { transformSync } = await import('amaro').catch((e) => {
            // console.log(e.message || e);
            EC.logRed('The "amaro" module is required for loading ".ts" file, please run "npm i amaro"');
        });

        // Use format 'module' so it returns the source as-is, without stripping the types.
        // Format 'commonjs' would not return the source for historical reasons.
        const { source } = await nextLoad(url, {
            ... context,
            format: 'module'
        });
        if (source === null) {
            throw new Error('Source code cannot be null or undefined');
        }
        const { code } = transformSync(source.toString(), {
            mode: 'strip-only'
        });
        return {
            format: 'module',
            source: code
        };
    }
    return nextLoad(url, context);
}

module.exports = {
    load
};
