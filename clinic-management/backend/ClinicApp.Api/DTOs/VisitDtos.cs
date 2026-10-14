using System.ComponentModel.DataAnnotations;
using ClinicApp.Api.Domain.Enums;

namespace ClinicApp.Api.DTOs;

public record CreateVisitRequest(
    [Required] Guid PatientId,
    Guid? DoctorId,
    VisitType VisitType,
    [Range(0, 1000000)] decimal ConsultationFee,
    decimal AmountPaid,
    PaymentStatus PaymentStatus,
    PaymentMethod PaymentMethod,
    string? Notes);

// A quick "register + first visit" combined request for the fast flow.
public record QuickRegisterRequest(
    CreatePatientRequest Patient,
    Guid? DoctorId,
    VisitType VisitType,
    [Range(0, 1000000)] decimal ConsultationFee,
    decimal AmountPaid,
    PaymentStatus PaymentStatus,
    PaymentMethod PaymentMethod);

public record VisitDto(
    Guid Id,
    Guid PatientId,
    string PatientName,
    int PatientAge,
    string VillageTownCity,
    Guid DoctorId,
    string DoctorName,
    DateOnly VisitDate,
    TimeOnly VisitTime,
    VisitType VisitType,
    decimal ConsultationFee,
    decimal AmountPaid,
    PaymentStatus PaymentStatus,
    PaymentMethod PaymentMethod,
    int TokenNumber,
    VisitStatus VisitStatus,
    string? Notes);

public record UpdateVisitPaymentRequest(
    decimal AmountPaid,
    PaymentStatus PaymentStatus,
    PaymentMethod PaymentMethod);
