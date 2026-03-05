import { withViewModel } from "@/hooks/with-view-model";
import { PaymentView } from "./payment.view";
import { usePaymentViewModel } from "./payment.view-model";

export default withViewModel(PaymentView, usePaymentViewModel);
