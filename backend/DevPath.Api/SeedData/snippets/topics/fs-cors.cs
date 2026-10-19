// Program.cs
builder.Services.AddCors(options => options.AddPolicy("frontend", policy =>
    policy.WithOrigins(builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()!)
          .AllowAnyHeader()
          .AllowAnyMethod()));

var app = builder.Build();
app.UseCors("frontend");     // before endpoints
app.MapControllers();

// appsettings.json
// "Cors": { "AllowedOrigins": [ "http://localhost:4200" ] }

// Browser error when the origin is missing:
// Access to XMLHttpRequest at 'http://localhost:5080/api/roadmap' from origin
// 'http://localhost:4200' has been blocked by CORS policy
