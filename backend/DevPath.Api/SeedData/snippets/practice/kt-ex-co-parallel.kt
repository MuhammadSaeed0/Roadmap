suspend fun loadProfilePage(userId: String): ProfilePage {
    val user = user(userId)
    val posts = posts(userId)
    val followers = followers(userId)
    return ProfilePage(user, posts, followers)
}
