@Composable
fun Browse(rows: List<CourseRow>, onOpen: (Course) -> Unit) {
    LazyColumn {
        items(rows) { row ->
            Text(row.title)
            LazyRow {
                items(row.courses) { course ->
                    Card(onClick = { onOpen(course) }) { CourseImage(course) }
                }
            }
        }
        item {
            Box(Modifier.clickable { playFeatured() }.padding(12.dp)) { Text("Play") }
        }
    }
}
