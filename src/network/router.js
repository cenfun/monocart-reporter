import { createRouter, createWebHashHistory } from 'vue-router';

const router = createRouter({
    history: createWebHashHistory(),
    routes: [{
        path: '/',
        name: 'network'
    }, {
        path: '/request/:id',
        name: 'request'
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
