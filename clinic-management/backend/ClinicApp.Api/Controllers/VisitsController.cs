using ClinicApp.Api.Domain.Enums;
using ClinicApp.Api.DTOs;
using ClinicApp.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ClinicApp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "Staff")]
public class VisitsController : ControllerBase
{
    private readonly IVisitService _visits;
    private readonly ICurrentUserService _current;

    public VisitsController(IVisitService visits, ICurrentUserService current)
    {
        _visits = visits;
        _current = current;
    }

    [HttpGet("today")]
    public async Task<ActionResult<List<VisitDto>>> Today(
        [FromQuery] Guid? doctorId,
        [FromQuery] PaymentStatus? paymentStatus,
        [FromQuery] string? search)
    {
        var list = await _visits.GetTodayAsync(doctorId, paymentStatus, search);
        return Ok(Strip(list));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<VisitDto>> Get(Guid id)
    {
        var visit = await _visits.GetAsync(id);
        if (visit is null) return NotFound();
        return Ok(_current.Role == UserRole.Receptionist ? visit with { Notes = null } : visit);
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Receptionist,Doctor")]
    public async Task<ActionResult<VisitDto>> Create(CreateVisitRequest request)
    {
        var visit = await _visits.CreateAsync(request);
        return CreatedAtAction(nameof(Get), new { id = visit.Id }, visit);
    }

    [HttpPost("quick-register")]
    [Authorize(Roles = "Admin,Receptionist,Doctor")]
    public async Task<ActionResult> QuickRegister(QuickRegisterRequest request)
    {
        var (patient, visit) = await _visits.QuickRegisterAsync(request);
        return Ok(new { patient, visit });
    }

    [HttpPut("{id:guid}/payment")]
    [Authorize(Roles = "Admin,Receptionist")]
    public async Task<ActionResult<VisitDto>> UpdatePayment(Guid id, UpdateVisitPaymentRequest request)
    {
        var visit = await _visits.UpdatePaymentAsync(id, request);
        return visit is null ? NotFound() : Ok(visit);
    }

    private List<VisitDto> Strip(List<VisitDto> list) =>
        _current.Role == UserRole.Receptionist
            ? list.Select(v => v with { Notes = null }).ToList()
            : list;
}
