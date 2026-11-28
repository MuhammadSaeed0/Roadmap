@Serializable object Home
@Serializable object Cart
@Serializable data class ProductDetails(val id: Int)

@Composable
fun ShopNavHost(navController: NavHostController = rememberNavController()) {
    NavHost(navController, startDestination = Home) {
        composable<Home> {
            HomeScreen(onProductClick = { id -> navController.navigate(ProductDetails(id)) })
        }
        composable<ProductDetails> {          // the ViewModel reads the id with savedStateHandle.toRoute<ProductDetails>()
            ProductDetailsScreen(onBack = { navController.popBackStack() })
        }
        composable<Cart> { CartScreen() }
    }
}

// Bottom bar tabs: keep each tab's state and avoid stacking copies.
fun NavController.openTab(route: Any) = navigate(route) {
    popUpTo(graph.findStartDestination().id) { saveState = true }
    launchSingleTop = true
    restoreState = true
}
