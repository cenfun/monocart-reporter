const Util = require('../../utils/util.js');

const setMetadata = (data, testInfo) => {
    if (!data || typeof data !== 'object' || !testInfo) {
        return;
    }

    const definition = Util.attachments.metadata;

    // console.log(definition);
    const attachment = {
        name: definition.name,
        contentType: definition.contentType,
        body: Buffer.from(Util.jsonString(data))
    };
    // console.log(attachment);

    testInfo.attachments.push(attachment);

};


module.exports = {
    setMetadata
};
