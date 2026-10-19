public record PlaceOrderLine([Range(1, int.MaxValue)] int ProductId, [Range(1, 1000)] int Quantity);
public record PlaceOrderRequest([Range(1, int.MaxValue)] int CustomerId,
                                [Required, MinLength(1)] List<PlaceOrderLine>? Lines);

[HttpPost("api/orders")]
public async Task<ActionResult<OrderDto>> Create(PlaceOrderRequest request, CancellationToken ct)
{
    var order = await orders.PlaceAsync(request, ct);   // loads products in ONE query, validates,
                                                        // prices from the DB, reduces stock atomically
    return CreatedAtAction(nameof(Get), new { id = order.Id }, order);
}
