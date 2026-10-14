using System.Security.Claims;
using ClinicApp.Api.Domain.Enums;

namespace ClinicApp.Api.Services;

public class CurrentUserService : ICurrentUserService
{
    private readonly ClaimsPrincipal? _user;

    public CurrentUserService(IHttpContextAccessor accessor)
    {
        _user = accessor.HttpContext?.User;
    }

    public bool IsAuthenticated => _user?.Identity?.IsAuthenticated ?? false;

    public Guid UserId => GetGuid(ClaimTypes.NameIdentifier);
    public Guid ClinicId => GetGuid("clinicId");
    public Guid PatientId => GetGuid("patientId");

    public UserRole Role =>
        Enum.TryParse<UserRole>(_user?.FindFirstValue(ClaimTypes.Role), out var r) ? r : UserRole.Staff;

    private Guid GetGuid(string claim) =>
        Guid.TryParse(_user?.FindFirstValue(claim), out var g) ? g : Guid.Empty;
}
