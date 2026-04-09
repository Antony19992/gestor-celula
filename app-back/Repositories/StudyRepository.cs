using CelulaApp.Data;
using CelulaApp.Models;
using CelulaApp.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace CelulaApp.Repositories;

public class StudyRepository : IStudyRepository
{
    private readonly AppDbContext _context;

    public StudyRepository(AppDbContext context) => _context = context;

    public async Task<List<Study>> GetAllAsync()
        => await _context.Studies.ToListAsync();

    public async Task<Study?> GetByIdAsync(int id)
        => await _context.Studies.FindAsync(id);

    public async Task<Study> AddAsync(Study study)
    {
        _context.Studies.Add(study);
        await _context.SaveChangesAsync();
        return study;
    }

    public async Task<Study> UpdateAsync(Study study)
    {
        _context.Studies.Update(study);
        await _context.SaveChangesAsync();
        return study;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var study = await _context.Studies.FindAsync(id);
        if (study is null) return false;
        _context.Studies.Remove(study);
        await _context.SaveChangesAsync();
        return true;
    }
}
