class PlaybackService : MediaSessionService() {
    private var session: MediaSession? = null

    override fun onCreate() {
        super.onCreate()
        val player = ExoPlayer.Builder(this)
            .setAudioAttributes(
                AudioAttributes.Builder().setUsage(C.USAGE_MEDIA).setContentType(C.AUDIO_CONTENT_TYPE_SPEECH).build(),
                /* handleAudioFocus = */ true,
            )
            .setHandleAudioBecomingNoisy(true)                // pause when headphones are unplugged
            .build()
        session = MediaSession.Builder(this, player).build()
    }

    override fun onGetSession(controllerInfo: MediaSession.ControllerInfo) = session

    override fun onDestroy() {
        session?.run { player.release(); release() }
        session = null
        super.onDestroy()
    }
}

// In the UI: connect with a MediaController and play a lesson.
suspend fun playLesson(context: Context, url: String, title: String) {
    val token = SessionToken(context, ComponentName(context, PlaybackService::class.java))
    val controller = MediaController.Builder(context, token).buildAsync().await()
    controller.setMediaItem(MediaItem.Builder().setUri(url)
        .setMediaMetadata(MediaMetadata.Builder().setTitle(title).build()).build())
    controller.prepare()
    controller.play()
}
