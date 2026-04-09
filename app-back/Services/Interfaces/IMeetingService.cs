using CelulaApp.DTOs;

namespace CelulaApp.Services.Interfaces;

public interface IMeetingService
{
    Task<List<MeetingResponse>> GetAllAsync();
    Task<MeetingDetailResponse?> GetByIdAsync(int id);
    Task<MeetingResponse> CreateAsync(MeetingRequest request);
}
