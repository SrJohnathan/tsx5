import { Context, ProviderProps } from "./interface/Context";
import { useState } from "./state";  // Use o useState que retorna [getter, setter]
import { TSX5Node } from "./interface/TSX5Node";
// Supondo que você tenha uma implementação de Fragment que retorne um VDOM consistente
import { Fragment } from "./jsx-runtime";

function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

export function createContext<T>(defaultValue: T): Context<T> {
    // Cria a stack reativa com o valor default
    const [stack, setStack] = useState<T[]>([defaultValue]);

    // Provider: adiciona um novo valor à stack e retorna um VDOM com os children encapsulados num Fragment
    const Provider = ({ value, children }: ProviderProps<T>): TSX5Node => {
        // Atualiza a stack para incluir o novo valor
      //  setStack(prev => [...prev, value]);
        setStack(prev => [value]);
        //console.log("Provider mounted, new stack length:", stack().length + 1);

        // Em vez de criar um container real, retorna o Fragment (VDOM) com os children
        return Fragment({ children });
    };

    // Hook useContext: retorna o valor atual do contexto (último valor da stack)
    const useContextHook = (): { current: T } => {
        return {
            get current() {
               // console.log("useContext - current stack length:", stack().length);
                return stack()[stack().length - 1];
            }
        };
    };

    return { Provider, useContext: useContextHook };
}

export function useContext<T>(context: { useContext: () => T }): T {
    return context.useContext();
}
