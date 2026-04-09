using CelulaApp.Data;
using CelulaApp.Models;
using CelulaApp.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace CelulaApp.Repositories;

public class ParticipationRepository : IParticipationRepository
{
    private readonly AppDbContext _context;

    public ParticipationRepository(AppDbContext context) => _context = context;

    public async Task<List<Participation>> GetByMeetingIdAsync(int meetingId)
        => await _context.Participations
            .Include(p => p.Member)
            .Where(p => p.MeetingId == meetingId)
            .ToListAsync();

    public async Task<Participation?> GetAsync(int memberId, int meetingId)
        => await _context.Participations.FindAsync(memberId, meetingId);

    public async Task<Participation> AddAsync(Participation participation)
    {
        _context.Participations.Add(participation);
        await _context.SaveChangesAsync();
        return participation;
    }

    public async Task<Participation> UpdateAsync(Participation participation)
    {
        _context.Participations.Update(participation);
        await _context.SaveChangesAsync();
        return participation;
    }
}
