class AvatarUploader(private val storage: FirebaseStorage, private val auth: FirebaseAuth) {
    suspend fun upload(jpeg: ByteArray, onProgress: (Int) -> Unit): String {
        val uid = requireNotNull(auth.currentUser).uid
        val ref = storage.reference.child("users/$uid/avatar.jpg")
        ref.putBytes(jpeg, storageMetadata { contentType = "image/jpeg" })
            .addOnProgressListener { s -> onProgress((100 * s.bytesTransferred / s.totalByteCount).toInt()) }
            .await()
        return ref.path                                   // store the path in Firestore, not a public URL
    }
}

// Callable function: the server decides the reward (TypeScript, functions/src/index.ts)
// export const claimReferral = onCall({ enforceAppCheck: true }, async (req) => {
//   if (!req.auth) throw new HttpsError("unauthenticated", "Sign in first");
//   const code = String(req.data.code ?? "");
//   ... validate the code, check it wasn't used, write the reward in a transaction ...
//   return { points: 100 };
// });

suspend fun claimReferral(functions: FirebaseFunctions, code: String): Int {
    val result = functions.getHttpsCallable("claimReferral").call(mapOf("code" to code)).await()
    return (result.getData() as Map<*, *>)["points"] as Int
}

// storage.rules (excerpt)
// match /users/{uid}/{file=**} {
//   allow read: if request.auth != null && request.auth.uid == uid;
//   allow write: if request.auth != null && request.auth.uid == uid
//     && request.resource.size < 5 * 1024 * 1024 && request.resource.contentType.matches('image/.*');
// }
