namespace CelulaApp.DTOs;

public record MeetingRequest(DateTime Date, int StudyId);

public record MeetingResponse(
    int Id,
    DateTime Date,
    int StudyId,
    string StudyTitle,
    int? LastDrawnMemberId
);

public record ParticipationResponse(
    int MemberId,
    string MemberName,
    int TimesSelected,
    int TimesSpoken
);

public record MeetingDetailResponse(
    int Id,
    DateTime Date,
    int StudyId,
    string StudyTitle,
    int? LastDrawnMemberId,
    List<ParticipationResponse> Participations
);
