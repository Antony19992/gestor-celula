using CelulaApp.Data;
using CelulaApp.Models;
using CelulaApp.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace CelulaApp.Repositories;

public class MeetingRepository : IMeetingRepository
{
    private readonly AppDbContext _context;

    public MeetingRepository(AppDbContext context) => _context = context;

    public async Task<List<Meeting>> GetAllAsync()
        => await _context.Meetings
            .Include(m => m.Study)
            .OrderByDescending(m => m.Date)
            .ToListAsync();

    public async Task<Meeting?> GetByIdAsync(int id)
        => await _context.Meetings.FindAsync(id);

    public async Task<Meeting?> GetByIdWithDetailsAsync(int id)
        => await _context.Meetings
            .Include(m => m.Study)
            .Include(m => m.Participations)
                .ThenInclude(p => p.Member)
            .FirstOrDefaultAsync(m => m.Id == id);

    public async Task<Meeting> AddAsync(Meeting meeting)
    {
        _context.Meetings.Add(meeting);
        await _context.SaveChangesAsync();
        return meeting;
    }

    public async Task<Meeting> UpdateAsync(Meeting meeting)
    {
        _context.Meetings.Update(meeting);
        await _context.SaveChangesAsync();
        return meeting;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var meeting = await _context.Meetings.FindAsync(id);
        if (meeting is null) return false;
        _context.Meetings.Remove(meeting);
        await _context.SaveChangesAsync();
        return true;
    }
}
