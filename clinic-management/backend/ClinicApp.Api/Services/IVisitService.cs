using ClinicApp.Api.Domain.Enums;
using ClinicApp.Api.DTOs;

namespace ClinicApp.Api.Services;

public interface IVisitService
{
    Task<VisitDto> CreateAsync(CreateVisitRequest request);
    Task<(PatientDto Patient, VisitDto Visit)> QuickRegisterAsync(QuickRegisterRequest request);
    Task<List<VisitDto>> GetTodayAsync(Guid? doctorId, PaymentStatus? paymentStatus, string? search);
    Task<VisitDto?> GetAsync(Guid id);
    Task<VisitDto?> UpdatePaymentAsync(Guid id, UpdateVisitPaymentRequest request);
}
