using ClinicApp.Api.DTOs;

namespace ClinicApp.Api.Services;

public interface IClinicService
{
    Task<ClinicDto?> GetAsync();
    Task<ClinicDto?> UpdateAsync(UpdateClinicRequest request);
}
