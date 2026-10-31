using System.Collections.Concurrent;

/// <summary>In-memory users for the exercise; a real app stores them with EF Core.</summary>
public class UserStore
{
    private readonly ConcurrentDictionary<string, User> users = new(StringComparer.OrdinalIgnoreCase);
    private int nextId;

    public User? Find(string email) => users.GetValueOrDefault(email);

    public bool TryAdd(User user)
    {
        user.Id = Interlocked.Increment(ref nextId);
        if (users.IsEmpty) user.Role = "Admin"; // the first account is the admin
        return users.TryAdd(user.Email, user);
    }
}
