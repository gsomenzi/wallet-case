import { createContext, useContext } from "react";

export const TextFieldContext = createContext({
    error: null as string | null,
});

export function useTextFieldContext() {
    return useContext(TextFieldContext);
}
