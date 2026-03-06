import { useTheme } from "@shopify/restyle";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { StyleSheet } from "react-native";
import type { Theme } from "@/constants/theme";
import { PaymentResponse } from "@/features/payment/payment.entity";
import { PaymentService } from "@/features/payment/payment.service";
import {
    getPaymentFailureMessage,
    getPaymentStatusColorToken,
    getPaymentStatusLabel,
    getPaymentTotalTimeLabel,
} from "./payment-feedback.presenter";

export type ResponseInfoItem = {
    title: string;
    value: string;
};

type StatusColorToken = keyof Theme["colors"];

export function usePaymentFeedbackViewModel() {
    const appTheme = useTheme<Theme>();
    const { data } = useLocalSearchParams<{ data?: string | string[] }>();
    const paymentService = useMemo(() => new PaymentService(), []);

    const initialPaymentData = useMemo(() => {
        if (typeof data !== "string") {
            return null;
        }

        try {
            const parsedData = JSON.parse(data);
            return PaymentResponse.deserialize(parsedData);
        } catch {
            return null;
        }
    }, [data]);

    const [paymentData, setPaymentData] = useState<PaymentResponse | null>(initialPaymentData);

    useEffect(() => {
        setPaymentData(initialPaymentData);
    }, [initialPaymentData]);

    useEffect(() => {
        if (!paymentData?.transactionId) {
            return;
        }

        return paymentService.subscribePaymentUpdates(
            { transactionId: paymentData.transactionId },
            (updatedPayment) => {
                setPaymentData(PaymentResponse.deserialize(updatedPayment));
            }
        );
    }, [paymentData?.transactionId, paymentService]);

    const paymentStatusText = useMemo(() => {
        if (!paymentData) {
            return "Sem dados de pagamento";
        }

        return getPaymentStatusLabel(paymentData);
    }, [paymentData]);

    const paymentStatusColorToken = useMemo<StatusColorToken>(() => {
        if (!paymentData) {
            return "secondary";
        }

        return getPaymentStatusColorToken(paymentData);
    }, [paymentData]);

    const responseInfoList = useMemo<ResponseInfoItem[]>(() => {
        if (!paymentData) {
            return [];
        }

        const paymentFailureMessage = getPaymentFailureMessage(paymentData);

        const items: ResponseInfoItem[] = [
            { title: "Status", value: paymentStatusText },
            { title: "Transação", value: paymentData.transactionId },
            { title: "Tempo total", value: getPaymentTotalTimeLabel(paymentData) },
        ];

        if (paymentFailureMessage) {
            items.push({ title: "Erro", value: paymentFailureMessage });
        }

        return items;
    }, [paymentData, paymentStatusText]);

    const isPaymentInProgress = useMemo(() => {
        if (!paymentData) {
            return false;
        }

        return paymentData.isInProgress();
    }, [paymentData]);

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
        isPaymentInProgress,
        paymentData,
        paymentStatusColorToken,
        responseInfoList,
        styles,
    };
}

export type PaymentFeedbackViewModelProps = ReturnType<typeof usePaymentFeedbackViewModel>;
