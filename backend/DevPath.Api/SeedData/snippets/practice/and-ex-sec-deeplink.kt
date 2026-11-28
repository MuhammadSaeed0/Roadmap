class LinkActivity : ComponentActivity() {     // exported, handles shop://
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val uri = intent.data ?: return finish()
        when (uri.host) {
            "transfer" -> lifecycleScope.launch {
                wallet.transfer(uri.getQueryParameter("to")!!, uri.getQueryParameter("amount")!!.toLong())
                finish()
            }
            "help" -> setContentView(WebView(this).apply {
                settings.javaScriptEnabled = true
                addJavascriptInterface(WalletBridge(wallet), "Wallet")
                loadUrl(uri.getQueryParameter("page") ?: "https://help.shop.example")
            })
        }
        intent.getStringExtra("next")?.let { startActivity(Intent.parseUri(it, 0)) }
    }
}
