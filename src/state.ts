// state.ts

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
const clone = (source: any, target: any): any => {
    if (Array.isArray(source)) {
        if (!Array.isArray(target)) target = [];
        source.forEach((item, index) => {
            target[index] = isObject(item) ? clone(item, target[index]) : item;
        });
        return target;
    } else if (isObject(source)) {
        if (!isObject(target)) target = {};
        Object.keys(source).forEach((key) => {
            // @ts-ignore
            target[key] = isObject(source[key])
                // @ts-ignore
                ? clone(source[key], target[key])
                // @ts-ignore
                : source[key];
        });
        return target;
    } else {
        return source;
    }
};

// Função privada que retorna o setter para atualizar o state
const setter = <T>(prx: { data: T }, dep: Observer) => (
    data: T | ((prev: T) => T)
): void => {
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
export const useState = <T>(data: T): [() => T, (newValue: T | ((prev: T) => T)) => void] => {
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



const effectDeps = new WeakMap<() => void, any[]>();

function areDepsEqual(prevDeps: any[], nextDeps: any[]): boolean {
    if (prevDeps.length !== nextDeps.length) return false;
    for (let i = 0; i < prevDeps.length; i++) {
        if (!Object.is(prevDeps[i], nextDeps[i])) return false;
    }
    return true;
}

/**
 * useEffectDep - Executa o efeito somente se os valores retornados pelos getters (dependências)
 * mudarem em relação à execução anterior.
 *
 * @param fun - Função de efeito a ser executada.
 * @param deps - Array de funções (getters) que retornam os valores de dependência.
 */
export const useEffectDep = (fun: () => void, deps: Array<() => any>): void => {
    // Obtém os valores atuais das dependências
    const currentDeps = deps.map(dep => dep());
    const prevDeps = effectDeps.get(fun);
    if (!prevDeps || !areDepsEqual(prevDeps, currentDeps)) {
        fun();
        effectDeps.set(fun, currentDeps);
    }
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

