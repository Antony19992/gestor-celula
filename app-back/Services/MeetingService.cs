using CelulaApp.DTOs;
using CelulaApp.Models;
using CelulaApp.Repositories.Interfaces;
using CelulaApp.Services.Interfaces;

namespace CelulaApp.Services;

public class MeetingService : IMeetingService
{
    private readonly IMeetingRepository _meetingRepo;
    private readonly IStudyRepository _studyRepo;

    public MeetingService(IMeetingRepository meetingRepo, IStudyRepository studyRepo)
    {
        _meetingRepo = meetingRepo;
        _studyRepo = studyRepo;
    }

    public async Task<List<MeetingResponse>> GetAllAsync()
        => (await _meetingRepo.GetAllAsync())
            .Select(m => new MeetingResponse(m.Id, m.Date, m.StudyId, m.Study.Title, m.LastDrawnMemberId))
            .ToList();

    public async Task<MeetingDetailResponse?> GetByIdAsync(int id)
    {
        var meeting = await _meetingRepo.GetByIdWithDetailsAsync(id);
        if (meeting is null) return null;

        var participations = meeting.Participations
            .Select(p => new ParticipationResponse(p.MemberId, p.Member.Name, p.TimesSelected, p.TimesSpoken))
            .ToList();

        return new MeetingDetailResponse(
            meeting.Id, meeting.Date, meeting.StudyId,
            meeting.Study.Title, meeting.LastDrawnMemberId, participations
        );
    }

    public async Task<MeetingResponse> CreateAsync(MeetingRequest request)
    {
        var study = await _studyRepo.GetByIdAsync(request.StudyId)
            ?? throw new KeyNotFoundException($"Estudo com id {request.StudyId} não encontrado.");

        var meeting = new Meeting { Date = request.Date, StudyId = request.StudyId };
        var created = await _meetingRepo.AddAsync(meeting);

        return new MeetingResponse(created.Id, created.Date, created.StudyId, study.Title, null);
    }
}
