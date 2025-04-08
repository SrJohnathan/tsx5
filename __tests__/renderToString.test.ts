// renderToString.test.ts
import { renderToString } from '../src/renderToString';
import { TSX5Node } from '../src/interface/TSX5Node';

describe('renderToString', () => {
    // Exemplo 1: Texto simples
    test('renderiza nós de texto corretamente', () => {
        expect(renderToString("Hello")).toBe("Hello");
        expect(renderToString(123)).toBe("123");
    });

    // Exemplo 2: Elemento simples com props
    test('renderiza um elemento com atributos corretamente', () => {
        const vdom = {
            tag: "div",
            props: { className: "my-class", title: "Test" },
            children: "Content"
        };
        // Note que className deve ser convertido para class
        const expected = `<div class="my-class" title="Test">Content</div>`;
        expect(renderToString(vdom)).toBe(expected);
    });

    // Exemplo 3: Tag auto-fechante
    test('renderiza self-closing tags corretamente', () => {
        const vdom = {
            tag: "img",
            props: { src: "image.jpg", alt: "Image" },
            children: []
        };
        const expected = `<img src="image.jpg" alt="Image" />`;
        expect(renderToString(vdom)).toBe(expected);
    });

    // Exemplo 4: Fragment
    test('renderiza um Fragment corretamente', () => {
        const vdom = {
            tag: "Fragment",
            props: {},
            children: [
                { tag: "span", props: { className: "a" }, children: "A" },
                { tag: "span", props: { className: "b" }, children: "B" }
            ]
        };
        const expected = `<span class="a">A</span><span class="b">B</span>`;
        expect(renderToString(vdom)).toBe(expected);
    });

    // Exemplo 5: Componente funcional
    test('renderiza um componente funcional corretamente', () => {
        function MyComponent(props: { name: string }): TSX5Node {
            // Retorna um VDOM consistente
            return { tag: "p", props: { className: "p" }, children: `Hello ${props.name}` };
        }

        const vdom = { tag: MyComponent, props: { name: "World" }, children: [] };
        const expected = `<p class="p">Hello World</p>`;
        expect(renderToString(vdom)).toBe(expected);
    });
});