import { StyleSheet, ViewProps } from "react-native";
import { ThemedView } from "../themed-view";
import { CurrencyInput } from "./components/currency-input";
import { MaskedInput } from "./components/masked-input";
import { TextInput } from "./components/text-input";

type TextFieldProps = {
    children: React.ReactNode;
} & ViewProps;

function TextField({ children, style }: TextFieldProps) {
    return <ThemedView style={[styles.container, style]}>{children}</ThemedView>;
}

TextField.TextInput = TextInput;
TextField.MaskedInput = MaskedInput;
TextField.CurrencyInput = CurrencyInput;

export { TextField };

const styles = StyleSheet.create({
    container: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
    },
});
