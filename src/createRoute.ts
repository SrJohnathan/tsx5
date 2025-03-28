import {createElement,Fragment} from "./jsx-runtime";
import {matchRoute, parseRoutePath} from "./matchRoute";

(globalThis as any).createElement = createElement;
(globalThis as any).Fragment = Fragment;


export const render = (root:HTMLElement) => {
    const { renderCurrentRoute } = createRouter();
    function renderApp() {
        if (!root) return;
        root.innerHTML = "";
        root.appendChild(  renderCurrentRoute());
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




type RouteDefinition = {
    path: string;
    component: (props?: { params?: Record<string, string> }) => HTMLElement;
};

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

    function renderCurrentRoute() {
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
