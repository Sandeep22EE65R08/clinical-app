using ClinicApp.Api.Domain.Enums;

namespace ClinicApp.Api.Domain.Entities;

// A physical branch of the organization (Clinic). The organization stays the business /
// tenant; facilities are its locations.
public class Facility : BaseEntity
{
    public Guid ClinicId { get; set; }
    public Clinic? Clinic { get; set; }

    public string Name { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string? Phone { get; set; }
}

// Cardiology, Neurology, General Medicine ... inside one organization.
public class Department : BaseEntity
{
    public Guid ClinicId { get; set; }
    public Clinic? Clinic { get; set; }
    public Guid? FacilityId { get; set; }
    public Facility? Facility { get; set; }

    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;

    public ICollection<DoctorDepartment> Doctors { get; set; } = new List<DoctorDepartment>();
}

// Professional details of a doctor (User with Role = Doctor). Kept separate from the
// login account. VerificationStatus is only set to Verified by independent credential
// checks; a hospital admin editing the profile does NOT verify it.
public class DoctorProfile : BaseEntity
{
    public Guid UserId { get; set; }
    public User? User { get; set; }

    public string? Qualifications { get; set; }          // e.g. "MBBS, MD (General Medicine)"
    public string? CouncilRegistrationNumber { get; set; }
    public string? CouncilName { get; set; }             // e.g. "Bihar Medical Council"
    public int ExperienceYears { get; set; }
    public string? Bio { get; set; }
    public DoctorVerificationStatus VerificationStatus { get; set; } = DoctorVerificationStatus.Pending;
}

// Many-to-many: a doctor can work in several departments, a department has many doctors.
public class DoctorDepartment
{
    public Guid UserId { get; set; }
    public User? User { get; set; }
    public Guid DepartmentId { get; set; }
    public Department? Department { get; set; }
}
