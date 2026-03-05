import { useTheme } from "@shopify/restyle";
import { useLocalSearchParams } from "expo-router";
import { useMemo } from "react";
import { StyleSheet } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Theme } from "@/constants/theme";
import { PaymentResponse } from "../features/payment/payment.entity";

type ResponseInfoItem = {
    title: string;
    value: string;
};

export default function FeedbackView() {
    const appTheme = useTheme<Theme>();
    const { data } = useLocalSearchParams<{ data?: string | string[] }>();

    const paymentData = useMemo(() => {
        if (typeof data !== "string") {
            return null;
        }
        try {
            return JSON.parse(data) as PaymentResponse;
        } catch {
            return null;
        }
    }, [data]);

    const paymentStatusText = useMemo(() => {
        if (!paymentData) {
            return "Sem dados de pagamento";
        }
        switch (paymentData.status) {
            case "approved":
                return "Aprovado";
            case "declined":
                return "Recusado";
            case "error":
                return "Erro";
            default:
                return paymentData.status;
        }
    }, [paymentData]);

    const responseInfoList = useMemo<ResponseInfoItem[]>(() => {
        if (!paymentData) {
            return [];
        }

        return [
            { title: "Status", value: paymentStatusText },
            { title: "Transação", value: paymentData.transactionId },
            { title: "Tempo total", value: `${paymentData.totalTimeMs}ms` },
        ];
    }, [paymentData, paymentStatusText]);

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

const styles = StyleSheet.create({
    responseInfoItemWithDivider: {
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: "#ccc",
    },
});
