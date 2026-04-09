using CelulaApp.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using System.Text.Json;

namespace CelulaApp.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Study> Studies => Set<Study>();
    public DbSet<Member> Members => Set<Member>();
    public DbSet<Meeting> Meetings => Set<Meeting>();
    public DbSet<Participation> Participations => Set<Participation>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        var listConverter = new ValueConverter<List<string>, string>(
            v => JsonSerializer.Serialize(v, (JsonSerializerOptions?)null),
            v => JsonSerializer.Deserialize<List<string>>(v, (JsonSerializerOptions?)null) ?? new List<string>()
        );

        modelBuilder.Entity<Study>(entity =>
        {
            entity.Property(e => e.Questions)
                .HasConversion(listConverter)
                .HasColumnType("TEXT");

            entity.Property(e => e.PrayerTopics)
                .HasConversion(listConverter)
                .HasColumnType("TEXT");
        });

        modelBuilder.Entity<Meeting>(entity =>
        {
            entity.HasOne(e => e.Study)
                .WithMany(s => s.Meetings)
                .HasForeignKey(e => e.StudyId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Participation>(entity =>
        {
            entity.HasKey(e => new { e.MemberId, e.MeetingId });

            entity.HasOne(e => e.Member)
                .WithMany(m => m.Participations)
                .HasForeignKey(e => e.MemberId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Meeting)
                .WithMany(m => m.Participations)
                .HasForeignKey(e => e.MeetingId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
