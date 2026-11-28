suspend fun prepareImage(context: Context, uri: Uri, maxSide: Int = 1_280): ByteArray = withContext(Dispatchers.Default) {
    val source = ImageDecoder.createSource(context.contentResolver, uri)
    val bitmap = ImageDecoder.decodeBitmap(source) { decoder, info, _ ->
        val scale = maxSide.toFloat() / maxOf(info.size.width, info.size.height)
        if (scale < 1f) decoder.setTargetSize((info.size.width * scale).toInt(), (info.size.height * scale).toInt())
    }
    ByteArrayOutputStream().use { out ->
        bitmap.compress(Bitmap.CompressFormat.JPEG, 80, out)      // re-encoding drops EXIF (GPS) data
        out.toByteArray()
    }
}

@Composable
fun AskAboutPhoto(onAsk: (Uri, String) -> Unit) {
    var picked by remember { mutableStateOf<Uri?>(null) }
    var question by remember { mutableStateOf("") }
    val picker = rememberLauncherForActivityResult(ActivityResultContracts.PickVisualMedia()) { picked = it }
    Column {
        picked?.let { AsyncImage(model = it, contentDescription = stringResource(R.string.photo_to_send)) }
        OutlinedButton(onClick = { picker.launch(PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageOnly)) }) {
            Text(stringResource(R.string.choose_photo))
        }
        OutlinedTextField(question, { question = it }, label = { Text(stringResource(R.string.your_question)) })
        Button(enabled = picked != null && question.isNotBlank(), onClick = { onAsk(picked!!, question) }) {
            Text(stringResource(R.string.ask))
        }
    }
}

// Read the answer aloud in the user's language.
class Speaker(context: Context) : TextToSpeech.OnInitListener {
    private val tts = TextToSpeech(context, this)
    override fun onInit(status: Int) { tts.language = Locale.getDefault() }
    fun say(text: String) = tts.speak(text, TextToSpeech.QUEUE_FLUSH, null, "answer")
    fun shutdown() = tts.shutdown()
}
