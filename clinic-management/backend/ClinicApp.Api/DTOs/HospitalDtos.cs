using System.ComponentModel.DataAnnotations;
using ClinicApp.Api.Domain.Enums;

namespace ClinicApp.Api.DTOs;

public record FacilityDto(Guid Id, string Name, string Address, string? Phone);
public record SaveFacilityRequest([Required] string Name, [Required] string Address, string? Phone);

public record DepartmentDto(
    Guid Id, string Name, string? Description, Guid? FacilityId, bool IsActive,
    int DoctorCount, List<Guid> DoctorIds);

public record SaveDepartmentRequest(
    [Required] string Name, string? Description, Guid? FacilityId, bool IsActive = true);

public record AssignDoctorsRequest(List<Guid> DoctorIds);

public record DoctorProfileDto(
    Guid UserId, string Name, string? Specialization, decimal? ConsultationFee,
    string? Qualifications, string? CouncilRegistrationNumber, string? CouncilName,
    int ExperienceYears, string? Bio, DoctorVerificationStatus VerificationStatus,
    List<Guid> DepartmentIds);

// Verification status is intentionally NOT part of this request: only an independent
// credential check may mark a doctor Verified.
public record SaveDoctorProfileRequest(
    string? Qualifications, string? CouncilRegistrationNumber, string? CouncilName,
    int ExperienceYears, string? Bio);

public record DepartmentReportRow(
    Guid? DepartmentId, string Department, int Doctors, int Visits, decimal Collection, decimal Pending);
