fun SensorManager.events(type: Int, rate: Int = SensorManager.SENSOR_DELAY_UI): Flow<FloatArray> = callbackFlow {
    val sensor = getDefaultSensor(type) ?: run { close(); return@callbackFlow }
    val listener = object : SensorEventListener {
        override fun onSensorChanged(e: SensorEvent) { trySend(e.values.copyOf()) }
        override fun onAccuracyChanged(s: Sensor, accuracy: Int) = Unit
    }
    registerListener(listener, sensor, rate)
    awaitClose { unregisterListener(listener) }
}

private val HEART_RATE_SERVICE = UUID.fromString("0000180d-0000-1000-8000-00805f9b34fb")

@SuppressLint("MissingPermission")   // BLUETOOTH_SCAN checked by the caller
fun BluetoothLeScanner.heartRateDevices(): Flow<ScanResult> = callbackFlow {
    val callback = object : ScanCallback() {
        override fun onScanResult(type: Int, result: ScanResult) { trySend(result) }
        override fun onScanFailed(code: Int) { close(IllegalStateException("Scan failed: $code")) }
    }
    val filters = listOf(ScanFilter.Builder().setServiceUuid(ParcelUuid(HEART_RATE_SERVICE)).build())
    startScan(filters, ScanSettings.Builder().setScanMode(ScanSettings.SCAN_MODE_LOW_LATENCY).build(), callback)
    awaitClose { stopScan(callback) }
}.timeout(15.seconds)                                         // never scan forever
