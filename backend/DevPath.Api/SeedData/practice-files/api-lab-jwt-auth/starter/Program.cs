var builder = WebApplication.CreateBuilder(args);
builder.Services.AddControllers();
builder.Services.AddSingleton<UserStore>();
// TODO: AddAuthentication().AddJwtBearer(...) and AddAuthorization()

var app = builder.Build();
// TODO: authentication and authorization middleware
app.MapControllers();
app.Run();
