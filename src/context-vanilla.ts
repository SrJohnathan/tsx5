
import {Context, ProviderProps} from "./interface/Context";
import {TSX5Node} from "./interface/TSX5Node";


/**
 import { createContext } from "./context";
 export const { Provider: ThemeProvider, useContext: useTheme } = createContext("light");
 */
/**
 * createContext - Cria um contexto simples para o TSX5.
 *
 * @param defaultValue - Valor padrão do contexto.
 * @returns Um objeto com o Provider e o hook useContext.
 */
export function createContext<T>(defaultValue: T): Context<T> {
    // Usamos uma stack para suportar Providers aninhados
    let stack: T[] = [];

    // Provider: empurra o valor na stack, renderiza os filhos e depois o remove.
    const Provider = ({value, children}: ProviderProps<T>): TSX5Node => {
        // Empilha o valor de contexto
        stack.push(value);

        // Inicializa o valor renderizado com fallback para TextNode
        let rendered: TSX5Node | TSX5Node[] = children ?? document.createTextNode("Vazio");

        // Debug inicial dos valores renderizados

        // Se for um array, converte para DocumentFragment
        if (Array.isArray(rendered)) {
            const fragment = document.createDocumentFragment();
            rendered.forEach(item => {


                if (Array.isArray(item)) {


                    item.forEach(nested => {
                        if (nested && typeof (nested as any).nodeType === "number") {
                            // Reconhece item como Node pelo nodeType
                            fragment.appendChild(nested as Node);
                        } else {
                            fragment.appendChild(document.createTextNode(String(nested)));
                        }
                    })
                } else {
                    if (item && typeof (item as any).nodeType === "number") {
                        // Reconhece item como Node pelo nodeType
                        fragment.appendChild(item as Node);
                    } else {
                        fragment.appendChild(document.createTextNode(String(item)));
                    }
                }

            });
            rendered = fragment;
        } else if (
            rendered &&
            typeof (rendered as any).nodeType === "number"
        ) {
            // É um único Node
            // OK
        } else if (rendered !== null) {
            // Converte para texto
            rendered = document.createTextNode(String(rendered));
        }

        // Debug do valor final de rendered antes de retornar


        // Remove o valor da pilha após renderizar
        stack.pop();

        // Retorna o nó renderizado, agora garantido como TSX5Node
        return rendered;
    };
    // useContext: retorna o valor atual do contexto (ou o default se não houver Provider)
    const useContext = (): T => {
        return stack.length > 0 ? stack[stack.length - 1] : defaultValue;
    };

    return {Provider, useContext};
}

/**
 * useContext - Hook para consumir um contexto criado com createContext.
 *
 * @param context - O objeto retornado por createContext, contendo Provider e useContext.
 * @returns O valor atual do contexto.
 */
export function useContext<T>(context: { useContext: () => T }): T {
    return context.useContext();
}




