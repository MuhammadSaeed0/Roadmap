builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("CanCancelShipped", p => p.RequireRole("Manager"));
});

[Authorize]                                    // must be logged in (else 401)
[ApiController, Route("api/orders")]
public class OrdersController(OrderService orders) : ControllerBase
{
    [HttpGet("{id:int}")]
    public async Task<ActionResult<OrderDto>> Get(int id, CancellationToken ct)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        // Resource check: only your own orders
        var order = await orders.FindForUserAsync(id, userId, ct);
        return order is null ? NotFound() : order;
    }

    [Authorize(Policy = "CanCancelShipped")]   // logged in but not Manager → 403
    [HttpPost("{id:int}/cancel")]
    public Task Cancel(int id, CancellationToken ct) => orders.CancelAsync(id, ct);
}
