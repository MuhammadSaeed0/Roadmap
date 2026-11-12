foreach (var group in Algo.GroupAnagrams(["eat", "tea", "tan", "ate", "nat", "bat"]))
    Console.WriteLine(string.Join(", ", group));
