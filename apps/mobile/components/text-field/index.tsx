import { ViewProps } from "react-native";
import { ThemedView } from "../themed-view";
import { CurrencyInput } from "./components/currency-input";
import { Feedback } from "./components/feedback";
import { MaskedInput } from "./components/masked-input";
import { TextInput } from "./components/text-input";
import { TextFieldContext } from "./context";

type TextFieldProps = {
    error?: string | null;
} & ViewProps;

function TextField({ children, error = null, style }: TextFieldProps) {
    return (
        <TextFieldContext.Provider value={{ error }}>
            <ThemedView style={style}>{children}</ThemedView>
        </TextFieldContext.Provider>
    );
}

TextField.TextInput = TextInput;
TextField.MaskedInput = MaskedInput;
TextField.CurrencyInput = CurrencyInput;
TextField.Feedback = Feedback;

export { TextField };
