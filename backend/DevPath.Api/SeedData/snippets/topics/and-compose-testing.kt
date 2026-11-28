class SignInContentTest {
    @get:Rule val compose = createComposeRule()

    @Test
    fun showsEmailErrorAndDisablesButton() {
        compose.setContent {
            SignInContent(state = SignInState(email = "sara@", emailError = "Enter a valid email"), onSubmit = {})
        }
        compose.onNodeWithText("Enter a valid email").assertIsDisplayed()
        compose.onNodeWithText("Sign in").assertIsNotEnabled()
    }

    @Test
    fun submitsOnceWithValidInput() {
        var submits = 0
        compose.setContent {
            var state by remember { mutableStateOf(SignInState()) }
            SignInContent(
                state = state,
                onEmail = { state = state.copy(email = it) },
                onPassword = { state = state.copy(password = it) },
                onSubmit = { submits++ },
            )
        }
        compose.onNodeWithText("Email").performTextInput("sara@example.com")
        compose.onNodeWithText("Password").performTextInput("secret123")
        compose.onNodeWithText("Sign in").performClick()
        assertEquals(1, submits)
    }
}
