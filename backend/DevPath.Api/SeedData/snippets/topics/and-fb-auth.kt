class AuthRepository(private val auth: FirebaseAuth, private val credentials: CredentialManager) {

    val currentUser: Flow<FirebaseUser?> = callbackFlow {
        val listener = FirebaseAuth.AuthStateListener { trySend(it.currentUser) }
        auth.addAuthStateListener(listener)
        awaitClose { auth.removeAuthStateListener(listener) }
    }

    suspend fun signInWithGoogle(activity: Activity, webClientId: String): Result<FirebaseUser> = runCatching {
        val option = GetGoogleIdOption.Builder()
            .setServerClientId(webClientId)
            .setFilterByAuthorizedAccounts(false)
            .build()
        val response = credentials.getCredential(activity, GetCredentialRequest(listOf(option)))
        val google = GoogleIdTokenCredential.createFrom(response.credential.data)
        val firebaseCredential = GoogleAuthProvider.getCredential(google.idToken, null)
        auth.signInWithCredential(firebaseCredential).await().user!!
    }

    suspend fun idTokenForBackend(): String? = auth.currentUser?.getIdToken(false)?.await()?.token

    suspend fun signOut() {
        auth.signOut()
        credentials.clearCredentialState(ClearCredentialStateRequest())
    }
}
