// jsx-runtime.ts

import {useEffect} from "./state";

export function createElement(tag: any, props: any, ...children: any[]): HTMLElement | Text {
    if (typeof tag === 'string') {
        const element = document.createElement(tag);

        // Atribui propriedades simples (ex: class, id)
        if (props) {
            Object.keys(props).forEach(key => {
                if (key === 'children') return;
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
        return tag({ ...props, children });
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
export function Fragment(props: { children: any }) {
    return props.children;
}
