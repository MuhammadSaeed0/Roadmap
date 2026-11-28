@Composable
fun ProfileCard(name: String, role: String, avatarUrl: String, onMessage: () -> Unit, modifier: Modifier = Modifier) {
    Card(modifier.fillMaxWidth()) {
        Row(Modifier.padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
            AsyncImage(model = avatarUrl, contentDescription = null, modifier = Modifier.size(48.dp).clip(CircleShape))
            Column(Modifier.weight(1f).padding(horizontal = 12.dp)) {
                Text(name, style = MaterialTheme.typography.titleMedium, maxLines = 1, overflow = TextOverflow.Ellipsis)
                Text(role, style = MaterialTheme.typography.bodySmall)
            }
            FilledTonalButton(onClick = onMessage) { Text("Message") }
        }
    }
}

@PreviewLightDark
@Composable
private fun ProfileCardPreview() = AppTheme {
    ProfileCard("Sara Ali Mahmoud Hassan Abdelrahman", "Android developer", "", onMessage = {})
}
