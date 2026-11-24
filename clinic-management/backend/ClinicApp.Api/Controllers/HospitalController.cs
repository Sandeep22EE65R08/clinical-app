using ClinicApp.Api.DTOs;
using ClinicApp.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ClinicApp.Api.Controllers;

// Hospital structure: branches, departments and doctor profiles. Admin only.
[ApiController]
[Route("api/hospital")]
[Authorize(Roles = "Admin")]
public class HospitalController : ControllerBase
{
    private readonly IHospitalService _svc;

    public HospitalController(IHospitalService svc) => _svc = svc;

    [HttpGet("facilities")]
    public async Task<ActionResult<List<FacilityDto>>> Facilities() => Ok(await _svc.GetFacilitiesAsync());

    [HttpPost("facilities")]
    public async Task<ActionResult<FacilityDto>> CreateFacility(SaveFacilityRequest r) =>
        Ok(await _svc.CreateFacilityAsync(r));

    [HttpDelete("facilities/{id:guid}")]
    public async Task<ActionResult> DeleteFacility(Guid id) =>
        await _svc.DeleteFacilityAsync(id) ? NoContent() : NotFound();

    [HttpGet("departments")]
    public async Task<ActionResult<List<DepartmentDto>>> Departments() => Ok(await _svc.GetDepartmentsAsync());

    [HttpPost("departments")]
    public async Task<ActionResult<DepartmentDto>> CreateDepartment(SaveDepartmentRequest r)
    {
        try { return Ok(await _svc.CreateDepartmentAsync(r)); }
        catch (InvalidOperationException ex) { return Conflict(new { message = ex.Message }); }
    }

    [HttpPut("departments/{id:guid}")]
    public async Task<ActionResult<DepartmentDto>> UpdateDepartment(Guid id, SaveDepartmentRequest r)
    {
        try
        {
            var d = await _svc.UpdateDepartmentAsync(id, r);
            return d is null ? NotFound() : Ok(d);
        }
        catch (InvalidOperationException ex) { return Conflict(new { message = ex.Message }); }
    }

    [HttpDelete("departments/{id:guid}")]
    public async Task<ActionResult> DeleteDepartment(Guid id) =>
        await _svc.DeleteDepartmentAsync(id) ? NoContent() : NotFound();

    [HttpPut("departments/{id:guid}/doctors")]
    public async Task<ActionResult<DepartmentDto>> AssignDoctors(Guid id, AssignDoctorsRequest r)
    {
        var d = await _svc.AssignDoctorsAsync(id, r.DoctorIds ?? new());
        return d is null ? NotFound() : Ok(d);
    }

    [HttpGet("doctors")]
    public async Task<ActionResult<List<DoctorProfileDto>>> Doctors() => Ok(await _svc.GetDoctorProfilesAsync());

    [HttpPut("doctors/{userId:guid}/profile")]
    public async Task<ActionResult<DoctorProfileDto>> SaveProfile(Guid userId, SaveDoctorProfileRequest r)
    {
        var p = await _svc.SaveDoctorProfileAsync(userId, r);
        return p is null ? NotFound() : Ok(p);
    }

    [HttpGet("department-report")]
    public async Task<ActionResult<List<DepartmentReportRow>>> DepartmentReport(
        [FromQuery] DateOnly? from, [FromQuery] DateOnly? to)
    {
        var start = from ?? new DateOnly(DateTime.Now.Year, DateTime.Now.Month, 1);
        var end = to ?? DateOnly.FromDateTime(DateTime.Now);
        return Ok(await _svc.GetDepartmentReportAsync(start, end));
    }
}
