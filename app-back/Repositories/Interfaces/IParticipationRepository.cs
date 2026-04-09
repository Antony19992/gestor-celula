using CelulaApp.Models;

namespace CelulaApp.Repositories.Interfaces;

public interface IParticipationRepository
{
    Task<List<Participation>> GetByMeetingIdAsync(int meetingId);
    Task<Participation?> GetAsync(int memberId, int meetingId);
    Task<Participation> AddAsync(Participation participation);
    Task<Participation> UpdateAsync(Participation participation);
}
