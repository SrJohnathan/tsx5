// jsx-runtime.ts

import {useEffect, useEffectDep} from "./state";
import {TSX5Node} from "./interface/TSX5Node";





export function jsx(type:any, props:any, key:any) {
    return createElement(type, props, ...(props.children ? [].concat(props.children) : []));

}

export function jsxs(type:any, props:any, key:any) {
    const children = Array.isArray(props.children) ? props.children : [props.children];
    return createElement(type, props, ...children);
}

export function jsxDEV(type:any, props:any, key:any, isStaticChildren:any, source:any, self:any) {
    return jsx(type, props, key);
}



export function createElement(tag: any, props: any, ...children: TSX5Node[]): TSX5Node {

    if (typeof document === "undefined") {
        return { tag, props: props || {}, children : children as any };
    }


    if (typeof tag === 'string') {
        const element = document.createElement(tag);

        // Atribui propriedades simples (ex: class, id)
        if (props) {
            const propsKeys = Object.keys(props);
            for (const key of propsKeys) {
                if (key === 'children' || key === 'ref') continue;
                const value = props[key];
                if (key.startsWith("on") && typeof value === "function") {
                    const eventName = key.slice(2).toLowerCase();
                    element.addEventListener(eventName, value);
                } else if (key === "style" && typeof value === "object") {
                    Object.assign(element.style, value);
                } else if (key === "className") {
                    element.setAttribute("class", value);
                } else if (key === "dataset" && typeof value === "object") {
                    Object.assign(element.dataset, value);
                } else if (key in element) {
                    (element as any)[key] = value;
                } else {
                    element.setAttribute(key, value);
                }
            }



        }


        if (props && props.ref) {
            props.ref.current = element;
        }

        // Usa useEffect para monitorar alterações nos children e atualizar o elemento
        useEffect(() => {
            // Converte children em um array, caso não seja
            const list = Array.isArray(children) ? children : [children];
            // Se algum child for uma função, invoca para obter o valor atual
            // @ts-ignore
            const res = list.map(child => typeof child === 'function' ? child() : child);
            // Limpa o conteúdo atual e adiciona os novos filhos
            element.innerHTML = '';
            appendChildren(element, res);
        });

        return element as any;
    } else if (typeof tag === 'function') {
        // Se 'tag' for uma função, trata-a como um componente e a invoca
        return tag({...props, children});
    } else {
        throw new Error("Tipo de elemento desconhecido: " + tag);
    }
}

function appendChildren(parent: Node, children: any[]) {
    children.forEach(child => {
        if (Array.isArray(child)) {
            appendChildren(parent, child);
        } else if (child instanceof Node) {
            parent.appendChild(child);
        } else {
            parent.appendChild(document.createTextNode(child));
        }
    });
}




/**
 * Fragment – Representa um fragmento no TSX5.
 * Retorna sempre uma estrutura virtual consistente com as propriedades:
 *   - tag: "Fragment"
 *   - props: {}
 *   - children: Array<any>
 * Opcionalmente, no client, inclui a propriedade _element com um DocumentFragment real.
 */
export function Fragment(props: { children?: any }): TSX5Node {
    // Converte os children para array, mesmo que seja um único elemento
    const childrenArray = Array.isArray(props.children) ? props.children : [props.children];

    // Se estivermos no client, você pode usar useEffect para efeitos adicionais,
    // mas não manipule nem retorne um DocumentFragment real.
    if (typeof document !== "undefined") {
        useEffectDep(() => {
            // Aqui você poderia executar efeitos client-side relacionados aos children,
            // sem alterar o formato do VDOM retornado.
            // Exemplo: console.log("Fragment atualizado no client", childrenArray);
            console.debug("Fragment atualizado no client", { children: childrenArray });

        }, [props.children]);
    }

    // Retorna sempre um objeto VDOM consistente, sem nenhum nó real do DOM
    return {
        tag: "Fragment",
        props: {},
        children: childrenArray,
    };
}



export function useRef<T>(initialValue: T | null = null) {
    return {current: initialValue};
}
