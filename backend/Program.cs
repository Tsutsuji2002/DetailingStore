using System.Text;
using System.Threading.RateLimiting;
using DetailingStore.Api.Data;
using DetailingStore.Api.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

void LoadEnvFile(string filePath)
{
    if (!File.Exists(filePath)) return;
    foreach (var line in File.ReadAllLines(filePath))
    {
        var trimmed = line.Trim();
        if (string.IsNullOrWhiteSpace(trimmed) || trimmed.StartsWith("#")) continue;
        var parts = trimmed.Split('=', 2);
        if (parts.Length == 2)
        {
            var key = parts[0].Trim();
            var val = parts[1].Trim().Trim('"', '\'');
            Environment.SetEnvironmentVariable(key, val);
        }
    }
}

var currentDir = Directory.GetCurrentDirectory();
LoadEnvFile(Path.Combine(currentDir, ".env.development"));
LoadEnvFile(Path.Combine(currentDir, ".env.local"));
LoadEnvFile(Path.Combine(currentDir, ".env"));

var builder = WebApplication.CreateBuilder(args);
builder.Configuration.AddEnvironmentVariables();

// 1. Add Controllers support
builder.Services.AddControllers();

// 2. Configure EF Core with PostgreSQL (Npgsql)
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// 3. Register Dependency Injection Services
builder.Services.AddScoped<IJwtTokenService, JwtTokenService>();
builder.Services.AddScoped<IGoogleAuthService, GoogleAuthService>();

// 4. Configure JWT Bearer Authentication
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSettings["SecretKey"] ?? "DetailingStore_Super_Secret_Jwt_Security_Key_2026_Key_Must_Be_32_Bytes_Long!";
var issuer = jwtSettings["Issuer"] ?? "DetailingStoreApi";
var audience = jwtSettings["Audience"] ?? "DetailingStoreApp";

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = issuer,
        ValidAudience = audience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey)),
        ClockSkew = TimeSpan.Zero
    };
});

// 5. Configure CORS Policy to connect with React Frontend
var allowFrontendOrigin = "AllowReactFrontend";
builder.Services.AddCors(options =>
{
    options.AddPolicy(name: allowFrontendOrigin, policy =>
    {
        policy.WithOrigins(
            "http://localhost:3000",
            "https://localhost:3000",
            "http://localhost:5173",
            "https://localhost:5173"
        )
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials();
    });
});

// 5.5 Configure Rate Limiting for security
builder.Services.AddRateLimiter(options =>
{
    options.AddFixedWindowLimiter("login_limit", opt =>
    {
        opt.PermitLimit = 5;
        opt.Window = TimeSpan.FromMinutes(1);
        opt.QueueLimit = 0;
    });
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
});

// 6. Add Swagger / OpenAPI Documentation with JWT Bearer Token Support
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo { Title = "Detailing Store API", Version = "v1" });

    // Cấu hình Nút Authorize trong Swagger UI cho Bearer JWT
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Nhập Token theo dạng: Bearer {token}"
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

// 7. Apply Database Migrations & Seed data automatically on startup
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var dbContext = services.GetRequiredService<AppDbContext>();
        if (dbContext.Database.IsRelational())
        {
            await dbContext.Database.MigrateAsync();
        }
        await DbInitializer.SeedAsync(dbContext);
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogWarning(ex, "Note: Could not connect to PostgreSQL instance to auto-migrate. Ensure PostgreSQL is running.");
    }
}

// 8. Enable Swagger UI in Development
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Detailing Store API v1");
        c.RoutePrefix = "swagger"; // Giao diện Swagger tại http://localhost:5080/swagger
    });
}

// 9. Enable Static Files, CORS & Authentication / Authorization Middlewares
app.UseStaticFiles();
app.UseCors(allowFrontendOrigin);
app.UseRateLimiter();

app.UseAuthentication();
app.UseAuthorization();

// 10. Map Controllers
app.MapControllers();

app.Run();
