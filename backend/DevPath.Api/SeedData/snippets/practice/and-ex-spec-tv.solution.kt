@Composable
fun Browse(rows: List<CourseRow>, onOpen: (Course) -> Unit) {
    val first = remember { FocusRequester() }
    LazyColumn(Modifier.focusRestorer()) {
        items(rows, key = { it.id }) { row ->
            Text(row.title)
            LazyRow(Modifier.focusRestorer()) {
                itemsIndexed(row.courses, key = { _, c -> c.id }) { i, course ->
                    val m = if (row == rows.first() && i == 0) Modifier.focusRequester(first) else Modifier
                    Card(onClick = { onOpen(course) }, modifier = m) { CourseImage(course) }
                }
            }
        }
        item { Button(onClick = { playFeatured() }) { Text("Play") } }   // TV Material: focusable with a focus state
    }
    LaunchedEffect(rows.isNotEmpty()) { if (rows.isNotEmpty()) first.requestFocus() }
}
