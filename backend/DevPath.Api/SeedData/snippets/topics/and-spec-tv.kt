@Composable
fun BrowseScreen(rows: List<CourseRow>, featured: List<Course>, onOpen: (Course) -> Unit) {
    val firstCard = remember { FocusRequester() }
    LazyColumn(contentPadding = PaddingValues(horizontal = 48.dp, vertical = 27.dp)) {   // overscan-safe margins
        item {
            Carousel(itemCount = featured.size, modifier = Modifier.height(340.dp).fillMaxWidth()) { i ->
                FeaturedSlide(featured[i], onClick = { onOpen(featured[i]) })
            }
        }
        items(rows) { row ->
            Text(row.title, style = MaterialTheme.typography.titleLarge)
            LazyRow(horizontalArrangement = Arrangement.spacedBy(16.dp)) {
                itemsIndexed(row.courses) { index, course ->
                    StandardCardContainer(                       // scales and highlights when focused
                        modifier = if (row == rows.first() && index == 0) Modifier.focusRequester(firstCard) else Modifier,
                        imageCard = { interaction -> Card(onClick = { onOpen(course) }, interactionSource = interaction) { CourseImage(course) } },
                        title = { Text(course.title) }
                    )
                }
            }
        }
    }
    LaunchedEffect(Unit) { firstCard.requestFocus() }          // never leave the user without focus
}
