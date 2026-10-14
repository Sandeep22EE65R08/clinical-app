using System.ComponentModel.DataAnnotations;
using ClinicApp.Api.Domain.Enums;

namespace ClinicApp.Api.DTOs;

// Patient portal DTOs. Deliberately exclude any clinic-wide or clinical data
// (other patients, revenue, doctor's private notes, etc.).

public record PortalProfileDto(
    Guid Id,
    string Name,
    string? MobileNumber,
    int Age,
    Gender Gender,
    string VillageTownCity,
    string ClinicName,
    string? ClinicPhone,
    string? ClinicAddress);

// Doctor directory only: name + specialization so the patient can choose.
public record PortalDoctorDto(Guid Id, string Name, string? Specialization);

public record BookAppointmentRequest(
    Guid? DoctorId,
    [Required] DateOnly ScheduledDate,
    [Required] TimeOnly ScheduledTime,
    string? Reason);

// Patient's own visit history, without doctor's private medical notes.
public record PortalVisitDto(
    Guid Id,
    DateOnly VisitDate,
    TimeOnly VisitTime,
    string DoctorName,
    VisitType VisitType,
    decimal ConsultationFee,
    decimal AmountPaid,
    PaymentStatus PaymentStatus);
