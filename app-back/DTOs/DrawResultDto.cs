namespace CelulaApp.DTOs;

public record DrawResultDto(
    int MemberId,
    string MemberName,
    int TimesSelectedInThisMeeting
);
