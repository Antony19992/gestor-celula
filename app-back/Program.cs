using CelulaApp.Data;
using CelulaApp.Repositories;
using CelulaApp.Repositories.Interfaces;
using CelulaApp.Services;
using CelulaApp.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

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

// Database (SQLite)
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

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

// Criar banco automaticamente
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.EnsureCreated();
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