
import {Fragment as TSX5Fragment} from "./jsx-runtime"
/**
 * Converte uma árvore virtual (TSX5Node) em uma string HTML para SSR.
 *
 * @param node - A árvore virtual ou nó de texto
 * @returns A string HTML resultante
 */



export function renderToString(node: any): string {
    // Caso base: se for um valor primitivo, converte para string
    if (typeof node === 'string' || typeof node === 'number' || typeof node === 'boolean') {
        return String(node);
    }
    if (node == null) return '';

    // Se for um array, renderiza cada elemento e concatena
    if (Array.isArray(node)) {
        return node.map(renderToString).join('');
    }

    // Se o nó for um componente (função)
    if (typeof node.tag === 'function') {
        // Se for o Fragment, renderiza apenas os children
        if (
            node.tag === TSX5Fragment ||
            node.tag.name === "Fragment" ||
            node.tag.name === "<>"
        ) {
            return renderToString(node.children || node.props?.children);
        }
        // Caso seja um componente customizado, invoca-o com os props e children
        const componentOutput = node.tag({ ...node.props, children: node.children });
        if (componentOutput === undefined) {
            console.warn(`O componente ${node.tag.name || 'anonymous'} retornou undefined.`);
            return '';
        }
        return renderToString(componentOutput);
    }

    // Se for um elemento HTML com tag "Fragment" (em formato de string), renderiza apenas os children
    if (typeof node.tag === 'string' && node.tag === "Fragment") {
        return renderToString(node.children || node.props?.children);
    }

    // Caso seja um elemento HTML normal
    const { tag, props = {}, children } = node;
    const tagName = typeof tag === 'string' ? tag : tag.name;

    // Converte propriedades em atributos HTML
    let propsString = '';
    for (const [key, value] of Object.entries(props)) {
        if (key === 'children' || value == null) continue;
        // Ignora event handlers no SSR
        if (key.startsWith('on') && typeof value === 'function') continue;
        // Converte "className" para "class"
        const attrKey = key === 'className' ? 'class' : key;
        if (key === 'style' && typeof value === 'object') {
            const styleStr = Object.entries(value)
                .map(([k, v]) => `${k.replace(/([A-Z])/g, '-$1').toLowerCase()}:${v}`)
                .join(';');
            propsString += ` style="${styleStr}"`;
        } else if (
            typeof value === 'string' ||
            typeof value === 'number' ||
            typeof value === 'boolean'
        ) {
            propsString += ` ${attrKey}="${String(value).replace(/"/g, '&quot;')}"`;
        }
    }

    // Lista de tags auto-fechantes
    const selfClosingTags = [
        'area', 'base', 'br', 'col', 'embed', 'hr', 'img',
        'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'
    ];
    if (selfClosingTags.includes(tagName)) {
        return `<${tagName}${propsString} />`;
    }

    // Renderiza os filhos recursivamente
    const childrenString = renderToString(children);
    return `<${tagName}${propsString}>${childrenString}</${tagName}>`;
}
