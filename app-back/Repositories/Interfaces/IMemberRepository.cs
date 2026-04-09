using CelulaApp.Models;

namespace CelulaApp.Repositories.Interfaces;

public interface IMemberRepository
{
    Task<List<Member>> GetAllAsync();
    Task<Member?> GetByIdAsync(int id);
    Task<Member> AddAsync(Member member);
    Task<Member> UpdateAsync(Member member);
    Task<bool> DeleteAsync(int id);
}
