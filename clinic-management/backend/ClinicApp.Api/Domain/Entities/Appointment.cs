using ClinicApp.Api.Domain.Enums;

namespace ClinicApp.Api.Domain.Entities;

// A scheduled visit. Separate from PatientVisit (which is the actual walk-in
// record + billing). An appointment can later be converted into a visit.
public class Appointment : BaseEntity
{
    public Guid ClinicId { get; set; }

    public Guid PatientId { get; set; }
    public Patient? Patient { get; set; }

    public Guid DoctorId { get; set; }
    public User? Doctor { get; set; }

    public DateOnly ScheduledDate { get; set; }
    public TimeOnly ScheduledTime { get; set; }

    public string? Reason { get; set; }

    public AppointmentStatus Status { get; set; } = AppointmentStatus.Scheduled;
}
