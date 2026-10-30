var builder = WebApplication.CreateBuilder(args);
builder.Services.AddControllers();
// TODO: problem details + the exception handler

var app = builder.Build();
// TODO: app.UseExceptionHandler();
app.MapControllers();
app.Run();
