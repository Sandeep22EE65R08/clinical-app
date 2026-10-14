using ClinicApp.Api.DTOs;
using ClinicApp.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ClinicApp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "Staff")]
public class UsersController : ControllerBase
{
    private readonly IAuthService _auth;

    public UsersController(IAuthService auth) => _auth = auth;

    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<List<UserDto>>> GetAll() => Ok(await _auth.GetUsersAsync());

    [HttpGet("doctors")]
    public async Task<ActionResult<List<UserDto>>> GetDoctors() => Ok(await _auth.GetDoctorsAsync());

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<UserDto>> Create(CreateUserRequest request)
    {
        try
        {
            var user = await _auth.CreateUserAsync(request);
            return CreatedAtAction(nameof(GetAll), new { id = user.Id }, user);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
    }
}
