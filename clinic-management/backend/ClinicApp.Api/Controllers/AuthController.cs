using ClinicApp.Api.DTOs;
using ClinicApp.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ClinicApp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _auth;

    public AuthController(IAuthService auth) => _auth = auth;

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<ActionResult<AuthResponse>> Login(LoginRequest request)
    {
        var result = await _auth.LoginAsync(request);
        if (result is null) return Unauthorized(new { message = "Invalid username or password." });
        return Ok(result);
    }

    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<ActionResult<AuthResponse>> Register(RegisterClinicRequest request)
    {
        try
        {
            var result = await _auth.RegisterClinicAsync(request);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
    }

    // ---- Patient portal ----

    // Public clinic directory so patients can choose their clinic when signing up.
    [HttpGet("clinics")]
    [AllowAnonymous]
    public async Task<ActionResult<List<PublicClinicDto>>> Clinics() =>
        Ok(await _auth.GetPublicClinicsAsync());

    [HttpPost("patient/register")]
    [AllowAnonymous]
    public async Task<ActionResult<AuthResponse>> PatientRegister(PatientRegisterRequest request)
    {
        try
        {
            return Ok(await _auth.RegisterPatientAsync(request));
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
    }

    [HttpPost("patient/login")]
    [AllowAnonymous]
    public async Task<ActionResult<AuthResponse>> PatientLogin(PatientLoginRequest request)
    {
        var result = await _auth.PatientLoginAsync(request);
        if (result is null) return Unauthorized(new { message = "Invalid mobile number or password." });
        return Ok(result);
    }
}
