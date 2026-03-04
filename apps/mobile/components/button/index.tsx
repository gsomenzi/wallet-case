import { StyleSheet, Text, TouchableOpacity } from "react-native";

type ButtonProps = {
    children: React.ReactNode;
    isLoading?: boolean;
    onPress?: () => void;
    colorScheme?: "primary" | "secondary";
};

export function Button({ children, colorScheme = "primary", isLoading, onPress }: ButtonProps) {
    function handlePress() {
        if (isLoading) return;
        onPress?.();
    }

    function getColorSchemeStyles() {
        switch (colorScheme) {
            case "primary":
                return styles.primary;
            case "secondary":
                return styles.secondary;
            default:
                return {};
        }
    }

    return (
        <TouchableOpacity style={[styles.container, getColorSchemeStyles()]} onPress={handlePress}>
            {typeof children === "string" ? <Text style={styles.text}>{children}</Text> : children}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 12,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        alignItems: "center",
    },
    primary: {
        backgroundColor: "#007bff",
        borderColor: "#007bff",
    },
    secondary: {
        backgroundColor: "#6c757d",
        borderColor: "#6c757d",
    },
    text: {
        color: "#fff",
        fontWeight: "bold",
    },
});
