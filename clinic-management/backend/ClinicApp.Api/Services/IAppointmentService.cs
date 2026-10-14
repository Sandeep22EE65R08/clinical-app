using ClinicApp.Api.DTOs;

namespace ClinicApp.Api.Services;

public interface IAppointmentService
{
    Task<AppointmentDto> CreateAsync(CreateAppointmentRequest request);
    Task<List<AppointmentDto>> GetRangeAsync(DateOnly from, DateOnly to, Guid? doctorId);
    Task<AppointmentDto?> GetAsync(Guid id);
    Task<AppointmentDto?> UpdateStatusAsync(Guid id, UpdateAppointmentStatusRequest request);
    Task<bool> DeleteAsync(Guid id);
}
