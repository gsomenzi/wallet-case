import axios from "axios";
import Constants from "expo-constants";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Keyboard, Pressable, StyleSheet } from "react-native";
import { Button } from "@/components/button";
import { TextField } from "@/components/text-field";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { PaymentResponse } from "../features/payment/payment.entity";

const apiUrl = Constants.expoConfig?.extra?.apiUrl;

const apiClient = axios.create({
    baseURL: typeof apiUrl === "string" ? apiUrl : undefined,
    timeout: 6000,
});

export default function PaymentView() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<{ title: string; message: string } | null>(null);
    const [cardNumber, setCardNumber] = useState("");
    const [cardHolder, setCardHolder] = useState("");
    const [expirationDate, setExpirationDate] = useState("");
    const [cvv, setCvv] = useState("");
    const [amount, setAmount] = useState("");

    const cleanForm = useCallback(() => {
        setCardNumber("");
        setCardHolder("");
        setExpirationDate("");
        setCvv("");
        setAmount("");
    }, []);

    const handleAmountChange = useCallback((_: string, rawText?: string) => {
        if (!rawText || rawText === "NaN") {
            setAmount("");
            return;
        }
        setAmount(rawText);
    }, []);

    async function handlePayment() {
        try {
            setIsLoading(true);
            setError(null);
            const response = await apiClient.post<PaymentResponse>("/payments", {
                cardNumber,
                cardHolder,
                expirationDate,
                cvv,
                amount,
            });
            router.push({
                pathname: "/feedback",
                params: {
                    data: JSON.stringify(response.data),
                },
            });
            console.log("Payment response:", response.data);
        } catch (error: unknown) {
            console.error("Payment error:", error);
            setError({
                title: "Falha ao processar o pagamento.",
                message: (error as any)?.response?.data?.message || "Por favor, tente novamente mais tarde.",
            });
        } finally {
            setIsLoading(false);
        }
    }

    useFocusEffect(cleanForm);

    return (
        <ThemedView style={styles.view}>
            <Pressable style={styles.view} onPress={Keyboard.dismiss}>
                <ThemedView style={styles.mainContent}>
                    <ThemedText textAlign="center" type="subtitle">
                        Pagamento
                    </ThemedText>
                    <ThemedView style={styles.form}>
                        <TextField>
                            <TextField.MaskedInput
                                mask="9999 9999 9999 9999"
                                placeholder="Número do cartão"
                                value={cardNumber}
                                keyboardType="numeric"
                                onChangeText={setCardNumber}
                                autoFocus
                            />
                        </TextField>
                        <ThemedView style={styles.row}>
                            <TextField style={styles.fullWidth}>
                                <TextField.MaskedInput
                                    mask="99/99"
                                    placeholder="Data de validade"
                                    keyboardType="numeric"
                                    value={expirationDate}
                                    onChangeText={setExpirationDate}
                                />
                            </TextField>
                            <TextField style={styles.fullWidth}>
                                <TextField.MaskedInput
                                    mask="999"
                                    placeholder="CVV"
                                    keyboardType="numeric"
                                    value={cvv}
                                    onChangeText={setCvv}
                                />
                            </TextField>
                        </ThemedView>
                        <TextField>
                            <TextField.TextInput
                                placeholder="Nome do titular"
                                value={cardHolder}
                                onChangeText={setCardHolder}
                            />
                        </TextField>
                        <TextField>
                            <TextField.CurrencyInput
                                placeholder="Valor"
                                value={amount}
                                onChangeText={handleAmountChange}
                            />
                        </TextField>
                    </ThemedView>
                    <Button isLoading={isLoading} onPress={handlePayment}>
                        Pagar
                    </Button>
                    {error && (
                        <ThemedView style={styles.errorMessageContainer}>
                            <ThemedText style={styles.errorMessageTitle}>{error?.title}</ThemedText>
                            <ThemedText style={styles.errorMessageDescription}>{error?.message}</ThemedText>
                        </ThemedView>
                    )}
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
    errorMessageContainer: {
        padding: 12,
        backgroundColor: "#f8d7da",
        borderRadius: 8,
    },
    errorMessageTitle: {
        fontWeight: "bold",
        color: "#721c24",
    },
    errorMessageDescription: {
        color: "#721c24",
    },
});
