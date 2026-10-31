public static class Tests
{
    private static Func<HttpContext, Func<Task>, Task> Logger(string name) =>
        async (ctx, next) => { ctx.Log.Add(name + "-in"); await next(); ctx.Log.Add(name + "-out"); };

    [Test("Middleware runs in order, around the endpoint")]
    public static async Task Order()
    {
        var app = new Pipeline().Use(Logger("A")).Use(Logger("B"))
            .Build(ctx => { ctx.Log.Add("endpoint"); return Task.CompletedTask; });
        var ctx = new HttpContext();
        await app(ctx);
        Assert.SequenceEqual(["A-in", "B-in", "endpoint", "B-out", "A-out"], ctx.Log);
    }

    [Test("ErrorHandling turns exceptions into a 500")]
    public static async Task Errors()
    {
        var app = new Pipeline().Use(Middlewares.ErrorHandling)
            .Build(_ => throw new InvalidOperationException("boom"));
        var ctx = new HttpContext();
        await app(ctx);
        Assert.Equal(500, ctx.StatusCode);
        Assert.Equal("Something went wrong", ctx.Body);
    }

    [Test("ApiKey stops requests without the right key")]
    public static async Task ApiKey()
    {
        var reached = 0;
        var app = new Pipeline().Use(Middlewares.ApiKey("s3cret"))
            .Build(_ => { reached++; return Task.CompletedTask; });

        var missing = new HttpContext();
        await app(missing);
        var good = new HttpContext();
        good.Headers["X-Api-Key"] = "s3cret";
        await app(good);

        Assert.Equal(401, missing.StatusCode);
        Assert.Equal(200, good.StatusCode);
        Assert.Equal(1, reached);
    }
}
