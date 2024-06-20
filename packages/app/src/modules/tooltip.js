import Util from '../utils/util.js';
import state from '../modules/state.js';

export const hideTooltip = () => {
    if (Util.isTouchDevice()) {
        return;
    }

    if (state.tooltip) {
        state.tooltip.visible = false;
        state.tooltip.text = '';
        state.tooltip.html = false;
        state.tooltip.classMap = '';
    }
};

export const showTooltip = (elem, text, html) => {
    if (Util.isTouchDevice()) {
        return;
    }

    hideTooltip();

    if (!text) {
        return;
    }
    if (state.tooltip) {
        state.tooltip.target = elem;
        state.tooltip.text = text;
        state.tooltip.html = html;
        state.tooltip.classMap = 'mcr-searchable';
        state.tooltip.visible = true;
    }

};

export const getTruncatedNode = (node) => {
    if (!node) {
        return;
    }
    node = node.querySelector('.tg-tree-name') || node;
    if (node.clientWidth < node.scrollWidth) {
        return node;
    }
};

export const bindGridTooltip = (grid) => {
    grid.bind('onCellMouseEnter', (e, d) => {
        const node = getTruncatedNode(d.cellNode);
        if (node) {
            const html = false;
            const text = node.innerText;
            showTooltip(node, text, html);
        }
    }).bind('onCellMouseLeave', (e, d) => {
        hideTooltip();
    });
};
