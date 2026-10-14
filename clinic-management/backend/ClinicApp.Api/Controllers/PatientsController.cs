using ClinicApp.Api.Domain.Enums;
using ClinicApp.Api.DTOs;
using ClinicApp.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ClinicApp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "Staff")]
public class PatientsController : ControllerBase
{
    private readonly IPatientService _patients;
    private readonly ICurrentUserService _current;

    public PatientsController(IPatientService patients, ICurrentUserService current)
    {
        _patients = patients;
        _current = current;
    }

    [HttpGet]
    public async Task<ActionResult<List<PatientDto>>> Search([FromQuery] string? q)
        => Ok(await _patients.SearchAsync(q));

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<PatientDto>> Get(Guid id)
    {
        var patient = await _patients.GetAsync(id);
        return patient is null ? NotFound() : Ok(patient);
    }

    [HttpGet("{id:guid}/history")]
    public async Task<ActionResult<PatientHistoryDto>> History(Guid id)
    {
        var history = await _patients.GetHistoryAsync(id);
        if (history is null) return NotFound();
        // Receptionists must not see doctor-only medical notes.
        if (_current.Role == UserRole.Receptionist)
            history = history with { Visits = history.Visits.Select(v => v with { Notes = null }).ToList() };
        return Ok(history);
    }

    [HttpGet("find-existing")]
    public async Task<ActionResult<PatientDto>> FindExisting(
        [FromQuery] string? mobile, [FromQuery] string? name, [FromQuery] int? age)
    {
        var patient = await _patients.FindExistingAsync(mobile, name, age);
        return patient is null ? NotFound() : Ok(patient);
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Receptionist,Doctor")]
    public async Task<ActionResult<PatientDto>> Create(CreatePatientRequest request)
    {
        var patient = await _patients.CreateAsync(request);
        return CreatedAtAction(nameof(Get), new { id = patient.Id }, patient);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin,Receptionist,Doctor")]
    public async Task<ActionResult<PatientDto>> Update(Guid id, UpdatePatientRequest request)
    {
        var patient = await _patients.UpdateAsync(id, request);
        return patient is null ? NotFound() : Ok(patient);
    }
}
