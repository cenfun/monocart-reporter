import { CommonUtil } from 'monocart-common';

const Util = {
    ... CommonUtil,

    getSourceName: (sourcePath = '') => {
        const pathList = sourcePath.split('/');
        const lastName = pathList.pop();
        const dir = pathList.pop();

        // with extname
        const index = lastName.lastIndexOf('.');
        if (index !== -1) {
            const ext = lastName.slice(index + 1);
            const reg = /^[a-z0-9]+$/;
            if (reg.test(ext)) {
                return lastName;
            }
        }

        // with parent dir
        if (dir) {
            return `${dir}/${lastName}`;
        }
        return lastName;
    }
};

export default Util;
