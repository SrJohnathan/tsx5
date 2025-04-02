import {createElement} from "./jsx-runtime";
import {matchRoute, parseRoutePath} from "./matchRoute";
import {TSX5Node} from "./interface/TSX5Node";


export const render = (root:HTMLElement) => {
    const { renderCurrentRoute } = createRouter();
    function renderApp() {
        if (!root) return;
        root.innerHTML = "";

        let elm = renderCurrentRoute()

        let layout = get_layout();

        if (layout) {
            const layoutElm : any = createElement(layout.component, { params: {} })
            layoutElm.appendChild(elm)
            root.appendChild( layoutElm as any);
        }else  {
            console.log("not layout found")
            root.appendChild( elm as any);
        }


    }
    window.addEventListener("popstate", renderApp);

    renderApp()

}

export const useNavigation = () => {

    const { navigateTo } = createRouter();
    return {
        push : navigateTo,
        back: () => window.history.back(),
    }

}
export type RouteDefinition = {
    path: string;
    component: (props?: { params?: Record<string, string> }) => HTMLElement;
};

export type LayoutDefinition = {
    component: (props?: { params?: Record<string, string> }) => HTMLElement;
};

export function get_layout(): LayoutDefinition | null {
    // @ts-ignore
    const modules = import.meta.glob("/src/layout.tsx", { eager: true });

    for (const path in modules) {
        const mod = modules[path] as any;
        if (mod.default) {
            return { component: mod.default }; // Retorna o componente do layout
        }
    }
    return null
}




export function createRouter() {
    // @ts-ignore
    const modules = import.meta.glob("/src/pages/**/*.tsx", { eager: true });

    const routes: RouteDefinition[] = [];

    for (const path in modules) {
        const mod = modules[path] as any;
        const component = mod.default;
        const routePath = parseRoutePath(path);
        routes.push({ path: routePath, component });
    }

    function resolveRoute(pathname: string) {
        for (const route of routes) {
            const { matched, params } = matchRoute(route.path, pathname);
            if (matched) {
                return { component: route.component, params };
            }
        }
        return null;
    }

    function renderCurrentRoute():TSX5Node {
        const pathname = window.location.pathname.toLowerCase();
        const routeMatch = resolveRoute(pathname);


        if (!routeMatch) {
            return createElement("div", {}, "404 - Página não encontrada");
        }
        return createElement(routeMatch.component, { params: routeMatch.params });
    }

    function navigateTo(path: string) {
        window.history.pushState({}, "", path);
        window.dispatchEvent(new PopStateEvent("popstate"));
    }

    return { routes, renderCurrentRoute, navigateTo };
}
