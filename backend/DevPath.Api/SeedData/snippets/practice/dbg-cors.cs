builder.Services.AddCors(o => o.AddPolicy("frontend", p =>
    p.WithOrigins("http://localhost:4200/")
     .AllowAnyHeader()
     .AllowAnyMethod()));

var app = builder.Build();
app.MapControllers();
app.UseCors("frontend");
app.Run();
