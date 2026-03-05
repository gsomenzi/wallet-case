import { ThemedView, ThemedViewProps } from "../themed-view";
import { CurrencyInput } from "./components/currency-input";
import { Feedback } from "./components/feedback";
import { MaskedInput } from "./components/masked-input";
import { TextInput } from "./components/text-input";
import { TextFieldContext } from "./context";

type TextFieldProps = {
    error?: string | null;
} & ThemedViewProps;

function TextField({ children, error = null, style, ...props }: TextFieldProps) {
    return (
        <TextFieldContext.Provider value={{ error }}>
            <ThemedView style={style} {...props}>
                {children}
            </ThemedView>
        </TextFieldContext.Provider>
    );
}

TextField.TextInput = TextInput;
TextField.MaskedInput = MaskedInput;
TextField.CurrencyInput = CurrencyInput;
TextField.Feedback = Feedback;

export { TextField };
