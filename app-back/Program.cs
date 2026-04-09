using System.Net;
using System.Net.Sockets;
using CelulaApp.Data;
using CelulaApp.Repositories;
using CelulaApp.Repositories.Interfaces;
using CelulaApp.Services;
using CelulaApp.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using Npgsql;

var builder = WebApplication.CreateBuilder(args);

// Controllers
builder.Services.AddControllers();

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// CORS (liberado para MVP)
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy
            .AllowAnyOrigin()
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

// Database (PostgreSQL) — resolve para IPv4 para evitar falha em ambientes sem IPv6 (ex: Render)
var rawCs = builder.Configuration.GetConnectionString("DefaultConnection")!;
var csBuilder = new NpgsqlConnectionStringBuilder(rawCs);
var ipv4 = Dns.GetHostAddresses(csBuilder.Host!)
    .FirstOrDefault(a => a.AddressFamily == AddressFamily.InterNetwork);
if (ipv4 is not null) csBuilder.Host = ipv4.ToString();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(csBuilder.ConnectionString));

// Repositories
builder.Services.AddScoped<IStudyRepository, StudyRepository>();
builder.Services.AddScoped<IMemberRepository, MemberRepository>();
builder.Services.AddScoped<IMeetingRepository, MeetingRepository>();
builder.Services.AddScoped<IParticipationRepository, ParticipationRepository>();

// Services
builder.Services.AddScoped<IStudyService, StudyService>();
builder.Services.AddScoped<IMemberService, MemberService>();
builder.Services.AddScoped<IMeetingService, MeetingService>();
builder.Services.AddScoped<IDrawService, DrawService>();

var app = builder.Build();

// Aplicar migrations automaticamente ao iniciar
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
}

// Swagger sempre ativo (MVP)
app.UseSwagger();
app.UseSwaggerUI();

// Middlewares
app.UseCors();
app.UseAuthorization();

// Endpoints
app.MapControllers();

// Run (Render usa porta dinâmica automaticamente via Docker)
app.Run();