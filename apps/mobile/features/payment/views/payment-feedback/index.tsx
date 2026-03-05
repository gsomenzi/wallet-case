import { withViewModel } from "@/hooks/with-view-model";
import { PaymentFeedbackView } from "./payment-feedback.view";
import { usePaymentFeedbackViewModel } from "./payment-feedback.view-model";

export default withViewModel(PaymentFeedbackView, usePaymentFeedbackViewModel);
