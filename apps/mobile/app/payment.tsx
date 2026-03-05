import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Keyboard, Pressable } from "react-native";
import { z } from "zod";
import { Button } from "@/components/button";
import { ErrorMessage } from "@/components/error-message";
import { TextField } from "@/components/text-field";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { PaymentService } from "@/features/payment/payment.service";

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
    const paymentService = new PaymentService();

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

            const response = await paymentService.processPayment({
                cardNumber: data.cardNumber,
                cardHolder: data.cardHolder,
                expirationDate: data.expirationDate,
                cvv: data.cvv,
                amount: data.amount,
            });
            router.push({
                pathname: "/feedback",
                params: {
                    data: JSON.stringify(response),
                },
            });
        } catch (caughtError: unknown) {
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
        <ThemedView flex={1}>
            <Pressable style={{ flex: 1 }} onPress={Keyboard.dismiss}>
                <ThemedView flex={1} padding="xl" gap="xl" justifyContent="center">
                    <ThemedText textAlign="center" variant="subtitle">
                        Pagamento
                    </ThemedText>
                    <ThemedView gap="md">
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
                        <ThemedView flexDirection="row" gap="md">
                            <TextField flexGrow={1} error={errors.expirationDate?.message}>
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
                            <TextField flexGrow={1} error={errors.cvv?.message}>
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
                    {error && <ErrorMessage title={error.title} message={error.message} />}
                </ThemedView>
            </Pressable>
        </ThemedView>
    );
}
