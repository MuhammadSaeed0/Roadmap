@Composable
fun InboxScreen(messages: List<Mail>, selected: Mail?, onSelect: (Mail) -> Unit) {
    val windowSize = currentWindowAdaptiveInfo().windowSizeClass
    if (windowSize.windowWidthSizeClass == WindowWidthSizeClass.EXPANDED) {
        Row {
            MailList(messages, onSelect, Modifier.weight(0.4f))
            MailDetail(selected, Modifier.weight(0.6f))          // list and details side by side
        }
    } else {
        MailList(messages, onSelect, Modifier.fillMaxSize())
    }
}

@Composable
fun MailRow(mail: Mail, onClick: () -> Unit) {
    Row(
        Modifier
            .fillMaxWidth()
            .heightIn(min = 48.dp)                                    // touch target
            .clickable(onClickLabel = "Open message", onClick = onClick)
            .semantics(mergeDescendants = true) {}                    // read as one item by TalkBack
            .padding(16.dp),
    ) {
        Icon(Icons.Default.Email, contentDescription = if (mail.unread) "Unread" else null)
        Column(Modifier.padding(start = 12.dp)) {
            Text("From ${mail.sender}", style = MaterialTheme.typography.titleSmall)
            Text(mail.subject, maxLines = 1, overflow = TextOverflow.Ellipsis)
        }
    }
}
