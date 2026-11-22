public async Task HandleAsync(PaymentReceived message, CancellationToken ct)
{
    await using var tx = await db.Database.BeginTransactionAsync(ct);
    // InboxMessages.MessageId has a unique index: a redelivered message is seen as already handled.
    if (await db.InboxMessages.AnyAsync(m => m.MessageId == message.Id, ct)) return;

    var order = await db.Orders.SingleAsync(o => o.Id == message.OrderId, ct);
    order.MarkPaid(message.PaidAt);                       // setting a state, not adding an amount
    db.InboxMessages.Add(new InboxMessage { MessageId = message.Id });

    await db.SaveChangesAsync(ct);
    await tx.CommitAsync(ct);
}   // the broker message is acknowledged only after this returns
