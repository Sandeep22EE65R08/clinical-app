using System.ComponentModel.DataAnnotations;
using ClinicApp.Api.Domain.Enums;

namespace ClinicApp.Api.DTOs;

public record CreatePatientRequest(
    [Required] string Name,
    string? MobileNumber,
    [Range(0, 130)] int Age,
    Gender Gender,
    [Required] string VillageTownCity);

public record UpdatePatientRequest(
    [Required] string Name,
    string? MobileNumber,
    [Range(0, 130)] int Age,
    Gender Gender,
    [Required] string VillageTownCity);

public record PatientDto(
    Guid Id,
    string Name,
    string? MobileNumber,
    int Age,
    Gender Gender,
    string VillageTownCity,
    DateTime CreatedAt);

// Summary used by patient history header.
public record PatientHistoryDto(
    PatientDto Patient,
    int VisitCount,
    DateOnly? LastVisitDate,
    decimal TotalPaid,
    decimal TotalPending,
    List<VisitDto> Visits);
