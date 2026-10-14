using ClinicApp.Api.DTOs;
using ClinicApp.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ClinicApp.Api.Controllers;

[ApiController]
[Route("api")]
[Authorize(Policy = "Staff")]
public class ReportsController : ControllerBase
{
    private readonly IReportService _reports;

    public ReportsController(IReportService reports) => _reports = reports;

    [HttpGet("dashboard")]
    public async Task<ActionResult<DashboardDto>> Dashboard() => Ok(await _reports.GetDashboardAsync());

    [HttpGet("reports/daily")]
    public async Task<ActionResult<DailyReportDto>> Daily([FromQuery] DateOnly? date)
    {
        var d = date ?? DateOnly.FromDateTime(DateTime.Now);
        return Ok(await _reports.GetDailyReportAsync(d));
    }

    [HttpGet("reports/doctor-stats")]
    public async Task<ActionResult<List<DoctorStat>>> DoctorStats([FromQuery] DateOnly? date)
    {
        var d = date ?? DateOnly.FromDateTime(DateTime.Now);
        return Ok(await _reports.GetDoctorStatsAsync(d));
    }

    [HttpGet("analytics")]
    [Authorize(Roles = "Admin,Doctor")]
    public async Task<ActionResult<AnalyticsDto>> Analytics() => Ok(await _reports.GetAnalyticsAsync());

    [HttpGet("notifications")]
    public async Task<ActionResult<NotificationsResponse>> Notifications() =>
        Ok(await _reports.GetNotificationsAsync());
}
