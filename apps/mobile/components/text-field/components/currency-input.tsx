import { StyleSheet } from "react-native";
import { MaskedTextInput, MaskedTextInputProps } from "react-native-mask-text";
import { useThemeColor } from "@/hooks/use-theme-color";

type InputProps = Omit<MaskedTextInputProps, "mask"> & {
    lightColor?: string;
    darkColor?: string;
};

export function CurrencyInput({ lightColor, darkColor, style, onChangeText, value, ...props }: InputProps) {
    const color = useThemeColor({ light: lightColor, dark: darkColor }, "text");
    const normalizedValue = typeof value === "string" && value.trim().length === 0 ? undefined : value;

    function handleChangeText(text: string, rawText: string) {
        const normalizedRawText = rawText === "NaN" ? "" : rawText;
        onChangeText?.(text, normalizedRawText);
    }

    return (
        <MaskedTextInput
            type="currency"
            options={{
                prefix: "R$ ",
                decimalSeparator: ",",
                groupSeparator: ".",
                precision: 2,
            }}
            keyboardType="numeric"
            value={normalizedValue}
            style={[styles.input, { color }, style]}
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
