import { StyleSheet, TextInput, TextInputProps, ViewProps } from "react-native";
import { useThemeColor } from "@/hooks/use-theme-color";
import { ThemedView } from "../themed-view";

type TextFieldProps = Omit<TextInputProps, "style"> & {
    lightColor?: string;
    darkColor?: string;
    style?: ViewProps["style"];
};

export function TextField({ lightColor, darkColor, style, ...props }: TextFieldProps) {
    const color = useThemeColor({ light: lightColor, dark: darkColor }, "text");
    return (
        <ThemedView style={[styles.container, style]}>
            <TextInput style={[styles.input, { color }]} {...props} />
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
