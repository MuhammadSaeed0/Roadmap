public class Result<T>
{
    private readonly T? _value;

    private Result(bool success, T? value, string? error)
    {
        IsSuccess = success;
        _value = value;
        Error = error;
    }

    public bool IsSuccess { get; }
    public string? Error { get; }
    public T Value => IsSuccess ? _value! : throw new InvalidOperationException("A failed result has no value: " + Error);

    public static Result<T> Success(T value) => new(true, value, null);
    public static Result<T> Failure(string error) => new(false, default, error);

    public Result<TOut> Map<TOut>(Func<T, TOut> mapper) =>
        IsSuccess ? Result<TOut>.Success(mapper(_value!)) : Result<TOut>.Failure(Error!);
}
