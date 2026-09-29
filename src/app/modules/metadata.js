import state from './state.js';

let closeTimer;

const onOutsideClick = (e) => {
    const target = state.metadata.popoverTarget;
    const popover = document.querySelector('.mcr-metadata-grid')?.closest('.vui-popover');
    if (target?.contains(e.target) || popover?.contains(e.target)) {
        return;
    }
    closeMetadata();
};

const onEscape = (e) => {
    if (e.key === 'Escape') {
        closeMetadata();
    }
};

export const cancelMetadataClose = () => {
    clearTimeout(closeTimer);
    closeTimer = null;
};

export const cleanupMetadata = () => {
    cancelMetadataClose();
    state.metadata.popoverTarget = null;
    window.removeEventListener('click', onOutsideClick, true);
    window.removeEventListener('keydown', onEscape);
};

export const closeMetadata = (target) => {
    if (target && target !== state.metadata.popoverTarget) {
        return;
    }
    state.metadata.popoverVisible = false;
    cleanupMetadata();
};

// Shared by the report metadata and step params "more" icons.
export const onMetadataClick = (e, data) => {
    cancelMetadataClose();
    const target = e.currentTarget;
    if (!target) {
        return;
    }
    state.metadata.popoverTarget = target;
    state.metadata.data = data;
    state.metadata.popoverVisible = true;
    window.addEventListener('click', onOutsideClick, true);
    window.addEventListener('keydown', onEscape);
};

const scheduleMetadataClose = (target) => {
    // Touch browsers may synthesize mouseleave after a tap; keep the popover open.
    if (window.matchMedia('(hover: none)').matches) {
        return;
    }
    cancelMetadataClose();
    closeTimer = setTimeout(() => closeMetadata(target), 200);
};

export const onMetadataLeave = (e) => {
    const target = e.currentTarget;
    if (target === state.metadata.popoverTarget) {
        scheduleMetadataClose(target);
    }
};

export const onMetadataPopoverLeave = () => {
    scheduleMetadataClose(state.metadata.popoverTarget);
};
