import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
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

export function usePaymentViewModel() {
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

    return {
        control,
        errors,
        error,
        isLoading,
        onSubmitPayment: handleSubmit(handlePayment),
    };
}

export type PaymentViewModelProps = ReturnType<typeof usePaymentViewModel>;
