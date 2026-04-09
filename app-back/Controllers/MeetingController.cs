using CelulaApp.DTOs;
using CelulaApp.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace CelulaApp.Controllers;

[ApiController]
[Route("api/meeting")]
public class MeetingController : ControllerBase
{
    private readonly IMeetingService _meetingService;
    private readonly IDrawService _drawService;

    public MeetingController(IMeetingService meetingService, IDrawService drawService)
    {
        _meetingService = meetingService;
        _drawService = drawService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll() => Ok(await _meetingService.GetAllAsync());

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var result = await _meetingService.GetByIdAsync(id);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] MeetingRequest request)
    {
        try
        {
            var created = await _meetingService.CreateAsync(request);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Sorteia um membro para responder a próxima pergunta do encontro.
    /// Prioriza quem participou menos e evita repetição consecutiva.
    /// </summary>
    [HttpPost("{id:int}/draw-member")]
    public async Task<IActionResult> DrawMember(int id)
    {
        try
        {
            var result = await _drawService.DrawMemberAsync(id);
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }
}
