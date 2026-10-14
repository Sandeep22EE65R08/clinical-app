using ClinicApp.Api.DTOs;

namespace ClinicApp.Api.Services;

public interface IReportService
{
    Task<DashboardDto> GetDashboardAsync();
    Task<DailyReportDto> GetDailyReportAsync(DateOnly date);
    Task<AnalyticsDto> GetAnalyticsAsync();
    Task<List<DoctorStat>> GetDoctorStatsAsync(DateOnly date);
    Task<NotificationsResponse> GetNotificationsAsync();
}
