class OrderDeepLinkActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val uri = intent.data
        // 1. Validate: only our host, only the expected path shape.
        val orderId = uri?.takeIf { it.scheme == "https" && it.host == "shop.example" }
            ?.pathSegments?.takeIf { it.size == 2 && it[0] == "orders" }
            ?.get(1)?.takeIf { it.matches(Regex("^[A-Z0-9]{10}$")) }
        if (orderId == null) { finish(); return }
        // 2. Require a session; the server still checks the order belongs to this user.
        if (!session.isSignedIn()) { startActivity(signInIntent(returnTo = uri)); finish(); return }
        startActivity(Intent(this, OrderActivity::class.java).putExtra("orderId", orderId))   // explicit intent
        finish()
    }
}

// Immutable PendingIntent: other apps can't change where it goes.
val pending = PendingIntent.getActivity(context, 0, Intent(context, OrderActivity::class.java),
    PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT)

// WebView restricted to our help site.
webView.settings.apply { javaScriptEnabled = false; allowFileAccess = false; allowContentAccess = false }
webView.webViewClient = object : WebViewClient() {
    override fun shouldOverrideUrlLoading(view: WebView, request: WebResourceRequest): Boolean =
        request.url.host != "help.shop.example"          // block everything else
}
