// src/index.ts


import { createElement, Fragment  } from "./jsx-runtime";


(globalThis as any).createElement = createElement;
(globalThis as any).Fragment = Fragment;

export { createElement, Fragment ,useRef } from "./jsx-runtime";
export { useState, useEffect,useEffectDep,useDOMEffect } from "./state";
export { matchRoute } from "./matchRoute";
export {  render , useNavigation } from "./createRoute";
export { createContext  } from "./context-vanilla";
