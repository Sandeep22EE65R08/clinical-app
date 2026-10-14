using ClinicApp.Api.DTOs;
using ClinicApp.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ClinicApp.Api.Controllers;

// Patient-facing portal. Every endpoint is restricted to the Patient role and
// scoped to the logged-in patient inside the service layer.
[ApiController]
[Route("api/portal")]
[Authorize(Policy = "Patient")]
public class PortalController : ControllerBase
{
    private readonly IPortalService _portal;

    public PortalController(IPortalService portal) => _portal = portal;

    [HttpGet("me")]
    public async Task<ActionResult<PortalProfileDto>> Me()
    {
        var profile = await _portal.GetProfileAsync();
        return profile is null ? NotFound() : Ok(profile);
    }

    [HttpGet("doctors")]
    public async Task<ActionResult<List<PortalDoctorDto>>> Doctors() =>
        Ok(await _portal.GetDoctorsAsync());

    [HttpGet("appointments")]
    public async Task<ActionResult<List<AppointmentDto>>> Appointments() =>
        Ok(await _portal.GetAppointmentsAsync());

    [HttpPost("appointments")]
    public async Task<ActionResult<AppointmentDto>> Book(BookAppointmentRequest request)
    {
        var appt = await _portal.BookAppointmentAsync(request);
        return appt is null
            ? BadRequest(new { message = "Could not book appointment. No doctor is available." })
            : Ok(appt);
    }

    [HttpPut("appointments/{id:guid}/cancel")]
    public async Task<ActionResult> Cancel(Guid id)
    {
        var ok = await _portal.CancelAppointmentAsync(id);
        return ok ? NoContent() : NotFound();
    }

    [HttpGet("visits")]
    public async Task<ActionResult<List<PortalVisitDto>>> Visits() =>
        Ok(await _portal.GetVisitsAsync());

    [HttpGet("notifications")]
    public async Task<ActionResult<NotificationsResponse>> Notifications() =>
        Ok(await _portal.GetNotificationsAsync());
}
