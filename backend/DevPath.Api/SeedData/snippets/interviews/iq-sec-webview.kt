// Challenge: what's wrong here, and how would you fix it?
class PromoActivity : ComponentActivity() {          // exported for deep links
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val web = WebView(this)
        web.settings.javaScriptEnabled = true
        web.settings.allowFileAccess = true
        web.addJavascriptInterface(WalletBridge(walletRepo), "Wallet")   // exposes transfer()
        web.loadUrl(intent.data?.getQueryParameter("page") ?: "https://promo.shop.example")
        setContentView(web)
    }
}
