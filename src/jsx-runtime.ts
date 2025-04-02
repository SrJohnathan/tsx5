// jsx-runtime.ts

import {useEffect} from "./state";
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



    if (typeof tag === 'string') {
        const element = document.createElement(tag);

        // Atribui propriedades simples (ex: class, id)
        if (props) {
            Object.keys(props).forEach(key => {
                if (key === 'children' || key === 'ref') return; // Ignora children e ref aqui
                if (key.startsWith("on") && typeof props[key] === "function") {
                    // Converte "onClick" em "click", por exemplo
                    const eventName = key.slice(2).toLowerCase();
                    element.addEventListener(eventName, props[key]);
                } else if (key === "className") {
                    element.setAttribute("class", props[key]);
                } else {
                    element.setAttribute(key, props[key]);
                }
            });
        }


        if (props && props.ref) {
            props.ref.current = element;
        }

        // Usa useEffect para monitorar alterações nos children e atualizar o elemento
        useEffect(() => {
            // Converte children em um array, caso não seja
            const list = Array.isArray(children) ? children : [children];
            // Se algum child for uma função, invoca para obter o valor atual
            const res = list.map(child => typeof child === 'function' ? child() : child);
            // Limpa o conteúdo atual e adiciona os novos filhos
            element.innerHTML = '';
            appendChildren(element, res);
        });

        return element;
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

// Implementação simples de Fragment (apenas retorna os filhos)
export function Fragment(props: { children?: any }): DocumentFragment {
    const fragment = document.createDocumentFragment();

    if (props.children == null) {
        // Se não houver children, retorna o fragmento vazio


        return fragment;
    }
    // Normaliza os children para um array
    const childrenArray = Array.isArray(props.children) ? props.children : [props.children];

    childrenArray.forEach(child => {
        if (child instanceof Node) {
            fragment.appendChild(child);
        } else if (Array.isArray(child)) {
            // Se child é um array, processa recursivamente
            child.forEach(nested => {
                if (nested instanceof Node) {
                    fragment.appendChild(nested);
                } else {


                    fragment.appendChild(document.createTextNode(String(nested)));
                }
            });
        } else {
            // Se não for Node, converte para string e cria um TextNode

            fragment.appendChild(document.createTextNode(String(child)));
        }
    });

    return fragment;
}


export function useRef<T>(initialValue: T | null = null) {
    return {current: initialValue};
}
