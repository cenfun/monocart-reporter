import { initGlobalTooltips } from 'vine-ui';

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
        if (state.tooltip.timeoutId) {
            clearTimeout(state.tooltip.timeoutId);
            state.tooltip.timeoutId = null;
        }
    }
};

export const showTooltip = (elem, text) => {
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
        state.tooltip.html = elem.hasAttribute('tooltip-html');
        state.tooltip.classMap = 'mcr-searchable';
        state.tooltip.visible = true;

        const timeout = parseInt(elem.getAttribute('tooltip-timeout'));
        if (timeout > 0) {
            state.tooltip.timeoutId = setTimeout(() => {
                hideTooltip();
            }, timeout);
        }


    }

};

const getTruncatedNode = (node) => {
    if (!node) {
        return;
    }
    node = node.querySelector('.tg-tree-name') || node;
    if (node.clientWidth < node.scrollWidth) {
        return node;
    }
};

export const bindGridTooltip = (grid) => {
    if (Util.isTouchDevice()) {
        return;
    }

    grid.bind('onCellMouseEnter', (e, d) => {
        const node = getTruncatedNode(d.cellNode);
        if (node) {
            const dataText = d.rowItem?.[d.columnItem?.id];
            if (dataText && typeof dataText === 'string') {
                showTooltip(node, dataText);
                return;
            }
            showTooltip(node, node.innerText);
        }
    }).bind('onCellMouseLeave', (e, d) => {
        hideTooltip();
    });
};

export const initTooltip = () => {

    if (Util.isTouchDevice()) {
        return;
    }

    initGlobalTooltips((target) => {
        const text = target.getAttribute('tooltip');
        if (!text) {
            if (target.clientWidth < target.scrollWidth) {
                const tooltipText = target.getAttribute('tooltip-text') || target.innerText;
                showTooltip(target, tooltipText);
            }
            return;
        }
        showTooltip(target, text);
    }, () => {
        hideTooltip();
    });

};
