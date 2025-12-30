import Account from '../pages/Account';
import Proxy from '../pages/Proxy';
import Code from '../pages/Code';
import Tasks from '../pages/Tasks';

export const routes = [
    {
        key: 'account',
        label: 'Accounts',
        component: Account,
    },
    {
        key: 'proxy',
        label: 'Proxies',
        component: Proxy,
    },
    {
        key: 'code',
        label: 'Codes',
        component: Code,
    },
    {
        key: 'tasks',
        label: 'Tasks',
        component: Tasks,
    },
];

export const getRouteByKey = (key) => {
    return routes.find(route => route.key === key) || routes[0];
};
