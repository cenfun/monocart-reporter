import { createRouter, createWebHashHistory } from 'vue-router';

// Routes are used to synchronize application state with the URL. The app does
// not render them through RouterView, but Vue Router still requires a component.
const RouteState = {
    render: () => null
};

const router = createRouter({
    history: createWebHashHistory(),
    routes: [{
        path: '/',
        name: 'home',
        component: RouteState
    }, {
        path: '/report',
        name: 'report',
        component: RouteState
    }, {
        path: '/detail/:id',
        name: 'detail',
        component: RouteState
    }, {
        path: '/:pathMatch(.*)*',
        redirect: {
            name: 'home'
        }
    }]
});

const copyQuery = () => ({
    ... router.currentRoute.value.query
});

export const getQueryValue = (value) => {
    if (Array.isArray(value)) {
        return value[0] || '';
    }
    return value || '';
};

export const replaceQuery = (values, routeName) => {
    const currentRoute = router.currentRoute.value;
    const query = copyQuery();
    Object.keys(values).forEach((key) => {
        const value = values[key];
        if (typeof value === 'undefined' || value === null || value === '') {
            delete query[key];
        } else {
            query[key] = value;
        }
    });

    const target = {
        name: routeName || currentRoute.name || 'home',
        query
    };
    if (!routeName && currentRoute.name === 'detail') {
        target.params = currentRoute.params;
    }
    return router.replace(target);
};

export const openReportRoute = () => {
    const query = copyQuery();
    delete query.title;
    return router.push({
        name: 'report',
        query
    });
};

export const openDetailRoute = (item) => {
    const query = copyQuery();
    if (item.title) {
        query.title = item.title;
    }
    return router.push({
        name: 'detail',
        params: {
            id: item.id
        },
        query
    });
};

export const closeFlyoverRoute = (replace = false) => {
    const currentRoute = router.currentRoute.value;
    if (currentRoute.name === 'home') {
        return;
    }
    const target = {
        name: 'home',
        query: copyQuery()
    };
    delete target.query.title;
    return replace ? router.replace(target) : router.push(target);
};

export default router;
