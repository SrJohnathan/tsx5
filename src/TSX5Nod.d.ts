import {Elm} from "./global";
export interface TSX5Type {
    tag: string | Function;
    props?: Record<string, any>;
    children?: Elm | Elm[];
    // Outras propriedades opcionais...
}
