using ClinicApp.Api.Domain.Enums;

namespace ClinicApp.Api.DTOs;

public record QueueEntryDto(
    Guid VisitId,
    int TokenNumber,
    Guid PatientId,
    string PatientName,
    int PatientAge,
    string VillageTownCity,
    Guid DoctorId,
    string DoctorName,
    VisitStatus VisitStatus);

public record QueueStateDto(
    QueueEntryDto? NowServing,
    List<QueueEntryDto> Waiting,
    List<QueueEntryDto> Completed,
    int WaitingCount);
