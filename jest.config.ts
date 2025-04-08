//jest.config.ts

import type { Config } from 'jest';
import { defaults } from 'jest-config';

const config: Config = {
    // Extensões de arquivos que o Jest deve reconhecer
    moduleFileExtensions: [...defaults.moduleFileExtensions, 'mts', 'ts', 'tsx'],

    // Transformações para processar arquivos TypeScript
    transform: {
        '^.+\\.(ts|tsx)$': 'ts-jest',
    },

    // Diretórios de teste
    testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(ts|tsx)$',


    // Ambiente de teste
    testEnvironment: 'jsdom',



    setupFiles: ['<rootDir>/__mocks__/vite-glob-mock.ts'],





    // Cobertura de código
    collectCoverage: true,
    coverageDirectory: 'coverage',
    collectCoverageFrom: [
        'src/**/*.{ts,tsx}',
        '!**/node_modules/**',
        '!**/dist/**'
    ],
};



export default config;