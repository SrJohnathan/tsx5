// __mocks__/vite-glob-mock.ts
// Esse mock simula o import.meta.glob para testes com Jest.

import {TextEncoder ,TextDecoder} from "util"

type GlobFunction = (
    pattern: string,
    options?: { [key: string]: any }
) => { [key: string]: () => { default: any } };

// Define a função glob simulada
const glob  = (pattern, options) => {
  // Aqui você pode personalizar o retorno conforme os testes precisem.
  // Exemplo: se o teste espera módulos para Home.tsx e About.tsx.
  return {
    '/src/pages/Home.tsx':   { default: { /* conteúdo simulado do módulo Home */ }} ,
    '/src/pages/About.tsx':  { default: { /* conteúdo simulado do módulo About */ } },
    // Adicione mais entradas conforme necessário
  };
};

// Configura o mock global para import.meta
// Isso fará com que qualquer chamada a import.meta.glob nos testes utilize essa função.
global.import = {
  meta: {
    glob,
  },
};

global.TextEncoder = TextEncoder;

// @ts-ignore
global.TextDecoder = TextDecoder;