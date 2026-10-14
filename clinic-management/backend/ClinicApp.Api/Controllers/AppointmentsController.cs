using ClinicApp.Api.DTOs;
using ClinicApp.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ClinicApp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "Staff")]
public class AppointmentsController : ControllerBase
{
    private readonly IAppointmentService _appointments;

    public AppointmentsController(IAppointmentService appointments) => _appointments = appointments;

    // Range view (daily/weekly/calendar). Defaults to today if no range supplied.
    [HttpGet]
    public async Task<ActionResult<List<AppointmentDto>>> GetRange(
        [FromQuery] DateOnly? from,
        [FromQuery] DateOnly? to,
        [FromQuery] Guid? doctorId)
    {
        var start = from ?? DateOnly.FromDateTime(DateTime.Now);
        var end = to ?? start;
        return Ok(await _appointments.GetRangeAsync(start, end, doctorId));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<AppointmentDto>> Get(Guid id)
    {
        var appointment = await _appointments.GetAsync(id);
        return appointment is null ? NotFound() : Ok(appointment);
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Receptionist,Doctor")]
    public async Task<ActionResult<AppointmentDto>> Create(CreateAppointmentRequest request)
    {
        var appointment = await _appointments.CreateAsync(request);
        return CreatedAtAction(nameof(Get), new { id = appointment.Id }, appointment);
    }

    [HttpPut("{id:guid}/status")]
    [Authorize(Roles = "Admin,Receptionist,Doctor")]
    public async Task<ActionResult<AppointmentDto>> UpdateStatus(Guid id, UpdateAppointmentStatusRequest request)
    {
        var appointment = await _appointments.UpdateStatusAsync(id, request);
        return appointment is null ? NotFound() : Ok(appointment);
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin,Receptionist")]
    public async Task<ActionResult> Delete(Guid id)
    {
        var ok = await _appointments.DeleteAsync(id);
        return ok ? NoContent() : NotFound();
    }
}
