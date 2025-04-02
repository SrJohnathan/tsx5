import {TSX5Node} from "./TSX5Node";

export interface Context<T> {
    Provider: (props: ProviderProps<T>) => TSX5Node;
    useContext: () => T;
    displayName?: string;
}
export interface ProviderProps<T> {
    value: T;
    children?: TSX5Node | TSX5Node[];
}

export interface Box<T> {
    children?: TSX5Node | TSX5Node[];
}