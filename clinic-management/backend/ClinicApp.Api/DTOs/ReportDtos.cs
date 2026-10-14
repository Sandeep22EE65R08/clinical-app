namespace ClinicApp.Api.DTOs;

public record ChartPoint(string Label, decimal Value);

public record DashboardDto(
    int PatientsToday,
    decimal CollectionToday,
    decimal PendingToday,
    int NewPatientsToday,
    List<ChartPoint> WeeklyPatients,
    List<ChartPoint> WeeklyRevenue,
    // Today's counts + trend deltas vs yesterday (percent; null when no prior data)
    int AppointmentsToday,
    int FollowUpsToday,
    int PendingPatients,
    double? PatientsDelta,
    double? CollectionDelta,
    double? AppointmentsDelta,
    double? FollowUpsDelta,
    // This-month quick stats + top locations (so every staff role sees them)
    int TotalPatients,
    decimal CollectionThisMonth,
    decimal AvgConsultationFee,
    int NewPatientsThisMonth,
    List<LocationStat> TopLocations,
    // 30-day daily trend series
    List<ChartPoint> MonthlyPatients,
    List<ChartPoint> MonthlyRevenue);

public record DailyReportDto(
    DateOnly Date,
    int Patients,
    decimal TotalCollection,
    decimal ConsultationFees,
    decimal FollowUpFees,
    decimal OtherFees,
    decimal Cash,
    decimal Upi,
    decimal Card,
    decimal Pending);

public record LocationStat(string VillageTownCity, int PatientCount);

public record AnalyticsDto(
    int TotalPatients,
    int NewPatientsThisMonth,
    int ReturningPatients,
    int PatientsToday,
    int PatientsThisWeek,
    int PatientsThisMonth,
    decimal RevenueThisMonth,
    decimal AverageConsultationFee,
    decimal CashTotal,
    decimal UpiTotal,
    decimal CardTotal,
    decimal PendingTotal,
    List<LocationStat> TopLocations,
    List<ChartPoint> MonthlyRevenue);

public record DoctorStat(
    Guid DoctorId,
    string DoctorName,
    int Patients,
    decimal Collection);

public record NotificationDto(
    string Type,
    string Severity,
    string Title,
    string Message,
    string? Link,
    DateTime CreatedAt);

public record NotificationsResponse(
    int UnreadCount,
    List<NotificationDto> Items);
