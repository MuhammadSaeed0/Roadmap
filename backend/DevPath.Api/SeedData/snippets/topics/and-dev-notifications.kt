const val CHANNEL_MESSAGES = "messages"

fun createChannels(context: Context) {
    val channel = NotificationChannel(CHANNEL_MESSAGES, context.getString(R.string.channel_messages),
        NotificationManager.IMPORTANCE_HIGH)
    context.getSystemService(NotificationManager::class.java).createNotificationChannel(channel)
}

fun showMessage(context: Context, chatId: String, sender: Person, text: String) {
    if (ContextCompat.checkSelfPermission(context, Manifest.permission.POST_NOTIFICATIONS)
        != PackageManager.PERMISSION_GRANTED) return
    val open = PendingIntent.getActivity(context, chatId.hashCode(),
        Intent(Intent.ACTION_VIEW, "https://chat.example/c/$chatId".toUri(), context, MainActivity::class.java),
        PendingIntent.FLAG_IMMUTABLE)
    val reply = NotificationCompat.Action.Builder(R.drawable.ic_reply, "Reply",
        PendingIntent.getBroadcast(context, chatId.hashCode(), Intent(context, ReplyReceiver::class.java)
            .putExtra("chatId", chatId), PendingIntent.FLAG_MUTABLE))          // must be mutable for RemoteInput
        .addRemoteInput(RemoteInput.Builder("reply_text").setLabel("Message").build())
        .build()
    val notification = NotificationCompat.Builder(context, CHANNEL_MESSAGES)
        .setSmallIcon(R.drawable.ic_chat)
        .setStyle(NotificationCompat.MessagingStyle(Person.Builder().setName("You").build())
            .addMessage(text, System.currentTimeMillis(), sender))
        .setContentIntent(open)
        .addAction(reply)
        .setAutoCancel(true)
        .build()
    NotificationManagerCompat.from(context).notify(chatId.hashCode(), notification)
}
