// A use case: one business rule, pure Kotlin, reused by cart, checkout and summary screens.
class CalculateTotalUseCase @Inject constructor(private val fees: DeliveryFeePolicy) {
    operator fun invoke(items: List<CartItem>, coupon: Coupon?): Total {
        val subtotal = items.sumOf { it.unitPriceCents * it.quantity }
        val discount = coupon?.discountFor(subtotal) ?: 0
        val delivery = fees.feeFor(subtotal - discount)
        return Total(subtotal, discount, delivery, subtotal - discount + delivery)
    }
}

// Open for extension: a new policy is a new class, not an edit to the use case.
fun interface DeliveryFeePolicy { fun feeFor(amountCents: Int): Int }

class FreeOverPolicy(private val thresholdCents: Int, private val feeCents: Int) : DeliveryFeePolicy {
    override fun feeFor(amountCents: Int) = if (amountCents >= thresholdCents) 0 else feeCents
}

// Over-engineering to avoid: a use case that only forwards a call adds files, not value.
// class GetProfileUseCase(private val repo: ProfileRepository) { operator fun invoke() = repo.observeProfile() }
