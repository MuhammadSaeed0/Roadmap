public static class Tests
{
    [Test("Success holds a value")] public static void Ok() { var r = Result<int>.Success(5); Assert.True(r.IsSuccess, "success"); Assert.Equal(5, r.Value); }
    [Test("Failure holds an error")] public static void Fail() { var r = Result<string>.Failure("missing"); Assert.False(r.IsSuccess, "failure"); Assert.Equal("missing", r.Error); }
    [Test("Reading the value of a failure throws")] public static void Throws() => Assert.Throws<InvalidOperationException>(() => _ = Result<int>.Failure("x").Value);
    [Test("Map transforms a success")] public static void MapOk() => Assert.Equal(20, Result<int>.Success(2).Map(x => x * 10).Value);
    [Test("Map can change the type")] public static void MapType() => Assert.Equal("2!", Result<int>.Success(2).Map(x => x + "!").Value);
    [Test("Map passes a failure through")] public static void MapFail() { var r = Result<int>.Failure("missing").Map(x => x * 10); Assert.False(r.IsSuccess, "still a failure"); Assert.Equal("missing", r.Error); }
}
