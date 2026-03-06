import { useTheme } from "@shopify/restyle";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import type { Theme } from "@/constants/theme";
import { PaymentResponse } from "@/features/payment/payment.entity";
import { PaymentService } from "@/features/payment/payment.service";
import type { ConnectionStatusBannerStatus } from "./components/connection-status-banner";
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
type ConnectionStatus = "connected" | "disconnected";

export function usePaymentFeedbackViewModel() {
    const appTheme = useTheme<Theme>();
    const { data } = useLocalSearchParams<{ data?: string | string[] }>();
    const paymentService = useMemo(() => new PaymentService(), []);
    const initialPaymentData = useMemo(() => PaymentResponse.deserialize(data), [data]);
    const [paymentData, setPaymentData] = useState<PaymentResponse | null>(initialPaymentData);
    const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus | null>(null);
    const [isConnectionBannerVisible, setIsConnectionBannerVisible] = useState(false);

    useEffect(() => {
        setPaymentData(initialPaymentData);

        if (!initialPaymentData?.transactionId) return;

        return paymentService.subscribePaymentUpdates(
            { transactionId: initialPaymentData.transactionId },
            (updatedPayment) => setPaymentData(PaymentResponse.deserialize(updatedPayment)),
            (isConnected) => setConnectionStatus(isConnected ? "connected" : "disconnected")
        );
    }, [initialPaymentData, paymentService]);

    useEffect(() => {
        if (!connectionStatus) {
            return;
        }

        setIsConnectionBannerVisible(true);

        const timeoutId = setTimeout(() => {
            setIsConnectionBannerVisible(false);
        }, 3000);

        return () => clearTimeout(timeoutId);
    }, [connectionStatus]);

    const paymentStatusText = useMemo(() => {
        if (!paymentData) return "Sem dados de pagamento";
        return getPaymentStatusLabel(paymentData);
    }, [paymentData]);

    const paymentStatusColorToken = useMemo<StatusColorToken>(() => {
        if (!paymentData) return "secondary";
        return getPaymentStatusColorToken(paymentData);
    }, [paymentData]);

    const responseInfoList = useMemo<ResponseInfoItem[]>(() => {
        if (!paymentData) return [];
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
        if (!paymentData) return false;
        return paymentData.isInProgress();
    }, [paymentData]);

    const connectionBannerStatus = useMemo<ConnectionStatusBannerStatus | null>(() => {
        if (!connectionStatus || !isConnectionBannerVisible) return null;
        return connectionStatus === "connected" ? "success" : "error";
    }, [connectionStatus, isConnectionBannerVisible]);

    return {
        appTheme,
        connectionBannerStatus,
        isPaymentInProgress,
        paymentData,
        paymentStatusColorToken,
        responseInfoList,
    };
}

export type PaymentFeedbackViewModelProps = ReturnType<typeof usePaymentFeedbackViewModel>;
