data class SignUpState(
    val email: String = "", val password: String = "",
    val emailError: String? = null, val passwordError: String? = null, val isSubmitting: Boolean = false,
) { val canSubmit get() = email.isNotBlank() && password.isNotBlank() && !isSubmitting }

object SignUpValidator {
    fun email(value: String): String? = if (Patterns.EMAIL_ADDRESS.matcher(value).matches()) null else "Enter a valid email"
    fun password(value: String): String? = if (value.length >= 8) null else "Use at least 8 characters"
}

@Composable
fun SignUpForm(state: SignUpState, onEmail: (String) -> Unit, onPassword: (String) -> Unit, onSubmit: () -> Unit) {
    val focus = LocalFocusManager.current
    Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        OutlinedTextField(
            value = state.email, onValueChange = onEmail, label = { Text("Email") },
            isError = state.emailError != null, supportingText = { state.emailError?.let { Text(it) } },
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email, imeAction = ImeAction.Next),
            keyboardActions = KeyboardActions(onNext = { focus.moveFocus(FocusDirection.Down) }), singleLine = true,
        )
        OutlinedTextField(
            value = state.password, onValueChange = onPassword, label = { Text("Password") },
            visualTransformation = PasswordVisualTransformation(), isError = state.passwordError != null,
            supportingText = { state.passwordError?.let { Text(it) } },
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password, imeAction = ImeAction.Done),
            keyboardActions = KeyboardActions(onDone = { onSubmit() }), singleLine = true,
        )
        Button(onClick = onSubmit, enabled = state.canSubmit) {
            if (state.isSubmitting) CircularProgressIndicator(Modifier.size(18.dp), strokeWidth = 2.dp) else Text("Create account")
        }
    }
}
