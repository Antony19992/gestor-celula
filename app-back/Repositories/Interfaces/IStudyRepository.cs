using CelulaApp.Models;

namespace CelulaApp.Repositories.Interfaces;

public interface IStudyRepository
{
    Task<List<Study>> GetAllAsync();
    Task<Study?> GetByIdAsync(int id);
    Task<Study> AddAsync(Study study);
    Task<Study> UpdateAsync(Study study);
    Task<bool> DeleteAsync(int id);
}
