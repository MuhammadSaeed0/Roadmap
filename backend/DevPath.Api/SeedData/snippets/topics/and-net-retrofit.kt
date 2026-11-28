@Serializable
data class ForecastDto(
    val city: String,
    @SerialName("temp_c") val tempC: Double,
    val condition: String? = null,          // optional on the server
)

interface WeatherApi {
    @GET("forecast")
    suspend fun forecast(@Query("city") city: String): ForecastDto

    @POST("favorites")
    suspend fun addFavorite(@Body body: FavoriteDto): Response<Unit>
}

val json = Json { ignoreUnknownKeys = true; explicitNulls = false }

@Provides @Singleton
fun weatherApi(client: OkHttpClient): WeatherApi = Retrofit.Builder()
    .baseUrl("https://api.example.com/v1/")                 // must end with "/"
    .client(client)
    .addConverterFactory(json.asConverterFactory("application/json".toMediaType()))
    .build()
    .create(WeatherApi::class.java)

fun ForecastDto.toDomain() = Forecast(city, tempC.roundToInt(), condition ?: "Unknown")
