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

const initGlobalTooltips = (onEnter, onLeave, getTooltip) => {
    if (typeof onEnter !== 'function' || typeof onLeave !== 'function') {
        return;
    }

    if (typeof getTooltip !== 'function') {
        getTooltip = (target) => {
            if (target.hasAttribute('tooltip')) {
                return target.getAttribute('tooltip') || true;
            }
        };
    }

    document.body.addEventListener('mouseenter', (e) => {
        const target = e.target;
        const text = getTooltip(target);
        if (text) {
            onEnter(target, text);
        }
    }, true);

    document.body.addEventListener('mouseleave', (e) => {
        const target = e.target;
        const text = getTooltip(target);
        if (text) {
            onLeave(target);
        }
    }, true);

};

export const initTooltip = () => {

    if (Util.isTouchDevice()) {
        return;
    }

    initGlobalTooltips((target, text) => {
        // console.log(target, text);
        if (text === true) {
            // console.log(target.clientWidth, target.scrollWidth);
            if (target.clientWidth < target.scrollWidth) {
                showTooltip(target, target.innerText);
            }
            return;
        }
        showTooltip(target, text);
    }, (target) => {
        hideTooltip();
    });

};
