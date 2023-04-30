import { getRequest } from "./api";

export const
    initMenu = (router, store) => {
        if (store.state.routes.length > 0) {
            return;
        }
        getRequest("/sms/system/getAllMenusByToken").then(data => {
            if (data.data) {
                // 格式化路由
                let fmtRoutes = formatRoutes(data.data);
                // 添加动态路由
                for (let x of fmtRoutes) {
                    router.addRoute(x)
                }
                // 存储到vuex中
                store.commit('initRoutes', fmtRoutes);
            }
        })
    }

export const formatRoutes = (routes) => {
    let fmtRoutes = [];
    routes.forEach(router => {
        let {
            path,
            component,
            name,
            iconCls,
            children
        } = router;
        if (children && children instanceof Array) {
            // 递归
            children = formatRoutes(children);
        }
        let fmRouter = {
            path: path,
            name: name,
            iconCls: iconCls,
            children: children,
            component(resolve) {
                if (component.startsWith('Home')) {
                    require(['../views/' + component + '.vue'], resolve);
                } else if (component.startsWith('My')) {
                    require(['../views/my/' + component + '.vue'], resolve);
                } else if (component.startsWith('Per')) {
                    require(['../views/per/' + component + '.vue'], resolve);
                } else if (component.startsWith('Re')) {
                    require(['../views/re/' + component + '.vue'], resolve);
                } else if (component.startsWith('Ma')) {
                    require(['../views/ma/' + component + '.vue'], resolve);
                }
            }
        }
        fmtRoutes.push(fmRouter);
    });
    return fmtRoutes;
}