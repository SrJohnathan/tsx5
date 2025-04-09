import {createElement} from "./jsx-runtime";
import {matchRoute, parseRoutePath} from "./matchRoute";
import {TSX5Node} from "./interface/TSX5Node";


export const render = (root: HTMLElement) => {
    const { renderCurrentRoute } = createRouter();

    function renderApp() {
        if (!root) return;
        root.innerHTML = "";

        const elm = renderCurrentRoute();

        root.appendChild(renderToDOM(elm));
    }

    window.addEventListener("popstate", renderApp);

    renderApp();
};

function renderToDOM(node: TSX5Node): Node {
    if (node instanceof Node) {
        return node;
    }

    if (typeof node === "string" || typeof node === "number") {
        return document.createTextNode(String(node));
    }

    if (Array.isArray(node)) {
        const fragment = document.createDocumentFragment();
        node.forEach(n => fragment.appendChild(renderToDOM(n)));
        return fragment;
    }

    if (node?.tag === "Fragment") {
        const fragment = document.createDocumentFragment();
        for (const child of (node.children as any) || []) {
            fragment.appendChild(renderToDOM(child));
        }
        return fragment;
    }

    console.error("renderToDOM() recebeu um TSX5Node inválido:", node);
    return document.createTextNode("[erro ao renderizar]");
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


export function createRouterHidrate() {
    // @ts-ignore
    let modules = import.meta.glob("/src/pages/**/*.tsx", { eager: true });

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

    return { routes, resolveRoute };
}


export function createRouter(ots: {test:boolean} = {test:false}) {

    // @ts-ignore
    let modules = import.meta.glob("/src/pages/**/*.tsx", { eager: true });


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
            return createElement("div", {}, "404 - Página não encontrada" as any as  TSX5Node);
        }
        return createElement(routeMatch.component, { params: routeMatch.params });
    }

    function navigateTo(path: string) {
        window.history.pushState({}, "", path);
        window.dispatchEvent(new PopStateEvent("popstate"));
    }

    return { routes, renderCurrentRoute, navigateTo };
}
