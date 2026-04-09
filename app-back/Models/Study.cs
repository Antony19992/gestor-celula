namespace CelulaApp.Models;

public class Study
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Verse { get; set; } = string.Empty;
    public string Introduction { get; set; } = string.Empty;
    public string Explanation { get; set; } = string.Empty;
    public List<string> Questions { get; set; } = new();
    public string ApplicationIndividual { get; set; } = string.Empty;
    public string ApplicationGroup { get; set; } = string.Empty;
    public List<string> PrayerTopics { get; set; } = new();
    public string Conclusion { get; set; } = string.Empty;

    public ICollection<Meeting> Meetings { get; set; } = new List<Meeting>();
}
