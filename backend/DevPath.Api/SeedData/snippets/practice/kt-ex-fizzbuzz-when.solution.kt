fun fizzBuzz(n: Int): String = when {
    n % 15 == 0 -> "FizzBuzz"
    n % 3 == 0 -> "Fizz"
    n % 5 == 0 -> "Buzz"
    else -> n.toString()
}

fun grade(score: Int): String = when (score) {
    in 90..100 -> "A"
    in 80..89 -> "B"
    in 65..79 -> "C"
    in 0..64 -> "F"
    else -> "Invalid"
}
