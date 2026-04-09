using CelulaApp.DTOs;
using CelulaApp.Models;
using CelulaApp.Repositories.Interfaces;
using CelulaApp.Services.Interfaces;

namespace CelulaApp.Services;

public class MemberService : IMemberService
{
    private readonly IMemberRepository _repository;

    public MemberService(IMemberRepository repository) => _repository = repository;

    public async Task<List<MemberResponse>> GetAllAsync()
        => (await _repository.GetAllAsync()).Select(m => new MemberResponse(m.Id, m.Name)).ToList();

    public async Task<MemberResponse?> GetByIdAsync(int id)
    {
        var member = await _repository.GetByIdAsync(id);
        return member is null ? null : new MemberResponse(member.Id, member.Name);
    }

    public async Task<MemberResponse> CreateAsync(MemberRequest request)
    {
        var member = new Member { Name = request.Name };
        var created = await _repository.AddAsync(member);
        return new MemberResponse(created.Id, created.Name);
    }

    public async Task<MemberResponse?> UpdateAsync(int id, MemberRequest request)
    {
        var member = await _repository.GetByIdAsync(id);
        if (member is null) return null;
        member.Name = request.Name;
        var updated = await _repository.UpdateAsync(member);
        return new MemberResponse(updated.Id, updated.Name);
    }

    public Task<bool> DeleteAsync(int id) => _repository.DeleteAsync(id);
}
