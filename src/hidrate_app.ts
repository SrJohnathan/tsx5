import {createRouter, createRouterHidrate} from "./createRoute";
import {config, logger} from "./logging_configuration";
import {hydrate} from "./hidrate";

/**
 * Define o tipo da função hydrateApp para evitar que tipos externos (como ConfigGlobals) escapem.
 */
export const hydrateApp: (root: HTMLElement) => {
    forceHydration: () => void;
    getConfig: () => Record<string, unknown>;
} = (root: HTMLElement) => {
    logger.info("Iniciando hidratação da aplicação");

    // Obtém a rota inicial do SSR injetada pelo servidor
    const currentPath = window.__ROUTE__ || window.location.pathname.toLowerCase();

    const { resolveRoute } = createRouterHidrate();
    const routeMatch = resolveRoute(currentPath);

    function doHydration() {
        logger.info("Executando hidratação");
        if (!root) {
            logger.error("Elemento raiz não encontrado", { rootValue: root });
            return;
        }

        try {
            const vnode = routeMatch
                ? createElement(routeMatch.component, { params: routeMatch.params })
                : createElement("div", {}, "404 - Página não encontrada" as any);

            hydrate(root, () => vnode);
            logger.info("Hidratação concluída com sucesso");
        } catch (error) {
            logger.error("Erro durante hidratação", error);
        }
    }

    window.addEventListener("popstate", () => {
        logger.debug("Evento popstate detectado");
        doHydration();
    });

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', doHydration);
    } else {
        doHydration();
    }

    return {
        forceHydration: doHydration,
        getConfig: () => ({ ...config })
    };
};