import { StyleSheet } from "react-native";
import { MaskedTextInput, MaskedTextInputProps } from "react-native-mask-text";
import { useThemeColor } from "@/hooks/use-theme-color";

type InputProps = MaskedTextInputProps & {
    lightColor?: string;
    darkColor?: string;
};

export function MaskedInput({ lightColor, darkColor, style, ...props }: InputProps) {
    const color = useThemeColor({ light: lightColor, dark: darkColor }, "text");
    return <MaskedTextInput style={[styles.input, { color }, style]} {...props} />;
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
