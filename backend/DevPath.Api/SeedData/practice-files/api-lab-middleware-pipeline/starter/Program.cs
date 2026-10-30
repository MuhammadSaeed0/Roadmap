var app = new Pipeline()
    .Use(async (ctx, next) => { ctx.Log.Add("A-in"); await next(); ctx.Log.Add("A-out"); })
    .Use(async (ctx, next) => { ctx.Log.Add("B-in"); await next(); ctx.Log.Add("B-out"); })
    .Build(ctx => { ctx.Log.Add("endpoint"); ctx.Body = "Hello"; return Task.CompletedTask; });

var context = new HttpContext();
await app(context);
Console.WriteLine(string.Join(" → ", context.Log));
