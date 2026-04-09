namespace CelulaApp.DTOs;

public record MemberRequest(string Name);

public record MemberResponse(int Id, string Name);
