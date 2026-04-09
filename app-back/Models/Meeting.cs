namespace CelulaApp.Models;

public class Meeting
{
    public int Id { get; set; }
    public DateTime Date { get; set; }
    public int StudyId { get; set; }
    public Study Study { get; set; } = null!;

    /// <summary>Último membro sorteado — usado para evitar repetição consecutiva.</summary>
    public int? LastDrawnMemberId { get; set; }

    public ICollection<Participation> Participations { get; set; } = new List<Participation>();
}
