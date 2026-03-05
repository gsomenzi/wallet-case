import { useTheme } from "@shopify/restyle";
import { useLocalSearchParams } from "expo-router";
import { useMemo } from "react";
import { StyleSheet } from "react-native";
import type { Theme } from "@/constants/theme";
import type { PaymentResponse } from "@/features/payment/payment.entity";

export type ResponseInfoItem = {
    title: string;
    value: string;
};

export function usePaymentFeedbackViewModel() {
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

    const styles = useMemo(
        () =>
            StyleSheet.create({
                responseInfoItemWithDivider: {
                    borderBottomWidth: StyleSheet.hairlineWidth,
                    borderBottomColor: "#ccc",
                },
            }),
        []
    );

    return {
        appTheme,
        paymentData,
        responseInfoList,
        styles,
    };
}

export type PaymentFeedbackViewModelProps = ReturnType<typeof usePaymentFeedbackViewModel>;
