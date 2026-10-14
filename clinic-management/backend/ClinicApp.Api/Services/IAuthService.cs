using ClinicApp.Api.DTOs;

namespace ClinicApp.Api.Services;

public interface IAuthService
{
    Task<AuthResponse?> LoginAsync(LoginRequest request);
    Task<AuthResponse> RegisterClinicAsync(RegisterClinicRequest request);
    Task<UserDto> CreateUserAsync(CreateUserRequest request);
    Task<List<UserDto>> GetUsersAsync();
    Task<List<UserDto>> GetDoctorsAsync();

    // Patient portal
    Task<List<PublicClinicDto>> GetPublicClinicsAsync();
    Task<AuthResponse> RegisterPatientAsync(PatientRegisterRequest request);
    Task<AuthResponse?> PatientLoginAsync(PatientLoginRequest request);
}
