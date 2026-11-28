@Composable
fun WaterApp(viewModel: WaterViewModel) {
    val glasses by viewModel.glasses.collectAsStateWithLifecycle()
    AppScaffold(timeText = { TimeText() }) {
        val listState = rememberTransformingLazyColumnState()
        ScreenScaffold(scrollState = listState) {
            TransformingLazyColumn(state = listState) {           // scales items near the round edges
                item { ListHeader { Text(stringResource(R.string.today, glasses)) } }
                item { Button(onClick = viewModel::addGlass, label = { Text(stringResource(R.string.add_glass)) }) }
                item { Button(onClick = viewModel::undo, label = { Text(stringResource(R.string.undo)) }) }
            }
        }
    }
}

// A tile: a quick summary in the tiles carousel
class WaterTileService : SuspendingTileService() {
    override suspend fun tileRequest(requestParams: RequestBuilders.TileRequest) =
        TileBuilders.Tile.Builder().setResourcesVersion("1")
            .setTileTimeline(TimelineBuilders.Timeline.fromLayoutElement(
                Text.Builder(this, "${repository.today()} / 8 glasses").build()))
            .build()

    override suspend fun resourcesRequest(requestParams: RequestBuilders.ResourcesRequest) =
        ResourceBuilders.Resources.Builder().setVersion("1").build()
}
