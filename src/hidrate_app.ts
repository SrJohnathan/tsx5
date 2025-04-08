import {createRouter} from "./createRoute";
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

    // Obtém a função que gera a árvore virtual da rota atual
    const {renderCurrentRoute} = createRouter();

    logger.debug("Router criado");

    function doHydration() {
        logger.info("Executando hidratação");
        if (!root) {
            logger.error("Elemento raiz não encontrado", {rootValue: root});
            return;
        }


        try {
            hydrate(root, renderCurrentRoute);
            logger.info("Hidratação concluída com sucesso");
        } catch (error) {
            logger.error("Erro durante hidratação", error);
        }
    }

    // Atualiza a hidratação em caso de navegação (popstate)
    window.addEventListener("popstate", () => {
        logger.debug("Evento popstate detectado");
        doHydration();
    });

    // Executa a hidratação inicial após o carregamento do DOM
    if (document.readyState === 'loading') {
        logger.debug("DOM ainda carregando, aguardando DOMContentLoaded");
        document.addEventListener('DOMContentLoaded', doHydration);
    } else {
        logger.debug("DOM já carregado, executando hidratação imediatamente");
        doHydration();
    }

    return {
        forceHydration: doHydration,
        getConfig: () => ({...config})
    };
};