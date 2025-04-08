// __tests__/state.test.ts
import {useState, createComputed, batch, useEffectWithDeps} from '../src/state';

describe('Sistema de Estado Reativo', () => {
    test('useState deve retornar o valor inicial e atualizar corretamente', () => {
        const [getCount, setCount] = useState(0);
        expect(getCount()).toBe(0);

        // Atualização direta
        setCount(5);
        expect(getCount()).toBe(5);
    });

    test('useState deve atualizar usando função updater', () => {
        const [getCount, setCount] = useState(10);
        setCount((prev:any) => prev + 2);
        expect(getCount()).toBe(12);
    });

    test('useState deve funcionar como useState (alias)', () => {
        const [getValue, setValue] = useState('inicial');
        expect(getValue()).toBe('inicial');
        setValue('atualizado');
        expect(getValue()).toBe('atualizado');
    });

    test('deve executar o efeito somente quando as dependências mudam', async () => {
        let callCount = 0;
        const effect = () => {
            callCount++;
        };

        // Cria um sinal para simular uma dependência
        const [getValue, setValue] = useState(1);

        // Executa o efeito com a dependência atual
        useEffectWithDeps(effect, [getValue()]);
        expect(callCount).toBe(1);

        // Executa novamente com a mesma dependência; o efeito não deve disparar
        useEffectWithDeps(effect, [getValue()]);
        expect(callCount).toBe(1);

        // Atualiza a dependência
        setValue(2);

        // Executa novamente com a nova dependência; o efeito deve disparar
        useEffectWithDeps(effect, [getValue()]);
        expect(callCount).toBe(2);
    });

    test('batch deve agrupar atualizações', () => {
        const [getCount, setCount] = useState(0);
        batch(() => {
            setCount(1);
            setCount((prev:any) => prev + 1);
        });
        expect(getCount()).toBe(2);
    });
});
