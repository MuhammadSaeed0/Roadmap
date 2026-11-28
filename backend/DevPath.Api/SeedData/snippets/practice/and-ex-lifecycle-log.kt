@Composable
fun FeedbackForm(onSend: (String, String) -> Unit) {
    var name by remember { mutableStateOf("") }
    var message by remember { mutableStateOf("") }
    Column {
        TextField(value = name, onValueChange = { name = it }, label = { Text("Name") })
        TextField(value = message, onValueChange = { message = it }, label = { Text("Message") })
        Button(onClick = { onSend(name, message) }) { Text("Send") }
    }
}
