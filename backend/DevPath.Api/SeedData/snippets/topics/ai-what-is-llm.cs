using Microsoft.Extensions.AI;

// A model call is an HTTP request with a list of messages. The model keeps no memory:
// to continue the conversation, send the earlier messages again.
List<ChatMessage> history =
[
    new(ChatRole.System, "You are a patient tutor for first-year students."),
    new(ChatRole.User, "What is a foreign key?"),
];

ChatResponse first = await chat.GetResponseAsync(history);
history.AddMessages(first);                      // keep the assistant's reply

history.Add(new(ChatRole.User, "Give me an example with two tables."));
ChatResponse second = await chat.GetResponseAsync(history);
Console.WriteLine(second.Text);
