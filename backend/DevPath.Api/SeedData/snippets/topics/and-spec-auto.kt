// Media apps: the car renders your library; you only provide the tree and the session.
class PodcastService : MediaLibraryService() {
    private lateinit var session: MediaLibrarySession

    override fun onCreate() {
        super.onCreate()
        val player = ExoPlayer.Builder(this).build()
        session = MediaLibrarySession.Builder(this, player, object : MediaLibrarySession.Callback {
            override fun onGetLibraryRoot(s: MediaLibrarySession, b: MediaSession.ControllerInfo, p: LibraryParams?) =
                Futures.immediateFuture(LibraryResult.ofItem(library.root(), p))
            override fun onGetChildren(s: MediaLibrarySession, b: MediaSession.ControllerInfo, parentId: String,
                                       page: Int, pageSize: Int, p: LibraryParams?) =
                Futures.immediateFuture(LibraryResult.ofItemList(library.children(parentId), p))
        }).build()
    }

    override fun onGetSession(controllerInfo: MediaSession.ControllerInfo) = session
}

// Other categories (POI, charging, parking): templates from the Car App Library
class ChargersScreen(carContext: CarContext) : Screen(carContext) {
    override fun onGetTemplate(): Template {
        val list = ItemList.Builder().apply {
            chargers.take(6).forEach { addItem(Row.Builder().setTitle(it.name).addText("${it.free} free · ${it.distance}").build()) }
        }.build()
        return ListTemplate.Builder().setTitle("Nearby chargers").setHeaderAction(Action.APP_ICON).setSingleList(list).build()
    }
}
