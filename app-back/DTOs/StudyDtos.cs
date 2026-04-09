namespace CelulaApp.DTOs;

public record StudyRequest(
    string Title,
    string Verse,
    string Introduction,
    string Explanation,
    List<string> Questions,
    string ApplicationIndividual,
    string ApplicationGroup,
    List<string> PrayerTopics,
    string Conclusion
);

public record StudyResponse(
    int Id,
    string Title,
    string Verse,
    string Introduction,
    string Explanation,
    List<string> Questions,
    string ApplicationIndividual,
    string ApplicationGroup,
    List<string> PrayerTopics,
    string Conclusion
);
