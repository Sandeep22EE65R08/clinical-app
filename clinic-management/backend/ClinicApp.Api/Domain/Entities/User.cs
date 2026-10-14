using ClinicApp.Api.Domain.Enums;

namespace ClinicApp.Api.Domain.Entities;

// Represents any staff account: Admin, Doctor, Receptionist, Nurse, Staff.
public class User : BaseEntity
{
    public Guid ClinicId { get; set; }
    public Clinic? Clinic { get; set; }

    public string Name { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public UserRole Role { get; set; } = UserRole.Receptionist;

    public string? Phone { get; set; }
    // Doctor-specific: default consultation fee and specialization.
    public decimal? ConsultationFee { get; set; }
    public string? Specialization { get; set; }

    public bool IsActive { get; set; } = true;

    public ICollection<PatientVisit> Visits { get; set; } = new List<PatientVisit>();
}
