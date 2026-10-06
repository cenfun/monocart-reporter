import { createMemoryHistory, createWebHashHistory } from 'vue-router';

// A srcdoc iframe has an about: URL. Its history cannot be rewritten to the
// hosting page's URL, even though relative hashes resolve against that page.
// Keep routing within the frame without attempting to change browser history.
export const createReportHistory = () => {
    if (window.location.protocol === 'about:') {
        return createMemoryHistory();
    }
    return createWebHashHistory();
};
