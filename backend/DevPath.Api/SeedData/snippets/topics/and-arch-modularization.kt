// settings.gradle.kts
include(
    ":app",
    ":feature:orders", ":feature:tracking", ":feature:account",
    ":core:model", ":core:network", ":core:database", ":core:data", ":core:designsystem",
)

// feature/orders/build.gradle.kts
plugins {
    id("shop.android.feature")        // convention plugin from build-logic: Compose, Hilt, test setup
}
android { namespace = "com.example.shop.feature.orders" }
dependencies {
    implementation(projects.core.data)            // features depend on core, never on other features
    implementation(projects.core.designsystem)
}

// feature/orders: the only public entry point is its navigation.
fun NavGraphBuilder.ordersScreen(onOrderClick: (Int) -> Unit) {
    composable<OrdersRoute> { OrdersRoute(onOrderClick) }
}
// :app wires features together: ordersScreen(onOrderClick = { navController.navigate(TrackingRoute(it)) })
