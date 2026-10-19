builder.Services.AddCors(o => o.AddPolicy("frontend", p =>
    p.WithOrigins("http://localhost:4200")     // an Origin header never ends with '/'
     .AllowAnyHeader()
     .AllowAnyMethod()));

var app = builder.Build();
app.UseCors("frontend");                       // before the endpoints
app.MapControllers();
app.Run();
