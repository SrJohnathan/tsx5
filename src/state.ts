/**
 * Tipos fundamentais e definições
 */
type Subscriber = () => void;
type Cleanup = void | (() => void);
type EffectFn = () => Cleanup;
type DependencyList = any[];

/**
 * Verifica se estamos em ambiente SSR (server-side rendering)
 */
export const isSSR = (): boolean => typeof window === "undefined";

/**
 * Sistema de gerenciamento de efeitos
 * Gerencia a execução, limpeza, e dependências dos efeitos.
 */
class EffectSystem {
    private currentEffect: EffectFn | null = null;
    private effectCleanups = new Map<EffectFn, Cleanup>();
    private effectDependencies = new WeakMap<EffectFn, DependencyList>();
    private scheduledEffects = new Set<EffectFn>();
    private isScheduling = false;
    private frameId: number | null = null;

    /**
     * Define o efeito atual que está sendo executado.
     */
    setCurrentEffect(effect: EffectFn | null): void {
        this.currentEffect = effect;
    }

    /**
     * Retorna o efeito atual.
     */
    getCurrentEffect(): EffectFn | null {
        return this.currentEffect;
    }

    /**
     * Registra uma função de limpeza para um efeito.
     */
    registerCleanup(effect: EffectFn, cleanup: Cleanup): void {
        this.effectCleanups.set(effect, cleanup);
    }

    /**
     * Executa a função de limpeza associada a um efeito.
     */
    runCleanup(effect: EffectFn): void {
        const cleanup = this.effectCleanups.get(effect);
        if (typeof cleanup === 'function') {
            try {
                cleanup();
            } catch (err) {
                console.error('Erro na função de limpeza de efeito:', err);
            }
        }
        this.effectCleanups.delete(effect);
    }

    /**
     * Verifica se as dependências mudaram.
     */
    haveDepsChanged(effect: EffectFn, newDeps: DependencyList): boolean {
        const oldDeps = this.effectDependencies.get(effect);
        if (!oldDeps) return true;
        if (oldDeps.length !== newDeps.length) return true;
        return newDeps.some((dep, i) => !Object.is(dep, oldDeps[i]));
    }

    /**
     * Armazena as dependências de um efeito.
     */
    setDependencies(effect: EffectFn, deps: DependencyList): void {
        this.effectDependencies.set(effect, deps);
    }

    /**
     * Agenda um efeito para execução no próximo microtask.
     * Usa requestAnimationFrame para efeitos relacionados à UI (apenas no client).
     */
    scheduleEffect(effect: EffectFn): void {
        this.scheduledEffects.add(effect);
        if (!this.isScheduling && !isSSR()) {
            this.isScheduling = true;
            if (this.frameId === null) {
                this.frameId = requestAnimationFrame(() => {
                    this.frameId = null;
                    queueMicrotask(() => this.flushEffects());
                });
            }
        }
    }

    /**
     * Executa todos os efeitos agendados.
     */
    flushEffects(): void {
        if (isSSR()) return; // Não executa efeitos no SSR
        const effects = [...this.scheduledEffects];
        this.scheduledEffects.clear();
        this.isScheduling = false;
        for (const effect of effects) {
            try {
                this.runCleanup(effect);
                this.setCurrentEffect(effect);
                const cleanup = effect();
                this.setCurrentEffect(null);
                this.registerCleanup(effect, cleanup);
            } catch (err) {
                console.error('Erro na execução do efeito:', err);
            }
        }
    }

    /**
     * Executa um efeito imediatamente.
     */
    runEffect(effect: EffectFn): void {
        if (isSSR()) return; // Não executa efeitos no SSR
        try {
            this.runCleanup(effect);
            this.setCurrentEffect(effect);
            const cleanup = effect();
            this.registerCleanup(effect, cleanup);
        } catch (err) {
            console.error('Erro na execução do efeito:', err);
        } finally {
            this.setCurrentEffect(null);
        }
    }
}

// Singleton global para gerenciar efeitos
const effectSystem = new EffectSystem();

/**
 * Classe Observer para gerenciamento de estado reativo.
 * Permite que assinantes (efeitos) sejam notificados quando o valor mudar.
 */
export class TSX5Observer<T = any> {
    private subscribers = new Set<Subscriber>();
    private value: T;

    constructor(initialValue: T) {
        this.value = initialValue;
    }

    /**
     * Obtém o valor atual e registra dependência.
     */
    get(): T {
        this.trackDependency();
        return this.value;
    }

    /**
     * Define um novo valor e notifica os assinantes.
     */
    set(newValue: T): void {
        if (Object.is(this.value, newValue)) return;
        this.value = newValue;
        this.notify();
    }

    /**
     * Atualiza o valor usando uma função.
     */
    update(updater: (current: T) => T): void {
        const newValue = updater(this.value);
        this.set(newValue);
    }

    /**
     * Rastreia a dependência atual, se houver um efeito em execução.
     */
    trackDependency(): void {
        if (isSSR()) return;
        const currentEffect = effectSystem.getCurrentEffect();
        if (currentEffect) {
            this.subscribers.add(currentEffect);
        }
    }

    /**
     * Notifica todos os assinantes agendando os efeitos.
     */
    notify(): void {
        if (isSSR()) return;
        for (const subscriber of this.subscribers) {
            effectSystem.scheduleEffect(subscriber);
        }
    }

    /**
     * Remove um assinante.
     */
    unsubscribe(subscriber: Subscriber): void {
        this.subscribers.delete(subscriber);
    }
}

/**
 * Utilitários para verificação de tipos.
 */
const isFunction = (value: unknown): value is Function => typeof value === 'function';
const isObject = (value: unknown): value is object => value !== null && typeof value === 'object';
const isPrimitive = (value: unknown): boolean => value === null || (typeof value !== 'object' && typeof value !== 'function');

/**
 * Clonagem profunda de valores – usada para atualizar o estado sem perder referências.
 */
function deepClone<T>(value: T): T {
    if (isPrimitive(value)) return value;
    if (Array.isArray(value)) return value.map(item => deepClone(item)) as unknown as T;
    if (isObject(value)) {
        const result: Record<string, any> = {};
        for (const key in value as Record<string, any>) {
            if (Object.prototype.hasOwnProperty.call(value, key)) {
                result[key] = deepClone((value as Record<string, any>)[key]);
            }
        }
        return result as unknown as T;
    }
    return value;
}

/**
 * Cria um estado reativo: [getter, setter].
 * Uso: const [count, setCount] = createSignal(0);
 */
function createSignal<T>(initialValue: T): [() => T, (value: T | ((prev: T) => T)) => void] {
    const observer = new TSX5Observer<T>(initialValue);
    const getter = () => observer.get();
    const setter = (next: T | ((prev: T) => T)) => {
        if (isFunction(next)) {
            observer.update(next as (prev: T) => T);
        } else {
            observer.set(next);
        }
    };
    return [getter, setter];
}

/**
 * useState - Alias para createSignal para compatibilidade.
 */
export function useState<T>(initialValue: T): [() => T, (value: T | ((prev: T) => T)) => void] {
    return createSignal(initialValue);
}

/**
 * Cria um objeto reativo onde cada propriedade se torna um sinal independente.
 */
export function createStore<T extends Record<string, any>>(initialState: T): {
    [K in keyof T]: [() => T[K], (value: T[K] | ((prev: T[K]) => T[K])) => void]
} {
    const store: any = {};
    for (const key in initialState) {
        if (Object.prototype.hasOwnProperty.call(initialState, key)) {
            store[key] = createSignal(initialState[key]);
        }
    }
    return store;
}

/**
 * useStateAlt - Alias para createStore, para uso quando se deseja ter vários sinais.
 */
export const useStateAlt = createStore;

/**
 * Cria um efeito reativo que será executado assim que for registrado.
 * No SSR, os efeitos não são executados.
 */
export function useEffect(effect: EffectFn): void {
    if (isSSR()) return; // Impede execução de efeitos no SSR
    effectSystem.runEffect(effect);
}

/**
 * Cria um efeito com dependências explícitas.
 * Só executa novamente se as dependências mudarem.
 */
/*export function useEffectWithDeps(effect: EffectFn, deps: DependencyList): void {
    if (isSSR()) return;
    const wrappedEffect = () => effect();
    if (effectSystem.haveDepsChanged(wrappedEffect, deps)) {
        effectSystem.setDependencies(wrappedEffect, deps);
        effectSystem.runEffect(wrappedEffect);
    }
}*/

export function useEffectWithDeps(effect: EffectFn, deps: DependencyList): void {
    if (isSSR()) return;
    // Neste exemplo, vamos executar o efeito imediatamente se as dependências mudarem.
    // Em um sistema mais robusto, esse efeito ficaria registrado e reagiria a mudanças.
    if (effectSystem.haveDepsChanged(effect, deps)) {
        effectSystem.setDependencies(effect, deps);
        effectSystem.runEffect(effect);
    }
}

/**
 * useEffectDep - Alias para useEffectWithDeps para compatibilidade.
 */
export const useEffectDep = useEffectWithDeps;

/**
 * useDOMEffect - Executa um efeito que depende do DOM, somente no client.
 */
export function useDOMEffect(effect: EffectFn): void {
    if (isSSR()) return;
    if (document.readyState === "complete" || document.readyState === "interactive") {
        useEffect(effect);
    } else {
        window.addEventListener("DOMContentLoaded", effect, { once: true });
    }
}

/**
 * useMemo - Cria um valor memoizado que só recalcula quando as dependências mudam.
 */
export function useMemo<T>(compute: () => T, deps: DependencyList): () => T {
    const [value, setValue] = createSignal(compute());
    useEffectWithDeps(() => {
        setValue(compute());
    }, deps);
    return value;
}

/**
 * onlyClient - Executa o callback somente no client.
 */
export function onlyClient(callback: () => void): void {
    if (!isSSR()) {
        callback();
    }
}

/**
 * useClientEffect - Executa um efeito somente uma vez no client após a hidratação.
 */
export function useClientEffect(effect: EffectFn): void {
    if (isSSR()) return;
    let hasRun = false;
    useEffect(() => {
        if (!hasRun) {
            hasRun = true;
            return effect();
        }
    });
}

/**
 * createComputed - Cria um valor computado que recalcula automaticamente quando as dependências mudam.
 */
export function createComputed<T>(compute: () => T): () => T {
    const [value, setValue] = createSignal(compute());
    useEffect(() => {
        setValue(compute());
    });
    return value;
}

export function createComputedTest<T>(compute: () => T, deps: DependencyList): () => T {
    const [value, setValue] = createSignal(compute());
    useEffectWithDeps(() => {
        setValue(compute());
    }, deps);
    return value;
}




/**
 * batch - Agrupa atualizações para evitar múltiplas execuções de efeitos.
 */
export function batch(fn: () => void): void {
    try {
        fn();
    } finally {
        if (!isSSR()) {
            queueMicrotask(() => {
                effectSystem.flushEffects();
            });
        }
    }
}



/*export function useStateSocket<T>(initialValue: T, path: string): () =>  T {
    const [value, setValue] = useState<T>(initialValue);

    if (!isSSR()) {
        const ws = getOrCreateWebSocket(path);

        const listener = (data: T) => {
            setValue(data);
        };

        if (!socketListeners.has(path)) {
            socketListeners.set(path, new Set());
        }
        socketListeners.get(path)!.add(listener);
    }

    return value
}*/

