using ClinicApp.Api.DTOs;

namespace ClinicApp.Api.Services;

public interface IQueueService
{
    Task<QueueStateDto> GetStateAsync(Guid? doctorId);
    Task<QueueStateDto> CallNextAsync(Guid? doctorId);
    Task<QueueStateDto> SkipAsync(Guid visitId, Guid? doctorId);
    Task<QueueStateDto> CompleteAsync(Guid visitId, Guid? doctorId);
    Task<QueueStateDto> RequeueAsync(Guid visitId, Guid? doctorId);
}
