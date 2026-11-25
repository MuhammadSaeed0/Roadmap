// Few-shot: examples as earlier user/assistant turns teach the exact output format.
List<ChatMessage> messages =
[
    new(ChatRole.System, "Classify the support ticket. Reply with one label: bug, feature or billing."),
    new(ChatRole.User, "The app crashes when I log in"),       new(ChatRole.Assistant, "bug"),
    new(ChatRole.User, "Please add a dark mode"),              new(ChatRole.Assistant, "feature"),
    new(ChatRole.User, "I was charged twice this month"),      new(ChatRole.Assistant, "billing"),
    new(ChatRole.User, ticketText),
];
var label = (await chat.GetResponseAsync(messages, new ChatOptions { Temperature = 0f })).Text.Trim();
