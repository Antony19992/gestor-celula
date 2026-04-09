namespace CelulaApp.Models;

public class Participation
{
    public int MemberId { get; set; }
    public Member Member { get; set; } = null!;

    public int MeetingId { get; set; }
    public Meeting Meeting { get; set; } = null!;

    /// <summary>Quantas vezes este membro foi sorteado neste encontro.</summary>
    public int TimesSelected { get; set; }

    /// <summary>Quantas vezes este membro falou neste encontro.</summary>
    public int TimesSpoken { get; set; }
}
