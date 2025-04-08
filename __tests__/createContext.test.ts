// __tests__/createContext.test.ts


import {createContext} from "../src/context-vanilla";

describe('createContext', () => {
    test('Provider retorna um VDOM com Fragment', () => {
        const defaultValue = "default";
        const { Provider } = createContext(defaultValue);

        // Simule uma chamada do Provider com um valor e um child
        const vdom:any = Provider({ value: "newValue", children: "Hello" });

        // Espera que o VDOM seja um objeto com a propriedade "tag" igual a "Fragment"
        expect(vdom).toBeDefined();
        expect(vdom.tag).toBe("Fragment");

        // O children deve ser definido (aqui, usamos o container retornado)
        expect(vdom.children).toBeDefined();
        // Como nosso Fragment foi definido para retornar o objeto virtual com os children
        // diretamente, espera-se que o children seja igual ao que passamos (no caso, "Hello").
        // Dependendo da implementação de processChildren, isso pode ser apenas "Hello" ou um array contendo "Hello".
        if (Array.isArray(vdom.children)) {
            expect(vdom.children[0]).toBe("Hello");
        } else {
            expect(vdom.children).toBe("Hello");
        }
    });

    test('useContext retorna o valor atual da stack', () => {
        const { Provider, useContext: useCtx } = createContext("initial");

        // Antes de chamar Provider, o valor atual deve ser "initial"
        expect(useCtx().current).toBe("initial");

        // Chama Provider para atualizar o contexto
        Provider({ value: "updated", children: "Child" });
        expect(useCtx().current).toBe("updated");

        // Chamando Provider novamente atualiza para o novo valor
        Provider({ value: "another", children: "Another Child" });
        expect(useCtx().current).toBe("another");
    });
});
