using CelulaApp.DTOs;

namespace CelulaApp.Services.Interfaces;

public interface IMemberService
{
    Task<List<MemberResponse>> GetAllAsync();
    Task<MemberResponse?> GetByIdAsync(int id);
    Task<MemberResponse> CreateAsync(MemberRequest request);
    Task<MemberResponse?> UpdateAsync(int id, MemberRequest request);
    Task<bool> DeleteAsync(int id);
}
