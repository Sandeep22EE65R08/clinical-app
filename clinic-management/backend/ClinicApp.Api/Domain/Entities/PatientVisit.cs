using ClinicApp.Api.Domain.Enums;

namespace ClinicApp.Api.Domain.Entities;

// Each visit is stored separately and carries billing + optional medical notes.
public class PatientVisit : BaseEntity
{
    public Guid ClinicId { get; set; }

    public Guid PatientId { get; set; }
    public Patient? Patient { get; set; }

    public Guid DoctorId { get; set; }
    public User? Doctor { get; set; }

    public DateOnly VisitDate { get; set; }
    public TimeOnly VisitTime { get; set; }

    public VisitType VisitType { get; set; } = VisitType.NewConsultation;
    public decimal ConsultationFee { get; set; }
    public decimal AmountPaid { get; set; }

    public PaymentStatus PaymentStatus { get; set; } = PaymentStatus.Pending;
    public PaymentMethod PaymentMethod { get; set; } = PaymentMethod.Cash;

    // Daily token number, scoped per clinic per day.
    public int TokenNumber { get; set; }

    // Live queue state used by the token / queue board.
    public VisitStatus VisitStatus { get; set; } = VisitStatus.Waiting;

    // Doctor-only medical notes. Not exposed to receptionists.
    public string? Notes { get; set; }
}
