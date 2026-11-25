// A chain: the model extracts, code decides, the model writes. Each step can be tested.
public record RefundFacts(string OrderNumber, string Problem, string Request);

public async Task<string> HandleAsync(string email, CancellationToken ct)
{
    var facts = (await chat.GetResponseAsync<RefundFacts>(
        [new(ChatRole.System, "Extract the order number, the problem and what the customer asks for."), new(ChatRole.User, email)],
        cancellationToken: ct)).Result;

    var order = await db.Orders.SingleOrDefaultAsync(o => o.Number == facts.OrderNumber, ct);
    var decision = refundPolicy.Decide(order, facts);          // business rules stay in C#

    var reply = await chat.GetResponseAsync(
        [new(ChatRole.System, "Write a short, polite reply that explains this decision."), new(ChatRole.User, decision.ToString())],
        cancellationToken: ct);
    return reply.Text;
}
