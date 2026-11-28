@Composable
fun ShopApp() {
    if (LocalSpatialCapabilities.current.isSpatialUiEnabled) {
        Subspace {
            SpatialPanel(SubspaceModifier.width(1280.dp).height(800.dp).movable().resizable()) {
                CatalogScreen()
                Orbiter(position = ContentEdge.Top, offset = 24.dp) {     // floating toolbar outside the panel
                    FilterBar()
                }
            }
            SpatialPanel(SubspaceModifier.width(480.dp).height(800.dp)) { CartScreen() }
        }
    } else {
        CatalogWithCart()                                               // the same app as a normal 2D layout
    }
}
