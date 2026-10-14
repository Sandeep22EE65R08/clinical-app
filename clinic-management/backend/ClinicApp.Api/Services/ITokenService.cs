using ClinicApp.Api.Domain.Entities;

namespace ClinicApp.Api.Services;

public interface ITokenService
{
    string CreateToken(User user, string clinicName);
    string CreatePatientToken(Patient patient, string clinicName);
}
