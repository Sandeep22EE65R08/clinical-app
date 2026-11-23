using System.ComponentModel.DataAnnotations;

namespace ClinicApp.Api.DTOs;

public record ClinicDto(
    Guid Id,
    string Name,
    string Address,
    string? Phone,
    decimal DefaultConsultationFee,
    string? WorkingHours,
    bool IsListedPublicly);

public record UpdateClinicRequest(
    [Required] string Name,
    [Required] string Address,
    string? Phone,
    decimal DefaultConsultationFee,
    string? WorkingHours,
    bool IsListedPublicly = true);
