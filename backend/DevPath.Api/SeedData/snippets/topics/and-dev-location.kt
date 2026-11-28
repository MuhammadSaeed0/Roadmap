@SuppressLint("MissingPermission")   // checked by the caller
fun FusedLocationProviderClient.updates(intervalMs: Long = 5_000): Flow<Location> = callbackFlow {
    val request = LocationRequest.Builder(Priority.PRIORITY_BALANCED_POWER_ACCURACY, intervalMs).build()
    val callback = object : LocationCallback() {
        override fun onLocationResult(result: LocationResult) {
            result.lastLocation?.let { trySend(it) }
        }
    }
    requestLocationUpdates(request, callback, Looper.getMainLooper())
    awaitClose { removeLocationUpdates(callback) }            // stops when nobody collects
}

@Composable
fun RunMap(route: List<LatLng>) {
    val camera = rememberCameraPositionState()
    LaunchedEffect(route.lastOrNull()) {
        route.lastOrNull()?.let { camera.animate(CameraUpdateFactory.newLatLngZoom(it, 16f)) }
    }
    GoogleMap(cameraPositionState = camera, modifier = Modifier.fillMaxSize()) {
        Polyline(points = route, width = 12f)
        route.lastOrNull()?.let { Marker(state = MarkerState(it), title = "You") }
    }
}
