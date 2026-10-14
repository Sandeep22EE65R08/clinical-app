using System.ComponentModel.DataAnnotations;
using ClinicApp.Api.Domain.Enums;

namespace ClinicApp.Api.DTOs;

public record LoginRequest(
    [Required] string Username,
    [Required] string Password);

// Self-service signup: creates a new clinic together with its first Admin user.
// When IncludeSampleData is true, the clinic starts with recent demo patients,
// doctors and visits so the dashboard/charts are populated for exploration.
public record RegisterClinicRequest(
    [Required] string ClinicName,
    [Required] string Address,
    string? Phone,
    [Required] string AdminName,
    [Required] string Username,
    [Required, MinLength(6)] string Password,
    bool IncludeSampleData = false);

public record AuthResponse(
    string Token,
    Guid UserId,
    string Name,
    string Username,
    UserRole Role,
    Guid ClinicId,
    string ClinicName);

public record CreateUserRequest(
    [Required] string Name,
    [Required] string Username,
    [Required, MinLength(6)] string Password,
    UserRole Role,
    string? Phone,
    decimal? ConsultationFee,
    string? Specialization);

public record UserDto(
    Guid Id,
    string Name,
    string Username,
    UserRole Role,
    string? Phone,
    decimal? ConsultationFee,
    string? Specialization,
    bool IsActive);

// ---- Patient portal auth ----

// Public clinic directory so a patient can pick their clinic when registering.
public record PublicClinicDto(Guid Id, string Name, string Address);

public record PatientRegisterRequest(
    [Required] Guid ClinicId,
    [Required] string Name,
    [Required] string MobileNumber,
    [Required, MinLength(4)] string Password,
    int Age,
    Gender Gender,
    string? VillageTownCity);

public record PatientLoginRequest(
    [Required] string MobileNumber,
    [Required] string Password);
