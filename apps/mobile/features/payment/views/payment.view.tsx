import { Controller } from "react-hook-form";
import { Keyboard, Pressable } from "react-native";
import { Button } from "@/components/button";
import { ErrorMessage } from "@/components/error-message";
import { TextField } from "@/components/text-field";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import type { PaymentViewModelProps } from "./payment.view-model";

export function PaymentView({ control, errors, error, isLoading, onSubmitPayment }: PaymentViewModelProps) {
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
                    <Button isLoading={isLoading} onPress={onSubmitPayment}>
                        Pagar
                    </Button>
                    {error && <ErrorMessage title={error.title} message={error.message} />}
                </ThemedView>
            </Pressable>
        </ThemedView>
    );
}
