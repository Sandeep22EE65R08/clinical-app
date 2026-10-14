using ClinicApp.Api.DTOs;

namespace ClinicApp.Api.Services;

public interface IPatientService
{
    Task<PatientDto> CreateAsync(CreatePatientRequest request);
    Task<PatientDto?> UpdateAsync(Guid id, UpdatePatientRequest request);
    Task<PatientDto?> GetAsync(Guid id);
    Task<List<PatientDto>> SearchAsync(string? query);
    Task<PatientHistoryDto?> GetHistoryAsync(Guid id);
    // Existing-patient detection by mobile or name+age.
    Task<PatientDto?> FindExistingAsync(string? mobile, string? name, int? age);
}
