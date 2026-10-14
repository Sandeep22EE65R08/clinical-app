using ClinicApp.Api.DTOs;

namespace ClinicApp.Api.Services;

// All methods are implicitly scoped to the logged-in patient (via the
// patientId claim) and their clinic. Patients can never read other patients'
// data or any clinic-wide/clinical information.
public interface IPortalService
{
    Task<PortalProfileDto?> GetProfileAsync();
    Task<List<PortalDoctorDto>> GetDoctorsAsync();
    Task<List<AppointmentDto>> GetAppointmentsAsync();
    Task<AppointmentDto?> BookAppointmentAsync(BookAppointmentRequest request);
    Task<bool> CancelAppointmentAsync(Guid appointmentId);
    Task<List<PortalVisitDto>> GetVisitsAsync();
    Task<NotificationsResponse> GetNotificationsAsync();
}
