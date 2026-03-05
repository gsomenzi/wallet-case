import { ThemedText } from "@/components/themed-text";
import { useTextFieldContext } from "../context";

export function Feedback() {
    const { error } = useTextFieldContext();

    return (
        error && (
            <ThemedText mt="xs" color="danger">
                {error}
            </ThemedText>
        )
    );
}
