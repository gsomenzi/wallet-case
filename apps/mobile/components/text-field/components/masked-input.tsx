import { StyleSheet } from "react-native";
import { MaskedTextInput, MaskedTextInputProps } from "react-native-mask-text";
import { useThemeColor } from "@/hooks/use-theme-color";

type InputProps = MaskedTextInputProps & {
    lightColor?: string;
    darkColor?: string;
};

export function MaskedInput({ lightColor, darkColor, style, value, onChangeText, ...props }: InputProps) {
    const color = useThemeColor({ light: lightColor, dark: darkColor }, "text");
    const normalizedValue = typeof value === "string" && value.trim().length === 0 ? undefined : value;

    function handleChangeText(text: string, rawText: string) {
        const normalizedRawText = rawText === "NaN" ? "" : rawText;
        onChangeText?.(text, normalizedRawText);
    }

    return (
        <MaskedTextInput
            style={[styles.input, { color }, style]}
            value={normalizedValue}
            onChangeText={handleChangeText}
            {...props}
        />
    );
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
