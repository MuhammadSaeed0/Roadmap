suspend fun loadProfilePage(userId: String): ProfilePage = coroutineScope {
    val user = async { user(userId) }
    val posts = async { posts(userId) }
    val followers = async { followers(userId) }
    ProfilePage(user.await(), posts.await(), followers.await())
}
