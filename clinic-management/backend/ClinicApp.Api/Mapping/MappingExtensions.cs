using ClinicApp.Api.Domain.Entities;
using ClinicApp.Api.DTOs;

namespace ClinicApp.Api.Mapping;

public static class MappingExtensions
{
    public static PatientDto ToDto(this Patient p) =>
        new(p.Id, p.Name, p.MobileNumber, p.Age, p.Gender, p.VillageTownCity, p.CreatedAt);

    public static VisitDto ToDto(this PatientVisit v) =>
        new(
            v.Id,
            v.PatientId,
            v.Patient?.Name ?? string.Empty,
            v.Patient?.Age ?? 0,
            v.Patient?.VillageTownCity ?? string.Empty,
            v.DoctorId,
            v.Doctor?.Name ?? string.Empty,
            v.VisitDate,
            v.VisitTime,
            v.VisitType,
            v.ConsultationFee,
            v.AmountPaid,
            v.PaymentStatus,
            v.PaymentMethod,
            v.TokenNumber,
            v.VisitStatus,
            v.Notes);

    public static ClinicDto ToDto(this Clinic c) =>
        new(c.Id, c.Name, c.Address, c.Phone, c.DefaultConsultationFee, c.WorkingHours);

    public static AppointmentDto ToDto(this Appointment a) =>
        new(
            a.Id,
            a.PatientId,
            a.Patient?.Name ?? string.Empty,
            a.Patient?.MobileNumber,
            a.Patient?.Age ?? 0,
            a.Patient?.VillageTownCity ?? string.Empty,
            a.DoctorId,
            a.Doctor?.Name ?? string.Empty,
            a.ScheduledDate,
            a.ScheduledTime,
            a.Reason,
            a.Status);
}
