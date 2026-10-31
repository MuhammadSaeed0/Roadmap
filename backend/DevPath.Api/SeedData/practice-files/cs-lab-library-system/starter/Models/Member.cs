namespace Library;

public enum MemberType { Student, Staff }

public class Member(int id, string name, MemberType type)
{
    public int Id { get; } = id;
    public string Name { get; } = name;
    public MemberType Type { get; } = type;
    // TODO: how many books can this member borrow at once?
}
