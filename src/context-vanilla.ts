import {Context, ProviderProps} from "./interface/Context";
import {useStateAlt} from "./state";
import {TSX5Node} from "./interface/TSX5Node";


function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}





/**
 * createContext - Cria um contexto simples para o TSX5.
 *
 * @param defaultValue - Valor padrão do contexto.
 * @returns Um objeto com o Provider e o hook useContext.
 */
export function createContext<T>(defaultValue: T): Context<T> {
    // Cria a stack reativa com o valor default
    const [stack, setStack] = useStateAlt<T[]>([defaultValue]);

    // Provider: adiciona um novo valor à stack e remove na desmontagem
    const Provider = ({ value, children }: ProviderProps<T>): DocumentFragment => {
        // Atualiza a stack para incluir o novo valor
        setStack(prev => [...prev, value]);
        console.log("Provider mounted, new stack length:", stack.length + 1);

        // Cria um container para os filhos
        const container = document.createDocumentFragment();

        // Função para processar os filhos e adicioná-los ao container
        const processChildren = (parent: Node, children: any) => {
            let rendered: TSX5Node | TSX5Node[] = children ?? document.createTextNode("Vazio");

            if (Array.isArray(rendered)) {
                rendered.forEach(item => {
                    if (Array.isArray(item)) {
                        processChildren(parent, item);
                    } else if (item && typeof (item as any).nodeType === "number") {
                        parent.appendChild(item as Node);
                    } else {
                        parent.appendChild(document.createTextNode(String(item)));
                    }
                });
            } else if (rendered && typeof (rendered as any).nodeType === "number") {
                parent.appendChild(rendered as Node);
            } else if (rendered !== null) {
                parent.appendChild(document.createTextNode(String(rendered)));
            }
        };

        // Processa os filhos e adiciona ao container
        processChildren(container, children);

        // Registra um efeito para remover o valor da stack quando o Provider for desmontado


        return Fragment({ children :  container});
    };

    // useContext: retorna o valor atual do contexto (último valor da stack)
    const useContextHook = (): { current: T } => {
        return {
            get current() {
                console.log("useContext - current stack length:", stack.length);
                return stack[stack.length - 1];
            }
        };
    };


    return { Provider, useContext: useContextHook };
}

/**
 * useContext - Hook para consumir um contexto criado com createContext.
 */
export function useContext<T>(context: { useContext: () => T }): T {
    return context.useContext();
}




