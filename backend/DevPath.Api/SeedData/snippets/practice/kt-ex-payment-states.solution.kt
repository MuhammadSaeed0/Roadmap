enum class PaymentMethod(val feePercent: Double) { CARD(1.5), WALLET(1.0), CASH_ON_DELIVERY(0.0) }

sealed interface CheckoutState {
    data object Idle : CheckoutState
    data class Processing(val method: PaymentMethod) : CheckoutState
    data class Paid(val receiptId: String, val total: Double) : CheckoutState
    data class Failed(val reason: String, val canRetry: Boolean, val method: PaymentMethod) : CheckoutState
}

fun message(state: CheckoutState): String = when (state) {
    CheckoutState.Idle -> "Choose a payment method"
    is CheckoutState.Processing -> "Paying by ${state.method.name.lowercase()}..."
    is CheckoutState.Paid -> "Paid ${state.total} EGP. Receipt ${state.receiptId}"
    is CheckoutState.Failed -> if (state.canRetry) "${state.reason}. Try again" else state.reason
}

fun retry(state: CheckoutState): CheckoutState =
    if (state is CheckoutState.Failed && state.canRetry) CheckoutState.Processing(state.method) else state
