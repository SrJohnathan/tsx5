// src/index.ts






import { createElement, Fragment  } from "./jsx-runtime";
(globalThis as any).TSX5 = { createElement, Fragment}


export { createElement, Fragment ,useRef ,jsx,jsxs,jsxDEV } from "./jsx-runtime";
export { useState, useEffect,useEffectDep,useDOMEffect , TSX5Observer ,onlyClient ,useMemo,useStateAlt,createStore,useEffectWithDeps,useClientEffect,batch} from "./state";
export { matchRoute } from "./matchRoute";
export {  render , useNavigation } from "./createRoute";
export { createContext ,useContext } from "./context-vanilla";
export { hydrateApp } from "./hidrate_app"
export {setupLogging } from "./logging_configuration"
export { renderToString } from "./renderToString"



export type { LogLevel } from "./logging_configuration"
export type {Ref} from "./interface/Ref"
export type {Context,ProviderProps,Box} from "./interface/Context"
export type {TSX5Node} from "./interface/TSX5Node"
export {ComponentRef ,onFunction} from "./core/ComponentRef"


