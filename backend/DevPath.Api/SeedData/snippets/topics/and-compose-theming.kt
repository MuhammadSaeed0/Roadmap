private val LightColors = lightColorScheme(primary = Color(0xFF1B6B4A), secondary = Color(0xFF4E6355))
private val DarkColors = darkColorScheme(primary = Color(0xFF8BD6AE), secondary = Color(0xFFB5CCBB))

@Composable
fun ShopTheme(darkTheme: Boolean = isSystemInDarkTheme(), dynamicColor: Boolean = true, content: @Composable () -> Unit) {
    val context = LocalContext.current
    val colors = when {
        dynamicColor && Build.VERSION.SDK_INT >= 31 ->
            if (darkTheme) dynamicDarkColorScheme(context) else dynamicLightColorScheme(context)
        darkTheme -> DarkColors
        else -> LightColors
    }
    MaterialTheme(colorScheme = colors, typography = Typography(), content = content)
}

@Composable
fun EmptyState(icon: ImageVector, title: String, actionLabel: String, onAction: () -> Unit, modifier: Modifier = Modifier) {
    Column(modifier.padding(32.dp), horizontalAlignment = Alignment.CenterHorizontally) {
        Icon(icon, contentDescription = null, tint = MaterialTheme.colorScheme.primary, modifier = Modifier.size(48.dp))
        Text(title, style = MaterialTheme.typography.titleMedium, modifier = Modifier.padding(vertical = 12.dp))
        FilledTonalButton(onClick = onAction) { Text(actionLabel) }
    }
}
