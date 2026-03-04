import axios from "axios";
import Constants from "expo-constants";
import { useState } from "react";
import { Keyboard, Pressable, StyleSheet } from "react-native";
import { Button } from "@/components/button";
import { TextField } from "@/components/text-input";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

const apiUrl = Constants.expoConfig?.extra?.apiUrl;

const apiClient = axios.create({
    baseURL: typeof apiUrl === "string" ? apiUrl : undefined,
    timeout: 6000,
});

export default function PaymentView() {
    const [isLoading, setIsLoading] = useState(false);
    const [cardNumber, setCardNumber] = useState("");
    const [cardHolder, setCardHolder] = useState("");
    const [expirationDate, setExpirationDate] = useState("");
    const [cvv, setCvv] = useState("");
    const [amount, setAmount] = useState("");
    async function handlePayment() {
        try {
            setIsLoading(true);
            const response = await apiClient.post("/payments", {
                cardNumber,
                cardHolder,
                expirationDate,
                cvv,
                amount,
            });
            console.log("Payment response:", response.data);
        } catch (error) {
            console.error("Payment error:", error);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <ThemedView style={styles.view}>
            <Pressable style={styles.view} onPress={Keyboard.dismiss}>
                <ThemedView style={styles.mainContent}>
                    <ThemedText textAlign="center" type="subtitle">
                        Pagamento
                    </ThemedText>
                    <ThemedView style={styles.form}>
                        <TextField
                            placeholder="Número do cartão"
                            value={cardNumber}
                            onChangeText={setCardNumber}
                            autoFocus
                        />
                        <ThemedView style={styles.row}>
                            <TextField
                                placeholder="Data de validade"
                                value={expirationDate}
                                onChangeText={setExpirationDate}
                                style={styles.fullWidth}
                            />
                            <TextField placeholder="CVV" value={cvv} onChangeText={setCvv} style={styles.fullWidth} />
                        </ThemedView>
                        <TextField placeholder="Nome do titular" value={cardHolder} onChangeText={setCardHolder} />
                        <TextField placeholder="Valor" value={amount} onChangeText={setAmount} />
                    </ThemedView>
                    <Button isLoading={isLoading} onPress={handlePayment}>
                        Pagar
                    </Button>
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
