namespace Library;

public enum MemberType { Student, Staff }

public class Member(int id, string name, MemberType type)
{
    public int Id { get; } = id;
    public string Name { get; } = name;
    public MemberType Type { get; } = type;
    public int MaxLoans => Type == MemberType.Staff ? 5 : 3;
}
