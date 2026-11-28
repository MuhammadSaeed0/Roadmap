@Composable
fun ChatMessages(messages: List<Message>, modifier: Modifier = Modifier) {
    val listState = rememberLazyListState()
    val scope = rememberCoroutineScope()
    val showJump by remember { derivedStateOf { listState.firstVisibleItemIndex > 3 } }

    Box(modifier) {
        LazyColumn(state = listState, reverseLayout = true, contentPadding = PaddingValues(12.dp)) {
            items(messages, key = { it.id }, contentType = { if (it.mine) "mine" else "theirs" }) { message ->
                MessageBubble(message, Modifier.animateItem())
            }
        }
        if (showJump) {
            SmallFloatingActionButton(
                onClick = { scope.launch { listState.animateScrollToItem(0) } },
                modifier = Modifier.align(Alignment.BottomEnd).padding(16.dp),
            ) { Icon(Icons.Default.KeyboardArrowDown, contentDescription = "Newest messages") }
        }
    }
}
