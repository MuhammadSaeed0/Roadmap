@Composable
fun BarcodeScanner(onCode: (String) -> Unit) {
    val context = LocalContext.current
    val lifecycleOwner = LocalLifecycleOwner.current
    val previewView = remember { PreviewView(context) }
    val scanner = remember { BarcodeScanning.getClient() }

    LaunchedEffect(Unit) {
        val provider = ProcessCameraProvider.awaitInstance(context)
        val preview = Preview.Builder().build().also { it.surfaceProvider = previewView.surfaceProvider }
        val analysis = ImageAnalysis.Builder()
            .setBackpressureStrategy(ImageAnalysis.STRATEGY_KEEP_ONLY_LATEST)   // drop frames, don't queue
            .build()
        analysis.setAnalyzer(Executors.newSingleThreadExecutor()) { proxy ->
            val image = proxy.image ?: return@setAnalyzer proxy.close()
            scanner.process(InputImage.fromMediaImage(image, proxy.imageInfo.rotationDegrees))
                .addOnSuccessListener { codes -> codes.firstOrNull()?.rawValue?.let(onCode) }
                .addOnCompleteListener { proxy.close() }                       // always close the frame
        }
        provider.unbindAll()
        provider.bindToLifecycle(lifecycleOwner, CameraSelector.DEFAULT_BACK_CAMERA, preview, analysis)
    }
    AndroidView(factory = { previewView }, modifier = Modifier.fillMaxSize())
}
