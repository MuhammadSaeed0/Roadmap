class App : Application() {
    lateinit var lastLocation: Location

    @SuppressLint("MissingPermission")
    override fun onCreate() {
        super.onCreate()
        LocationServices.getFusedLocationProviderClient(this).requestLocationUpdates(
            LocationRequest.Builder(Priority.PRIORITY_HIGH_ACCURACY, 1_000).build(),
            object : LocationCallback() {
                override fun onLocationResult(r: LocationResult) { lastLocation = r.lastLocation!! }
            },
            Looper.getMainLooper(),
        )
    }
}
