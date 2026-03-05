import { TextInput as RNTextInput, TextInputProps as RNTextInputProps, StyleSheet } from "react-native";
import { useThemeColor } from "@/hooks/use-theme-color";

type TextInputProps = RNTextInputProps & {
    lightColor?: string;
    darkColor?: string;
};

export function TextInput({ lightColor, darkColor, style, ...props }: TextInputProps) {
    const color = useThemeColor({ light: lightColor, dark: darkColor }, "text");
    return <RNTextInput style={[styles.input, { color }, style]} {...props} />;
}

const styles = StyleSheet.create({
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 12,
    },
});
