import { useTheme } from "@shopify/restyle";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { StyleSheet } from "react-native";
import type { Theme } from "@/constants/theme";
import { type PaymentResponse, PaymentStatus } from "@/features/payment/payment.entity";
import { PaymentService } from "@/features/payment/payment.service";

export type ResponseInfoItem = {
    title: string;
    value: string;
};

type StatusColorToken = keyof Theme["colors"];

const FINAL_PAYMENT_STATUSES = new Set<PaymentStatus>([
    PaymentStatus.Approved,
    PaymentStatus.Declined,
    PaymentStatus.Error,
]);

export function usePaymentFeedbackViewModel() {
    const appTheme = useTheme<Theme>();
    const { data } = useLocalSearchParams<{ data?: string | string[] }>();
    const paymentService = useMemo(() => new PaymentService(), []);

    const initialPaymentData = useMemo(() => {
        if (typeof data !== "string") {
            return null;
        }

        try {
            return JSON.parse(data) as PaymentResponse;
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
                setPaymentData(updatedPayment);
            }
        );
    }, [paymentData?.transactionId, paymentService]);

    const paymentStatusText = useMemo(() => {
        if (!paymentData) {
            return "Sem dados de pagamento";
        }

        switch (paymentData.status) {
            case PaymentStatus.Pending:
                return "Pendente";
            case PaymentStatus.ValidatingAccount:
                return "Validando conta";
            case PaymentStatus.ValidatingCard:
                return "Validando cartão";
            case PaymentStatus.ValidatingAntifraud:
                return "Analisando antifraude";
            case PaymentStatus.ProcessingAcquirer:
                return "Processando adquirente";
            case PaymentStatus.ProcessingPayment:
                return "Processando pagamento";
            case PaymentStatus.SendingNotification:
                return "Enviando notificação";
            case PaymentStatus.Approved:
                return "Aprovado";
            case PaymentStatus.Declined:
                return "Recusado";
            case PaymentStatus.Error:
                return "Erro";
            default:
                return paymentData.status;
        }
    }, [paymentData]);

    const paymentStatusColorToken = useMemo<StatusColorToken>(() => {
        if (!paymentData) {
            return "secondary";
        }

        switch (paymentData.status) {
            case PaymentStatus.Approved:
                return "success";
            case PaymentStatus.Declined:
            case PaymentStatus.Error:
                return "danger";
            default:
                return "primary";
        }
    }, [paymentData]);

    const responseInfoList = useMemo<ResponseInfoItem[]>(() => {
        if (!paymentData) {
            return [];
        }

        const isFinalStatus = FINAL_PAYMENT_STATUSES.has(paymentData.status);

        return [
            { title: "Status", value: paymentStatusText },
            { title: "Transação", value: paymentData.transactionId },
            { title: "Tempo total", value: isFinalStatus ? `${paymentData.totalTimeMs}ms` : "Em andamento" },
        ];
    }, [paymentData, paymentStatusText]);

    const isPaymentInProgress = useMemo(() => {
        if (!paymentData) {
            return false;
        }

        return !FINAL_PAYMENT_STATUSES.has(paymentData.status);
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
