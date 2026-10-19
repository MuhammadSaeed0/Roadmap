var builder = WebApplication.CreateBuilder(args);

// 1) Register services (dependency injection container)
builder.Services.AddControllers();
builder.Services.AddDbContext<AppDbContext>(o =>
    o.UseSqlServer(builder.Configuration.GetConnectionString("Default")));
builder.Services.AddScoped<ProductService>();

var app = builder.Build();

// 2) Configure the HTTP pipeline — order matters
app.UseExceptionHandler();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
