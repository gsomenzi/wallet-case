import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import type { PaymentFeedbackViewModelProps } from "./payment-feedback.view-model";

export function PaymentFeedbackView({
    appTheme,
    paymentData,
    responseInfoList,
    styles,
}: PaymentFeedbackViewModelProps) {
    return (
        <ThemedView flex={1}>
            <ThemedView flex={1} padding="lg" justifyContent="center" alignItems="center" gap="lg">
                <ThemedText textAlign="center" variant="subtitle">
                    Pagamento efetuado
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
                                <ThemedText>{item.value}</ThemedText>
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
