private const val ALIAS = "notes_key"

fun getOrCreateKey(): SecretKey {
    val ks = KeyStore.getInstance("AndroidKeyStore").apply { load(null) }
    (ks.getEntry(ALIAS, null) as? KeyStore.SecretKeyEntry)?.let { return it.secretKey }
    val spec = KeyGenParameterSpec.Builder(ALIAS, KeyProperties.PURPOSE_ENCRYPT or KeyProperties.PURPOSE_DECRYPT)
        .setBlockModes(KeyProperties.BLOCK_MODE_GCM)
        .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
        .setKeySize(256)
        .setUserAuthenticationRequired(true)
        .setUserAuthenticationParameters(0, KeyProperties.AUTH_BIOMETRIC_STRONG)   // every use needs a biometric
        .build()
    return KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, "AndroidKeyStore").apply { init(spec) }.generateKey()
}

fun decryptWithBiometric(activity: FragmentActivity, data: EncryptedData, onPlain: (String) -> Unit) {
    val cipher = Cipher.getInstance("AES/GCM/NoPadding").apply {
        init(Cipher.DECRYPT_MODE, getOrCreateKey(), GCMParameterSpec(128, data.iv))
    }
    val prompt = BiometricPrompt(activity, ContextCompat.getMainExecutor(activity),
        object : BiometricPrompt.AuthenticationCallback() {
            override fun onAuthenticationSucceeded(result: BiometricPrompt.AuthenticationResult) {
                val plain = result.cryptoObject!!.cipher!!.doFinal(data.ciphertext)   // only works after auth
                onPlain(plain.decodeToString())
            }
        })
    prompt.authenticate(
        BiometricPrompt.PromptInfo.Builder().setTitle("Unlock notes").setNegativeButtonText("Cancel").build(),
        BiometricPrompt.CryptoObject(cipher),
    )
}
