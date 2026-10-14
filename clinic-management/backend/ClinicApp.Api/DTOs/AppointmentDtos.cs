using System.ComponentModel.DataAnnotations;
using ClinicApp.Api.Domain.Enums;

namespace ClinicApp.Api.DTOs;

public record CreateAppointmentRequest(
    [Required] Guid PatientId,
    Guid? DoctorId,
    [Required] DateOnly ScheduledDate,
    [Required] TimeOnly ScheduledTime,
    string? Reason);

public record UpdateAppointmentStatusRequest(AppointmentStatus Status);

public record AppointmentDto(
    Guid Id,
    Guid PatientId,
    string PatientName,
    string? MobileNumber,
    int PatientAge,
    string VillageTownCity,
    Guid DoctorId,
    string DoctorName,
    DateOnly ScheduledDate,
    TimeOnly ScheduledTime,
    string? Reason,
    AppointmentStatus Status);
