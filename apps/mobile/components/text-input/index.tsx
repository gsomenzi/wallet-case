import { StyleSheet, TextInput, TextInputProps, ViewProps } from "react-native";
import { ThemedView } from "../themed-view";

type TextFieldProps = Omit<TextInputProps, "style"> & {
    style?: ViewProps["style"];
};

export function TextField({ style, ...props }: TextFieldProps) {
    return (
        <ThemedView style={[styles.container, style]}>
            <TextInput style={styles.input} {...props} />
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
    },
    input: {
        paddingHorizontal: 8,
        paddingVertical: 12,
    },
});
