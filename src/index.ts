// src/index.ts









export { createElement, Fragment ,useRef ,jsx,jsxs,jsxDEV } from "./jsx-runtime";
export { useState, useEffect,useEffectDep,useDOMEffect } from "./state";
export { matchRoute } from "./matchRoute";
export {  render , useNavigation } from "./createRoute";
export { createContext ,useContext } from "./context-vanilla";

export type {Ref} from "./interface/Ref"
export type {Context,ProviderProps,Box} from "./interface/Context"
export type {TSX5Node} from "./interface/TSX5Node"



export {ComponentRef ,onFunction} from "./core/ComponentRef"


