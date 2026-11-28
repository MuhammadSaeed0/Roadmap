@HiltAndroidApp
class ShopApp : Application()

@AndroidEntryPoint
class MainActivity : ComponentActivity() { /* setContent { ShopNavHost() } */ }

@Module
@InstallIn(SingletonComponent::class)
abstract class DataModule {
    @Binds abstract fun cartRepository(impl: OfflineFirstCartRepository): CartRepository
}

@Module
@InstallIn(SingletonComponent::class)
object NetworkModule {
    @Provides @Singleton
    fun retrofit(): Retrofit = Retrofit.Builder()
        .baseUrl(BuildConfig.API_URL)
        .addConverterFactory(Json.asConverterFactory("application/json".toMediaType()))
        .build()

    @Provides fun shopApi(retrofit: Retrofit): ShopApi = retrofit.create(ShopApi::class.java)

    @Provides @IoDispatcher fun io(): CoroutineDispatcher = Dispatchers.IO
}

@Qualifier @Retention(AnnotationRetention.BINARY) annotation class IoDispatcher

@HiltViewModel
class CartViewModel @Inject constructor(private val cart: CartRepository) : ViewModel()
