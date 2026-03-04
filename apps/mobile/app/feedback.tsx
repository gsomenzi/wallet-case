import { useLocalSearchParams } from "expo-router";
import { useMemo } from "react";
import { StyleSheet } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { PaymentResponse } from "../features/payment/payment.entity";

type ResponseInfoItem = {
    title: string;
    value: string;
};

export default function FeedbackView() {
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
        <ThemedView style={styles.view}>
            <ThemedView style={styles.mainContent}>
                <ThemedText textAlign="center" type="subtitle">
                    Pagamento efetuado
                </ThemedText>
                {paymentData ? (
                    <ThemedView style={styles.responseInfoList}>
                        {responseInfoList.map((item, index) => (
                            <ThemedView
                                key={item.title}
                                style={[
                                    styles.responseInfoItem,
                                    index < responseInfoList.length - 1 && styles.responseInfoItemWithDivider,
                                ]}
                            >
                                <ThemedText type="defaultSemiBold">{item.title}</ThemedText>
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
    view: {
        flex: 1,
    },
    mainContent: {
        flex: 1,
        padding: 24,
        justifyContent: "center",
        gap: 24,
    },
    responseInfoList: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        overflow: "hidden",
    },
    responseInfoItem: {
        padding: 12,
    },
    responseInfoItemWithDivider: {
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: "#ccc",
    },
});
