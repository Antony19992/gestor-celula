namespace CelulaApp.Models;

public class Member
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;

    public ICollection<Participation> Participations { get; set; } = new List<Participation>();
}
