import { StyleSheet } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { useTextFieldContext } from "../context";

export function Feedback() {
    const { error } = useTextFieldContext();
    return error && <ThemedText style={styles.message}>{error}</ThemedText>;
}

const styles = StyleSheet.create({
    message: {
        marginTop: 4,
        color: "#721c24",
    },
});
