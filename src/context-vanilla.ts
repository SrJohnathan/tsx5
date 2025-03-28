




// Definição dos tipos para o Provider
type ContextProviderProps<T> = {
    value: T;
    children: any;
};


/**
import { createContext } from "./context";
export const { Provider: ThemeProvider, useContext: useTheme } = createContext("light");
*/
export function createContext<T>(defaultValue: T) {
    // Usamos um símbolo único para identificar o contexto
    // @ts-ignore
    const contextKey = Symbol("context");

    // Usamos uma stack para suportar Providers aninhados
    let stack: T[] = [];

    const Provider = (props: ContextProviderProps<T>) => {
        // Empurra o valor atual para a stack
        stack.push(props.value);

        // Renderiza os filhos (assumindo renderização síncrona)
        const rendered = props.children;

        // Remove o valor após a renderização dos filhos
        stack.pop();
        return rendered;
    };

    const useContext = (): T => {
        // Se a stack tiver algum valor, retorna o último inserido
        return stack.length > 0 ? stack[stack.length - 1] : defaultValue;
    };

    return { Provider, useContext };
}
