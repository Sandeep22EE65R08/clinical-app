using ClinicApp.Api.DTOs;
using ClinicApp.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ClinicApp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "Staff")]
public class ClinicController : ControllerBase
{
    private readonly IClinicService _clinic;

    public ClinicController(IClinicService clinic) => _clinic = clinic;

    [HttpGet]
    public async Task<ActionResult<ClinicDto>> Get()
    {
        var clinic = await _clinic.GetAsync();
        return clinic is null ? NotFound() : Ok(clinic);
    }

    [HttpPut]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ClinicDto>> Update(UpdateClinicRequest request)
    {
        var clinic = await _clinic.UpdateAsync(request);
        return clinic is null ? NotFound() : Ok(clinic);
    }
}
