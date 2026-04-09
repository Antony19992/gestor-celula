using CelulaApp.Data;
using CelulaApp.Models;
using CelulaApp.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace CelulaApp.Repositories;

public class MemberRepository : IMemberRepository
{
    private readonly AppDbContext _context;

    public MemberRepository(AppDbContext context) => _context = context;

    public async Task<List<Member>> GetAllAsync()
        => await _context.Members.ToListAsync();

    public async Task<Member?> GetByIdAsync(int id)
        => await _context.Members.FindAsync(id);

    public async Task<Member> AddAsync(Member member)
    {
        _context.Members.Add(member);
        await _context.SaveChangesAsync();
        return member;
    }

    public async Task<Member> UpdateAsync(Member member)
    {
        _context.Members.Update(member);
        await _context.SaveChangesAsync();
        return member;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var member = await _context.Members.FindAsync(id);
        if (member is null) return false;
        _context.Members.Remove(member);
        await _context.SaveChangesAsync();
        return true;
    }
}
