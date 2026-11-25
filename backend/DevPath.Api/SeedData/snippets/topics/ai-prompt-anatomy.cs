// A prompt with clear parts: stable rules in the system message, the request in the user message.
var system = """
    You are a support assistant for an online bookshop.
    Task: answer the customer's question about the order below.
    Format: two sentences at most, plain text, in the customer's language.
    Rules:
    - Use only the order details.
    - If the answer is not in them, say a colleague will reply within a day.

    <order>
    Order 1042, shipped 3 March with ParcelGo, tracking PG-88213.
    </order>
    """;

List<ChatMessage> messages =
[
    new(ChatRole.System, system),
    new(ChatRole.User, "Where is my book?"),
];
var answer = await chat.GetResponseAsync(messages, new ChatOptions { Temperature = 0.2f });
