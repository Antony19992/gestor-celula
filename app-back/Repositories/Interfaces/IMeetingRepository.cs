using CelulaApp.Models;

namespace CelulaApp.Repositories.Interfaces;

public interface IMeetingRepository
{
    Task<List<Meeting>> GetAllAsync();
    Task<Meeting?> GetByIdAsync(int id);
    Task<Meeting?> GetByIdWithDetailsAsync(int id);
    Task<Meeting> AddAsync(Meeting meeting);
    Task<Meeting> UpdateAsync(Meeting meeting);
    Task<bool> DeleteAsync(int id);
}
