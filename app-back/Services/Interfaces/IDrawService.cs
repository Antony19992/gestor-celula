using CelulaApp.DTOs;

namespace CelulaApp.Services.Interfaces;

public interface IDrawService
{
    Task<DrawResultDto> DrawMemberAsync(int meetingId);
}
