export function hydrate(root: HTMLElement, renderFn: () => any): void {
    const vdom = renderFn();

    // Cria uma fila simples para reconciliação inicial.
    const reconcile = (domNode: any, vNode: any): void => {
        // se vNode é primitivo, atualiza texto
        if (typeof vNode === "string" || typeof vNode === "number") {
            if (domNode.nodeType === Node.TEXT_NODE) {
                if (domNode.nodeValue !== String(vNode)) {
                    domNode.nodeValue = String(vNode);
                }
            } else {
                domNode.replaceWith(document.createTextNode(String(vNode)));
            }
            return;
        }

        // se vNode é um HTMLElement real, substitui completamente
        if (vNode instanceof HTMLElement) {
            domNode.replaceWith(vNode);
            return;
        }


        if (vNode.props?.client && domNode.hasAttribute("data-tsx5-client")) {
            const realNode = renderToDOM(vNode);
            domNode.replaceWith(realNode);
            return;
        }

        // se forem elementos com tags diferentes, recria
        if ((domNode as HTMLElement).tagName?.toLowerCase() !== vNode.tag?.toLowerCase()) {
            const newElm = document.createElement(vNode.tag);
            domNode.replaceWith(newElm);
            domNode = newElm;
        }

        // Reaplica props/eventos no elemento
        applyProps(domNode as HTMLElement, vNode.props || {});

        // Recursivamente reconcilia filhos
        const domChildren = Array.from(domNode.childNodes);
        const vChildren = Array.isArray(vNode.children) ? vNode.children : [vNode.children];

        for (let i = 0; i < vChildren.length; i++) {
            if (domChildren[i]) {
                reconcile(domChildren[i], vChildren[i]);
            } else {
                // Caso haja mais elementos virtuais que DOM, adiciona novos
                domNode.appendChild(renderToDOM(vChildren[i]));
            }
        }

        // Remove nós DOM excedentes
        for (let i = vChildren.length; i < domChildren.length; i++) {
            domNode.removeChild(domChildren[i]);
        }
    };

    // Inicializa reconciliação
    reconcile(root, vdom);
}

// Aplica corretamente propriedades e eventos:
function applyProps(elm: HTMLElement, props: any) {
    for (const key in props) {function patchNode(domNode: any, vdom: any): void {
        if (vdom == null) return;

        if (
            (domNode.nodeType === Node.ELEMENT_NODE && domNode.nodeName.toLowerCase() !== vdom.tag?.toLowerCase()) ||
            (domNode.nodeType === Node.TEXT_NODE && (typeof vdom !== "string" && typeof vdom !== "number"))
        ) {
            const newDomNode = renderToDOM(vdom);
            domNode.replaceWith(newDomNode);
            return;
        }

        if (typeof vdom === "string" || typeof vdom === "number" || typeof vdom === "boolean") {
            const newText = String(vdom);
            if (domNode.nodeType === Node.TEXT_NODE && domNode.nodeValue !== newText) {
                domNode.nodeValue = newText;
            }
            return;
        }

        if (Array.isArray(vdom)) {
            const domChildren = Array.from(domNode.childNodes);
            let max = Math.max(domChildren.length, vdom.length);
            for (let i = 0; i < max; i++) {
                if (i < vdom.length && i < domChildren.length) {
                    patchNode(domChildren[i], vdom[i]);
                } else if (i < vdom.length) {
                    domNode.appendChild(renderToDOM(vdom[i]));
                } else {
                    domNode.removeChild(domChildren[i]);
                    i--;
                    max--;
                }
            }
            return;
        }

        if (domNode.nodeType === Node.ELEMENT_NODE && vdom.tag) {
            const element = domNode as HTMLElement;
            const props = vdom.props || {};

            for (const key in props) {
                if (key === 'children' || key === 'ref') continue;
                const value = props[key];

                if (key.startsWith("on") && typeof value === "function") {
                    const eventName = key.slice(2).toLowerCase();
                    const handlerKey = `__${eventName}_handler`;
                    if ((element as any)[handlerKey]) {
                        element.removeEventListener(eventName, (element as any)[handlerKey]);
                    }
                    element.addEventListener(eventName, value);
                    (element as any)[handlerKey] = value;
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

            const vdomChildren = vdom.children || [];
            const domChildren = Array.from(element.childNodes);
            let max = Math.max(domChildren.length, vdomChildren.length);

            for (let i = 0; i < max; i++) {
                if (i < vdomChildren.length && i < domChildren.length) {
                    patchNode(domChildren[i], vdomChildren[i]);
                } else if (i < vdomChildren.length) {
                    element.appendChild(renderToDOM(vdomChildren[i]));
                } else {
                    element.removeChild(domChildren[i]);
                    i--;
                    max--;
                }
            }
        }
    }

        if (key === 'children' || key === 'ref') continue;
        const value = props[key];

        if (key.startsWith('on') && typeof value === 'function') {
            const eventName = key.slice(2).toLowerCase();
            elm.addEventListener(eventName, value);
        } else if (key === 'className') {
            elm.setAttribute('class', value);
        } else if (key === 'style' && typeof value === 'object') {
            Object.assign(elm.style, value);
        } else if (key in elm) {
            (elm as any)[key] = value;
        } else {
            elm.setAttribute(key, value);
        }
    }
}

// Reutilize renderToDOM:
function renderToDOM(node: any): Node {
    if (node instanceof Node) return node;
    if (typeof node === 'string') return document.createTextNode(node);
    const el = document.createElement(node.tag);
    applyProps(el, node.props);
    if (node.children) {
        const children = Array.isArray(node.children) ? node.children : [node.children];
        children.forEach(child => el.appendChild(renderToDOM(child)));
    }
    return el;
}
