data class Book(val id: Int, val title: String, val author: String)
data class Member(val id: Int, val name: String)

interface BookStore {
    fun find(id: Int): Book?
    fun all(): List<Book>
}

class InMemoryBookStore(books: List<Book>) : BookStore {
    private val byId = books.associateBy { it.id }
    override fun find(id: Int) = byId[id]
    override fun all() = byId.values.toList()
}

class LibraryService(private val store: BookStore, private val maxLoans: Int = 3) {
    private val loans = mutableMapOf<Int, Int>()          // book id -> member id

    fun lend(bookId: Int, member: Member): Boolean {
        if (store.find(bookId) == null || bookId in loans) return false
        if (loans.values.count { it == member.id } >= maxLoans) return false
        loans[bookId] = member.id
        return true
    }

    fun giveBack(bookId: Int, member: Member): Boolean =
        if (loans[bookId] == member.id) { loans.remove(bookId); true } else false

    fun available(): List<Book> = store.all().filter { it.id !in loans }
}
