// On-device translation with ML Kit: download the model once, then work offline.
class OnDeviceTranslator(source: String = TranslateLanguage.ENGLISH, target: String = TranslateLanguage.ARABIC) {
    private val translator = Translation.getClient(
        TranslatorOptions.Builder().setSourceLanguage(source).setTargetLanguage(target).build()
    )

    suspend fun prepare() {
        translator.downloadModelIfNeeded(DownloadConditions.Builder().requireWifi().build()).await()
    }

    suspend fun translate(text: String): String = translator.translate(text).await()

    fun close() = translator.close()
}

// Hybrid: on-device when available, cloud otherwise, behind one interface.
interface Summariser { suspend fun summarise(text: String): String }

class HybridSummariser(
    private val onDevice: OnDeviceSummariser,       // e.g. an ML Kit GenAI summarisation client
    private val cloud: CloudSummariser,             // your backend endpoint
) : Summariser {
    override suspend fun summarise(text: String): String =
        if (onDevice.isAvailable()) onDevice.summarise(text)   // private, offline, free
        else cloud.summarise(text)                            // ask consent before sending text
}
