using ClinicApp.Api.DTOs;
using ClinicApp.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ClinicApp.Api.Controllers;

// Public endpoints for patients looking for care. No authentication, no patient data.
[ApiController]
[AllowAnonymous]
[Route("api/[controller]")]
public class DiscoverController : ControllerBase
{
    private readonly IDiscoveryService _discovery;

    public DiscoverController(IDiscoveryService discovery) => _discovery = discovery;

    [HttpGet("symptoms")]
    public ActionResult<List<SymptomDto>> Symptoms() => Ok(_discovery.GetSymptoms());

    // symptoms = comma separated symptom ids, text = optional free text (English/Hindi),
    // location = village/town/city matched against the clinic address.
    [HttpGet("search")]
    public async Task<ActionResult<DiscoverResultDto>> Search(
        [FromQuery] string? symptoms, [FromQuery] string? text, [FromQuery] string? location) =>
        Ok(await _discovery.SearchAsync(symptoms, text, location));
}
