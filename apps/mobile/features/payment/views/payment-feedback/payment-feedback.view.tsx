import { ActivityIndicator } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import type { PaymentFeedbackViewModelProps } from "./payment-feedback.view-model";

export function PaymentFeedbackView({
    appTheme,
    isPaymentInProgress,
    paymentData,
    paymentStatusColorToken,
    responseInfoList,
    styles,
}: PaymentFeedbackViewModelProps) {
    return (
        <ThemedView flex={1}>
            <ThemedView flex={1} padding="lg" justifyContent="center" alignItems="center" gap="lg">
                <ThemedText textAlign="center" variant="subtitle">
                    Pagamento enviado
                </ThemedText>
                {paymentData ? (
                    <ThemedView borderWidth={1} borderColor="border" borderRadius={appTheme.radii.md} overflow="hidden">
                        {responseInfoList.map((item, index) => (
                            <ThemedView
                                key={item.title}
                                padding="lg"
                                style={
                                    index < responseInfoList.length - 1 ? styles.responseInfoItemWithDivider : undefined
                                }
                            >
                                <ThemedText variant="defaultSemiBold">{item.title}</ThemedText>
                                {item.title === "Status" ? (
                                    <ThemedView flexDirection="row" alignItems="center" gap="sm">
                                        <ThemedText color={paymentStatusColorToken}>{item.value}</ThemedText>
                                        {isPaymentInProgress ? (
                                            <ActivityIndicator
                                                size="small"
                                                color={appTheme.colors[paymentStatusColorToken]}
                                            />
                                        ) : null}
                                    </ThemedView>
                                ) : (
                                    <ThemedText>{item.value}</ThemedText>
                                )}
                            </ThemedView>
                        ))}
                    </ThemedView>
                ) : (
                    <ThemedText>Sem dados de pagamento.</ThemedText>
                )}
            </ThemedView>
        </ThemedView>
    );
}
