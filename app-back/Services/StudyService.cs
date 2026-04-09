using CelulaApp.DTOs;
using CelulaApp.Models;
using CelulaApp.Repositories.Interfaces;
using CelulaApp.Services.Interfaces;

namespace CelulaApp.Services;

public class StudyService : IStudyService
{
    private readonly IStudyRepository _repository;

    public StudyService(IStudyRepository repository) => _repository = repository;

    public async Task<List<StudyResponse>> GetAllAsync()
        => (await _repository.GetAllAsync()).Select(ToResponse).ToList();

    public async Task<StudyResponse?> GetByIdAsync(int id)
    {
        var study = await _repository.GetByIdAsync(id);
        return study is null ? null : ToResponse(study);
    }

    public async Task<StudyResponse> CreateAsync(StudyRequest request)
    {
        var study = new Study
        {
            Title = request.Title,
            Verse = request.Verse,
            Introduction = request.Introduction,
            Explanation = request.Explanation,
            Questions = request.Questions,
            ApplicationIndividual = request.ApplicationIndividual,
            ApplicationGroup = request.ApplicationGroup,
            PrayerTopics = request.PrayerTopics,
            Conclusion = request.Conclusion
        };
        return ToResponse(await _repository.AddAsync(study));
    }

    public async Task<StudyResponse?> UpdateAsync(int id, StudyRequest request)
    {
        var study = await _repository.GetByIdAsync(id);
        if (study is null) return null;

        study.Title = request.Title;
        study.Verse = request.Verse;
        study.Introduction = request.Introduction;
        study.Explanation = request.Explanation;
        study.Questions = request.Questions;
        study.ApplicationIndividual = request.ApplicationIndividual;
        study.ApplicationGroup = request.ApplicationGroup;
        study.PrayerTopics = request.PrayerTopics;
        study.Conclusion = request.Conclusion;

        return ToResponse(await _repository.UpdateAsync(study));
    }

    public Task<bool> DeleteAsync(int id) => _repository.DeleteAsync(id);

    private static StudyResponse ToResponse(Study s) => new(
        s.Id, s.Title, s.Verse, s.Introduction, s.Explanation,
        s.Questions, s.ApplicationIndividual, s.ApplicationGroup,
        s.PrayerTopics, s.Conclusion
    );
}
