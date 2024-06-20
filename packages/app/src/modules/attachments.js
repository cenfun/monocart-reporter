
import Util from '../utils/util.js';

const getPluginComponent = (contentType, name) => {
    const {
        audit, coverage, network
    } = Util.attachments;

    const definitions = [{
        ... audit,
        component: 'audit'
    }, {
        ... coverage,
        component: 'coverage'
    }, {
        ... network,
        component: 'network'
    }];

    for (const definition of definitions) {
        if (name === definition.name && contentType === definition.contentType) {
            return definition.component;
        }
    }

};

const getAttachmentComponent = (item) => {
    // contentType 'application/json' 'image/png' 'video/webm'
    const {
        contentType, name, content
    } = item;

    if (contentType.startsWith('image')) {
        return 'image';
    }

    if (contentType.startsWith('video')) {
        return 'video';
    }

    if (name === 'trace' && contentType === 'application/zip') {
        return 'trace';
    }

    const pc = getPluginComponent(contentType, name);
    if (pc) {
        return pc;
    }

    if (content) {
        return 'content';
    }

    return 'link';
};

const initGroupList = (group) => {

    const ordering = ['diff', 'actual', 'expected'];
    group.data.list.sort((a, b) => {
        const ai = ordering.indexOf(a.category);
        const bi = ordering.indexOf(b.category);
        return ai - bi;
    });

    let filePath;
    group.data.list.forEach((it) => {
        const {
            category, name, path
        } = it;

        // fixed expected image path
        if (category === 'expected' && filePath) {
            const ls = filePath.split('/');
            ls.pop();
            ls.push(name);
            it.path = ls.join('/');
        } else {
            filePath = path;
        }

    });

};

const existsGroupItem = (group, groupName, retry) => {
    if (group.data.name === groupName && group.data.retry === retry) {
        return true;
    }
    return false;
};

const createGroup = (item, groupName, attachment) => {
    return {
        component: 'comparison',
        data: {
            name: groupName,
            contentType: attachment.contentType,
            message: attachment.message,
            position: attachment.position,
            retry: attachment.retry,
            list: [item]
        }
    };
};

export const groupAttachments = (attachments) => {

    attachments = attachments.filter((item) => typeof item.name === 'string');

    const list = [];
    let group;
    attachments.forEach((attachment) => {
        const match = attachment.name.match(/^(.*)-(expected|actual|diff|previous)(\.[^.]+)?$/);
        if (match) {
            const [, name, category, extension = ''] = match;

            const item = {
                name: attachment.name,
                path: attachment.path,
                // content for text
                content: attachment.content,
                category
            };

            // multiple soft comparisons in one test, name with number
            // multiple-soft-comparisons-1.png
            // multiple-soft-comparisons-2.png
            const groupName = name + extension;

            if (group) {

                // there are two connected groups if retry happened
                if (existsGroupItem(group, groupName, attachment.retry)) {
                    group.data.list.push(item);
                } else {
                    initGroupList(group);
                    list.push(group);
                    group = createGroup(item, groupName, attachment);
                }

            } else {
                group = createGroup(item, groupName, attachment);
            }

        } else {

            // last one
            if (group) {
                initGroupList(group);
                list.push(group);
                group = null;
            }

            list.push({
                component: getAttachmentComponent(attachment),
                data: attachment
            });

        }
    });

    // last group
    if (group) {
        initGroupList(group);
        list.push(group);
    }

    return list;

};
