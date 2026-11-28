// Version 1: everything trusted to the client
suspend fun finishQuiz(db: FirebaseFirestore, uid: String, quiz: QuizWithAnswers, picked: List<Int>) {
    val score = picked.zip(quiz.correctAnswers).count { (a, b) -> a == b }   // answers shipped to the phone
    db.document("users/$uid/scores/${quiz.id}").set(mapOf("score" to score)).await()   // client writes the score
}
