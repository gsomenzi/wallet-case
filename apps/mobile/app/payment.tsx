import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import Constants from "expo-constants";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Keyboard, Pressable, StyleSheet } from "react-native";
import { z } from "zod";
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

const paymentFormSchema = z.object({
    cardNumber: z.string().trim().min(1, "Campo obrigatório"),
    cardHolder: z.string().trim().min(1, "Campo obrigatório"),
    expirationDate: z.string().trim().min(1, "Campo obrigatório"),
    cvv: z.string().trim().min(1, "Campo obrigatório"),
    amount: z.string().trim().min(1, "Campo obrigatório"),
});

type PaymentFormData = z.infer<typeof paymentFormSchema>;

const defaultValues: PaymentFormData = {
    cardNumber: "",
    cardHolder: "",
    expirationDate: "",
    cvv: "",
    amount: "",
};

export default function PaymentView() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<{ title: string; message: string } | null>(null);

    const {
        control,
        formState: { errors },
        handleSubmit,
        reset,
    } = useForm<PaymentFormData>({
        resolver: zodResolver(paymentFormSchema),
        defaultValues,
    });

    const cleanForm = useCallback(() => {
        reset(defaultValues);
    }, [reset]);

    async function handlePayment(data: PaymentFormData) {
        try {
            setIsLoading(true);
            setError(null);
            const response = await apiClient.post<PaymentResponse>("/payments", {
                cardNumber: data.cardNumber,
                cardHolder: data.cardHolder,
                expirationDate: data.expirationDate,
                cvv: data.cvv,
                amount: data.amount,
            });
            router.push({
                pathname: "/feedback",
                params: {
                    data: JSON.stringify(response.data),
                },
            });
            console.log("Payment response:", response.data);
        } catch (caughtError: unknown) {
            console.error("Payment error:", caughtError);
            const message =
                axios.isAxiosError<{ message?: string }>(caughtError) && caughtError.response?.data?.message
                    ? caughtError.response.data.message
                    : "Por favor, tente novamente mais tarde.";

            setError({
                title: "Falha ao processar o pagamento.",
                message,
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
                    <ThemedText textAlign="center" variant="subtitle">
                        Pagamento
                    </ThemedText>
                    <ThemedView style={styles.form}>
                        <TextField error={errors.cardNumber?.message}>
                            <Controller
                                control={control}
                                name="cardNumber"
                                render={({ field: { onChange, value } }) => (
                                    <TextField.MaskedInput
                                        mask="9999 9999 9999 9999"
                                        placeholder="Número do cartão"
                                        value={value}
                                        keyboardType="numeric"
                                        onChangeText={onChange}
                                        autoFocus
                                    />
                                )}
                            />
                            <TextField.Feedback />
                        </TextField>
                        <ThemedView style={styles.row}>
                            <TextField style={styles.fullWidth} error={errors.expirationDate?.message}>
                                <Controller
                                    control={control}
                                    name="expirationDate"
                                    render={({ field: { onChange, value } }) => (
                                        <TextField.MaskedInput
                                            mask="99/99"
                                            placeholder="Data de validade"
                                            keyboardType="numeric"
                                            value={value}
                                            onChangeText={onChange}
                                        />
                                    )}
                                />
                                <TextField.Feedback />
                            </TextField>
                            <TextField style={styles.fullWidth} error={errors.cvv?.message}>
                                <Controller
                                    control={control}
                                    name="cvv"
                                    render={({ field: { onChange, value } }) => (
                                        <TextField.MaskedInput
                                            mask="999"
                                            placeholder="CVV"
                                            keyboardType="numeric"
                                            value={value}
                                            onChangeText={onChange}
                                        />
                                    )}
                                />
                                <TextField.Feedback />
                            </TextField>
                        </ThemedView>
                        <TextField error={errors.cardHolder?.message}>
                            <Controller
                                control={control}
                                name="cardHolder"
                                render={({ field: { onChange, value } }) => (
                                    <TextField.TextInput
                                        placeholder="Nome do titular"
                                        value={value}
                                        onChangeText={onChange}
                                    />
                                )}
                            />
                            <TextField.Feedback />
                        </TextField>
                        <TextField error={errors.amount?.message}>
                            <Controller
                                control={control}
                                name="amount"
                                render={({ field: { onChange, value } }) => (
                                    <TextField.CurrencyInput
                                        placeholder="Valor"
                                        value={value}
                                        onChangeText={(_, rawText) =>
                                            onChange(rawText && rawText !== "NaN" ? rawText : "")
                                        }
                                    />
                                )}
                            />
                            <TextField.Feedback />
                        </TextField>
                    </ThemedView>
                    <Button isLoading={isLoading} onPress={handleSubmit(handlePayment)}>
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
