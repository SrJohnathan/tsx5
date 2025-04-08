// __tests__/hydrate.test.ts
import { renderToString } from '../src/renderToString';
import { hydrate } from '../src/hidrate'; // ajuste o caminho
import { JSDOM } from 'jsdom';
describe('hydrateApp', () => {
    test('hydrate anexa event handlers corretamente', () => {
        // Cria um VDOM simples para um botão
        let clicked = false;
        const vdom = {
            tag: "button",
            props: {
                onClick: () => {
                    clicked = true;
                },
                className: "btn"
            },
            children: "Clique aqui"
        };

        // Cria um DOM simulado usando JSDOM
        const dom = new JSDOM(`<button class="btn">Clique aqui</button>`);
        const root = dom.window.document.body.firstChild as HTMLElement;

        // Aplica a hidratação
        hydrate(root, () => vdom);

        // Simula um clique
        const event = new dom.window.Event("click", {bubbles: true});
        root.dispatchEvent(event);

        expect(clicked).toBe(true);
    });

    test('deve anexar event handlers corretamente durante a hidratação', () => {
        // Configura um DOM simulado com JSDOM
        const dom = new JSDOM(`<div id="root"><button class="btn"><i>Click me</i></button></div>`, {
            url: 'http://localhost'
        });
        const document = dom.window.document;
        const root = document.getElementById('root');
        expect(root).toBeDefined();

        let clicked = false;

        // Cria um VDOM para o botão com event handler onClick
        const vdom = {
            tag: "button",
            props: {
                onClick: () => {
                    clicked = true;
                },
                className: "btn"
            },
            children: [
                {tag: "i", props: {}, children: ["Click me"]}
            ]
        };

        // Para os testes, vamos simular a renderização/hidratação chamando hydrate
        // que recebe o container e uma função que retorna o VDOM
        hydrate(root!, () => vdom);

        // Agora, simulamos o clique no botão
        const button = root!.querySelector('button');
        expect(button).toBeDefined();

        // Dispara o evento click
        const event = new dom.window.Event("click", {bubbles: true});
        button!.dispatchEvent(event);

        // Verifica se o handler foi executado
        expect(clicked).toBe(true);
    });
})