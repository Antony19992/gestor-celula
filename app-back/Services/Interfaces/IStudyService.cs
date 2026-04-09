using CelulaApp.DTOs;

namespace CelulaApp.Services.Interfaces;

public interface IStudyService
{
    Task<List<StudyResponse>> GetAllAsync();
    Task<StudyResponse?> GetByIdAsync(int id);
    Task<StudyResponse> CreateAsync(StudyRequest request);
    Task<StudyResponse?> UpdateAsync(int id, StudyRequest request);
    Task<bool> DeleteAsync(int id);
}
