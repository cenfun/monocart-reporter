import { createRouter, createWebHashHistory } from 'vue-router';

const router = createRouter({
    history: createWebHashHistory(),
    routes: [{
        path: '/',
        name: 'home'
    }, {
        path: '/report',
        name: 'report'
    }, {
        path: '/detail/:id',
        name: 'detail'
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
