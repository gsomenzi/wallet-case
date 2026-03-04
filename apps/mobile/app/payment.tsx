import { Keyboard, Pressable, StyleSheet } from "react-native";
import { Button } from "@/components/button";
import { TextField } from "@/components/text-input";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

export default function PaymentView() {
    return (
        <ThemedView style={styles.view}>
            <Pressable style={styles.view} onPress={Keyboard.dismiss}>
                <ThemedView style={styles.mainContent}>
                    <ThemedText textAlign="center" type="subtitle">
                        Pagamento
                    </ThemedText>
                    <ThemedView style={styles.form}>
                        <TextField placeholder="Número do cartão" />
                        <ThemedView style={styles.row}>
                            <TextField placeholder="Data de validade" style={styles.fullWidth} />
                            <TextField placeholder="CVV" style={styles.fullWidth} />
                        </ThemedView>
                        <TextField placeholder="Nome do titular" />
                        <TextField placeholder="Valor" />
                    </ThemedView>
                    <Button>Pagar</Button>
                </ThemedView>
            </Pressable>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    view: {
        flex: 1,
    },
    mainContent: {
        flex: 1,
        padding: 24,
        justifyContent: "center",
        gap: 24,
    },
    form: {
        gap: 8,
    },
    row: {
        flexDirection: "row",
        gap: 8,
    },
    fullWidth: {
        flex: 1,
    },
});
