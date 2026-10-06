import { createRouter } from 'vue-router';
import { createReportHistory } from '../shared/router-history.js';

// Routes are used to synchronize application state with the URL. The app does
// not render them through RouterView, but Vue Router still requires a component.
const RouteState = {
    render: () => null
};

const router = createRouter({
    history: createReportHistory(),
    routes: [{
        path: '/',
        name: 'network',
        component: RouteState
    }, {
        path: '/request/:id',
        name: 'request',
        component: RouteState
    }, {
        path: '/:pathMatch(.*)*',
        redirect: {
            name: 'network'
        }
    }]
});

export const openRequestRoute = (id) => router.push({
    name: 'request',
    params: {
        id
    }
});

export const closeRequestRoute = (replace = false) => {
    if (router.currentRoute.value.name === 'network') {
        return;
    }
    const target = {
        name: 'network'
    };
    return replace ? router.replace(target) : router.push(target);
};

export default router;
