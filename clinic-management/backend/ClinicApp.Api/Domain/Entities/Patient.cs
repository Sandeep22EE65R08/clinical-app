using ClinicApp.Api.Domain.Enums;

namespace ClinicApp.Api.Domain.Entities;

// Basic registration information only. Kept separate from medical notes so
// permissions can be controlled appropriately (see PatientVisit.Notes).
public class Patient : BaseEntity
{
    public Guid ClinicId { get; set; }
    public Clinic? Clinic { get; set; }

    public string Name { get; set; } = string.Empty;
    public string? MobileNumber { get; set; }
    public int Age { get; set; }
    public Gender Gender { get; set; }

    // Simple Indian-clinic address: Village / Town / City only.
    public string VillageTownCity { get; set; } = string.Empty;

    // Set only when the patient has self-registered for the patient portal.
    // Patients log in with their mobile number + this password.
    public string? PasswordHash { get; set; }

    public ICollection<PatientVisit> Visits { get; set; } = new List<PatientVisit>();
}
