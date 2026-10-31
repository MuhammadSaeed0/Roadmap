var builder = WebApplication.CreateBuilder(args);
builder.Services.AddControllers();
builder.Services.AddSingleton<IProductService, InMemoryProductService>();

var app = builder.Build();
app.MapControllers();
app.Run();
