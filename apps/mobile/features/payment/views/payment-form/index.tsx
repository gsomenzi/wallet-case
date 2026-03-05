import { withViewModel } from "@/hooks/with-view-model";
import { PaymentFormView } from "./payment-form.view";
import { usePaymentFormViewModel } from "./payment-form.view-model";

export default withViewModel(PaymentFormView, usePaymentFormViewModel);
