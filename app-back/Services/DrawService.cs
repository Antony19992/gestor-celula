using CelulaApp.DTOs;
using CelulaApp.Models;
using CelulaApp.Repositories.Interfaces;
using CelulaApp.Services.Interfaces;

namespace CelulaApp.Services;

public class DrawService : IDrawService
{
    private readonly IParticipationRepository _participationRepo;
    private readonly IMemberRepository _memberRepo;
    private readonly IMeetingRepository _meetingRepo;
    private readonly Random _random = new();

    public DrawService(
        IParticipationRepository participationRepo,
        IMemberRepository memberRepo,
        IMeetingRepository meetingRepo)
    {
        _participationRepo = participationRepo;
        _memberRepo = memberRepo;
        _meetingRepo = meetingRepo;
    }

    public async Task<DrawResultDto> DrawMemberAsync(int meetingId)
    {
        var meeting = await _meetingRepo.GetByIdAsync(meetingId)
            ?? throw new KeyNotFoundException($"Encontro {meetingId} não encontrado.");

        var allMembers = await _memberRepo.GetAllAsync();
        if (allMembers.Count == 0)
            throw new InvalidOperationException("Nenhum membro cadastrado.");

        var participations = await _participationRepo.GetByMeetingIdAsync(meetingId);

        // Monta contagem de vezes sorteado por membro neste encontro
        var selectionCount = allMembers.ToDictionary(
            m => m.Id,
            m => participations.FirstOrDefault(p => p.MemberId == m.Id)?.TimesSelected ?? 0
        );

        // Exclui o último sorteado para evitar repetição consecutiva
        // (exceto se só houver um membro)
        var candidates = allMembers.ToList();
        if (meeting.LastDrawnMemberId.HasValue && candidates.Count > 1)
            candidates = candidates.Where(m => m.Id != meeting.LastDrawnMemberId.Value).ToList();

        // Prioriza quem participou menos (menor TimesSelected)
        var minSelections = candidates.Min(m => selectionCount[m.Id]);
        var leastSelected = candidates.Where(m => selectionCount[m.Id] == minSelections).ToList();

        // Sorteio aleatório entre os menos selecionados
        var selected = leastSelected[_random.Next(leastSelected.Count)];

        // Atualiza ou cria participação
        var participation = participations.FirstOrDefault(p => p.MemberId == selected.Id);
        if (participation is null)
        {
            participation = new Participation
            {
                MemberId = selected.Id,
                MeetingId = meetingId,
                TimesSelected = 1,
                TimesSpoken = 0
            };
            await _participationRepo.AddAsync(participation);
        }
        else
        {
            participation.TimesSelected++;
            await _participationRepo.UpdateAsync(participation);
        }

        // Registra último sorteado no encontro
        meeting.LastDrawnMemberId = selected.Id;
        await _meetingRepo.UpdateAsync(meeting);

        return new DrawResultDto(selected.Id, selected.Name, participation.TimesSelected);
    }
}
