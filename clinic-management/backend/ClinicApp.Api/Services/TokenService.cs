using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using ClinicApp.Api.Domain.Entities;
using Microsoft.IdentityModel.Tokens;

namespace ClinicApp.Api.Services;

public class JwtSettings
{
    public string Key { get; set; } = string.Empty;
    public string Issuer { get; set; } = "ClinicApp";
    public string Audience { get; set; } = "ClinicApp";
    public int ExpiryHours { get; set; } = 12;
}

public class TokenService : ITokenService
{
    private readonly JwtSettings _settings;

    public TokenService(JwtSettings settings) => _settings = settings;

    public string CreateToken(User user, string clinicName)
    {
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(ClaimTypes.Name, user.Name),
            new(ClaimTypes.Role, user.Role.ToString()),
            new("clinicId", user.ClinicId.ToString()),
            new("clinicName", clinicName)
        };
        return Write(claims);
    }

    // Patient portal token: carries the Patient role and a patientId claim so
    // portal endpoints can scope every query to the logged-in patient only.
    public string CreatePatientToken(Patient patient, string clinicName)
    {
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, patient.Id.ToString()),
            new(ClaimTypes.Name, patient.Name),
            new(ClaimTypes.Role, Domain.Enums.UserRole.Patient.ToString()),
            new("patientId", patient.Id.ToString()),
            new("clinicId", patient.ClinicId.ToString()),
            new("clinicName", clinicName)
        };
        return Write(claims);
    }

    private string Write(List<Claim> claims)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_settings.Key));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _settings.Issuer,
            audience: _settings.Audience,
            claims: claims,
            expires: DateTime.UtcNow.AddHours(_settings.ExpiryHours),
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
