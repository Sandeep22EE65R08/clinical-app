using ClinicApp.Api.Domain.Enums;

namespace ClinicApp.Api.Services;

public interface ICurrentUserService
{
    Guid UserId { get; }
    Guid ClinicId { get; }
    // Set only for patient-portal tokens; Guid.Empty for staff.
    Guid PatientId { get; }
    UserRole Role { get; }
    bool IsAuthenticated { get; }
}
