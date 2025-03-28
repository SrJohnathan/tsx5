// observer.ts

// Define o tipo para os assinantes (funções que não recebem parâmetros e não retornam nada)
type Subscriber = () => void;

// Variável global para rastrear a função atualmente sendo registrada como dependente
let targetFunc: (() => void) | null = null;

export class Observer {
    private subs: Set<Subscriber>;

    constructor() {
        this.subs = new Set();
    }

    // Adiciona a função targetFunc (se existir) à lista de assinantes
    add(): void {
        if (targetFunc) {
            this.subs.add(targetFunc);
        }
    }

    // Notifica todos os assinantes chamando cada um deles
    notify(): void {
        this.subs.forEach((sub) => sub());
    }
}

// Helper functions
const isFunction = (target: any): target is Function =>
    typeof target === 'function';

const isObject = (target: any): target is object =>
    typeof target === 'object' && target !== null;

// Função para copiar as propriedades de 'acc' para 'target'
const clone = (acc: any, target: any): any => {
    if (isObject(acc)) {
        Object.keys(acc).forEach((key) => {
            // @ts-ignore
            if (isObject(acc[key])) {
                // @ts-ignore
                target[key] = clone(acc[key], target[key]);
            } else {
                // @ts-ignore
                target[key] = acc[key];
            }
        });
    } else {
        target = acc;
    }
    return target;
};

// Função privada que retorna o setter para atualizar o state
const setter = <T>(
    prx: { data: T },
    dep: Observer
) => (data: T | ((prev: T) => T)): void => {
    const result = isFunction(data) ? (data as (prev: T) => T)(prx.data) : data;
    if (isObject(result)) {
        clone(result, prx.data);
    } else {
        prx.data = result;
    }
    dep.notify();
};

// Cria as opções do Proxy, interceptando o acesso às propriedades
const createOptions = (dep: Observer): ProxyHandler<any> => ({
    get(target, key) {
        dep.add();
        if (isObject(target[key])) {
            return new Proxy(target[key], createOptions(dep));
        }
        return target[key];
    },
});

// Public functions

/**
 * useState - Cria um estado reativo.
 *
 * @param data - Valor inicial do estado.
 * @returns Um array contendo:
 *   1. Um getter para obter o valor atual (função que retorna T).
 *   2. Um setter para atualizar o valor (aceita T ou uma função de atualização).
 */
export const useState = <T>(
    data: T
): [() => T, (newValue: T | ((prev: T) => T)) => void] => {
    const dep = new Observer();
    const prx = new Proxy({ data }, createOptions(dep));
    return [() => prx.data, setter(prx, dep)];
};

/**
 * useEffect - Registra um efeito que será executado e rastreado como dependência.
 *
 * @param fun - Função de efeito a ser executada.
 */
export const useEffect = (fun: () => void): void => {
    targetFunc = fun;
    targetFunc();
    targetFunc = null;
};


export const useDOMEffect = (fun: () => void): void => {
    if (document.readyState === "complete" || document.readyState === "interactive") {
        // Se o DOM já estiver pronto, executa o efeito reativo
        useEffect(fun);
    } else {
        // Caso contrário, aguarda o DOM carregar e então executa o efeito
        window.addEventListener("DOMContentLoaded", fun, { once: true });
    }
};

