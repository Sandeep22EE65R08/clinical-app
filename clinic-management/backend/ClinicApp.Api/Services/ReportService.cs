using ClinicApp.Api.Domain.Entities;
using ClinicApp.Api.Domain.Enums;
using ClinicApp.Api.DTOs;
using ClinicApp.Api.Repositories;
using Microsoft.EntityFrameworkCore;

namespace ClinicApp.Api.Services;

public class ReportService : IReportService
{
    private readonly IRepository<PatientVisit> _visits;
    private readonly IRepository<Patient> _patients;
    private readonly IRepository<User> _users;
    private readonly IRepository<Appointment> _appointments;
    private readonly ICurrentUserService _current;

    public ReportService(IRepository<PatientVisit> visits, IRepository<Patient> patients,
        IRepository<User> users, IRepository<Appointment> appointments, ICurrentUserService current)
    {
        _visits = visits;
        _patients = patients;
        _users = users;
        _appointments = appointments;
        _current = current;
    }

    private IQueryable<PatientVisit> ClinicVisits =>
        _visits.Query().Where(v => v.ClinicId == _current.ClinicId);

    private static double? Delta(decimal current, decimal previous) =>
        previous == 0 ? null : (double)Math.Round((current - previous) / previous * 100, 1);

    public async Task<DashboardDto> GetDashboardAsync()
    {
        var today = DateOnly.FromDateTime(DateTime.Now);
        var yesterday = today.AddDays(-1);
        var monthStart = new DateOnly(today.Year, today.Month, 1);
        var windowStart = today.AddDays(-29);

        // Single query for the whole 30-day window (also covers today/yesterday).
        var windowVisits = await ClinicVisits
            .Where(v => v.VisitDate >= windowStart && v.VisitDate <= today)
            .ToListAsync();
        var byDay = windowVisits.GroupBy(v => v.VisitDate)
            .ToDictionary(g => g.Key, g => g.ToList());

        List<PatientVisit> Day(DateOnly d) => byDay.TryGetValue(d, out var l) ? l : new List<PatientVisit>();

        var todays = Day(today);
        var yesterdays = Day(yesterday);

        // Appointments today/yesterday for count + delta.
        var apptWindow = await _appointments.Query()
            .Where(a => a.ClinicId == _current.ClinicId &&
                        a.ScheduledDate >= yesterday && a.ScheduledDate <= today)
            .ToListAsync();
        var apptToday = apptWindow.Count(a => a.ScheduledDate == today);
        var apptYesterday = apptWindow.Count(a => a.ScheduledDate == yesterday);

        var followToday = todays.Count(v => v.VisitType == VisitType.FollowUp);
        var followYesterday = yesterdays.Count(v => v.VisitType == VisitType.FollowUp);

        var pendingPatients = todays
            .Where(v => v.PaymentStatus != PaymentStatus.Paid)
            .Select(v => v.PatientId).Distinct().Count();

        // 7-day and 30-day trend series from the same in-memory buckets.
        var weeklyPatients = new List<ChartPoint>();
        var weeklyRevenue = new List<ChartPoint>();
        for (var i = 6; i >= 0; i--)
        {
            var day = today.AddDays(-i);
            var dv = Day(day);
            var label = day.ToString("dd MMM");
            weeklyPatients.Add(new ChartPoint(label, dv.Count));
            weeklyRevenue.Add(new ChartPoint(label, dv.Sum(v => v.AmountPaid)));
        }

        var monthlyPatients = new List<ChartPoint>();
        var monthlyRevenue = new List<ChartPoint>();
        for (var i = 29; i >= 0; i--)
        {
            var day = today.AddDays(-i);
            var dv = Day(day);
            var label = day.ToString("dd MMM");
            monthlyPatients.Add(new ChartPoint(label, dv.Count));
            monthlyRevenue.Add(new ChartPoint(label, dv.Sum(v => v.AmountPaid)));
        }

        // This-month quick stats.
        var todayStartUtc = DateTime.SpecifyKind(DateTime.UtcNow.Date, DateTimeKind.Utc);
        var monthStartUtc = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1, 0, 0, 0, DateTimeKind.Utc);
        var newPatients = await _patients.Query()
            .CountAsync(p => p.ClinicId == _current.ClinicId && p.CreatedAt >= todayStartUtc);
        var newThisMonth = await _patients.Query()
            .CountAsync(p => p.ClinicId == _current.ClinicId && p.CreatedAt >= monthStartUtc);
        var totalPatients = await _patients.Query()
            .CountAsync(p => p.ClinicId == _current.ClinicId);

        var monthVisits = await ClinicVisits.Where(v => v.VisitDate >= monthStart).ToListAsync();
        var collectionThisMonth = monthVisits.Sum(v => v.AmountPaid);
        var avgFee = monthVisits.Count > 0 ? Math.Round(monthVisits.Average(v => v.ConsultationFee), 2) : 0;

        var locations = await _patients.Query()
            .Where(p => p.ClinicId == _current.ClinicId)
            .Select(p => p.VillageTownCity)
            .ToListAsync();
        var topLocations = locations
            .GroupBy(l => l)
            .Select(g => new LocationStat(g.Key, g.Count()))
            .OrderByDescending(x => x.PatientCount)
            .Take(10)
            .ToList();

        return new DashboardDto(
            todays.Count,
            todays.Sum(v => v.AmountPaid),
            todays.Sum(v => Math.Max(0, v.ConsultationFee - v.AmountPaid)),
            newPatients,
            weeklyPatients,
            weeklyRevenue,
            apptToday,
            followToday,
            pendingPatients,
            Delta(todays.Count, yesterdays.Count),
            Delta(todays.Sum(v => v.AmountPaid), yesterdays.Sum(v => v.AmountPaid)),
            Delta(apptToday, apptYesterday),
            Delta(followToday, followYesterday),
            totalPatients,
            collectionThisMonth,
            avgFee,
            newThisMonth,
            topLocations,
            monthlyPatients,
            monthlyRevenue);
    }

    public async Task<DailyReportDto> GetDailyReportAsync(DateOnly date)
    {
        var v = await ClinicVisits.Where(x => x.VisitDate == date).ToListAsync();
        decimal FeeByType(VisitType t) => v.Where(x => x.VisitType == t).Sum(x => x.AmountPaid);
        decimal ByMethod(PaymentMethod m) => v.Where(x => x.PaymentMethod == m).Sum(x => x.AmountPaid);

        return new DailyReportDto(
            date,
            v.Count,
            v.Sum(x => x.AmountPaid),
            FeeByType(VisitType.NewConsultation),
            FeeByType(VisitType.FollowUp),
            FeeByType(VisitType.Other) + FeeByType(VisitType.Emergency),
            ByMethod(PaymentMethod.Cash),
            ByMethod(PaymentMethod.Upi),
            ByMethod(PaymentMethod.Card),
            v.Sum(x => Math.Max(0, x.ConsultationFee - x.AmountPaid)));
    }

    public async Task<AnalyticsDto> GetAnalyticsAsync()
    {
        var today = DateOnly.FromDateTime(DateTime.Now);
        var weekStart = today.AddDays(-6);
        var monthStart = new DateOnly(DateTime.Now.Year, DateTime.Now.Month, 1);
        var all = await ClinicVisits.ToListAsync();
        var totalPatients = await _patients.Query().CountAsync(p => p.ClinicId == _current.ClinicId);

        var patientsToday = all.Where(v => v.VisitDate == today).Select(v => v.PatientId).Distinct().Count();
        var patientsThisWeek = all.Where(v => v.VisitDate >= weekStart).Select(v => v.PatientId).Distinct().Count();
        var patientsThisMonth = all.Where(v => v.VisitDate >= monthStart).Select(v => v.PatientId).Distinct().Count();

        var monthStartUtc = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1, 0, 0, 0, DateTimeKind.Utc);
        var newThisMonth = await _patients.Query()
            .CountAsync(p => p.ClinicId == _current.ClinicId &&
                             p.CreatedAt >= monthStartUtc);

        var returning = all.GroupBy(v => v.PatientId).Count(g => g.Count() > 1);

        var monthVisits = all.Where(v => v.VisitDate >= monthStart).ToList();
        var avgFee = all.Count > 0 ? all.Average(v => v.ConsultationFee) : 0;

        var locations = await _patients.Query()
            .Where(p => p.ClinicId == _current.ClinicId)
            .Select(p => p.VillageTownCity)
            .ToListAsync();
        var topLocations = locations
            .GroupBy(l => l)
            .Select(g => new LocationStat(g.Key, g.Count()))
            .OrderByDescending(x => x.PatientCount)
            .Take(10)
            .ToList();

        var monthlyRevenue = new List<ChartPoint>();
        for (var i = 5; i >= 0; i--)
        {
            var m = DateTime.Now.AddMonths(-i);
            var from = new DateOnly(m.Year, m.Month, 1);
            var to = from.AddMonths(1);
            var rev = all.Where(v => v.VisitDate >= from && v.VisitDate < to).Sum(v => v.AmountPaid);
            monthlyRevenue.Add(new ChartPoint(m.ToString("MMM yy"), rev));
        }

        return new AnalyticsDto(
            totalPatients,
            newThisMonth,
            returning,
            patientsToday,
            patientsThisWeek,
            patientsThisMonth,
            monthVisits.Sum(v => v.AmountPaid),
            Math.Round(avgFee, 2),
            all.Where(v => v.PaymentMethod == PaymentMethod.Cash).Sum(v => v.AmountPaid),
            all.Where(v => v.PaymentMethod == PaymentMethod.Upi).Sum(v => v.AmountPaid),
            all.Where(v => v.PaymentMethod == PaymentMethod.Card).Sum(v => v.AmountPaid),
            all.Sum(v => Math.Max(0, v.ConsultationFee - v.AmountPaid)),
            topLocations,
            monthlyRevenue);
    }

    private static string Rupee(decimal n) => "₹" + Math.Round(n).ToString("#,##0");

    public async Task<NotificationsResponse> GetNotificationsAsync()
    {
        var today = DateOnly.FromDateTime(DateTime.Now);
        var items = new List<NotificationDto>();

        var todays = await ClinicVisits.Include(v => v.Patient)
            .Where(v => v.VisitDate == today).ToListAsync();

        // Unpaid / partially paid visits today.
        foreach (var v in todays.Where(v => v.PaymentStatus != PaymentStatus.Paid)
                     .OrderByDescending(v => v.CreatedAt))
        {
            var due = Math.Max(0, v.ConsultationFee - v.AmountPaid);
            items.Add(new NotificationDto(
                "PendingPayment", "warning",
                $"Pending payment · Token #{v.TokenNumber}",
                $"{v.Patient?.Name ?? "Patient"} owes {Rupee(due)} for today's visit.",
                "/payments", v.CreatedAt));
        }

        // Total outstanding across the clinic.
        var allVisits = await ClinicVisits.ToListAsync();
        var outstanding = allVisits.Sum(v => Math.Max(0, v.ConsultationFee - v.AmountPaid));
        if (outstanding > 0)
            items.Add(new NotificationDto(
                "OutstandingTotal", "info",
                "Outstanding payments",
                $"Total pending across all visits: {Rupee(outstanding)}.",
                "/reports", DateTime.UtcNow));

        // Appointment reminders (today) and upcoming (tomorrow).
        var appts = await _appointments.Query()
            .Include(a => a.Patient)
            .Where(a => a.ClinicId == _current.ClinicId &&
                        a.ScheduledDate >= today && a.ScheduledDate <= today.AddDays(1))
            .OrderBy(a => a.ScheduledTime)
            .ToListAsync();

        var todaysAppts = appts.Where(a => a.ScheduledDate == today &&
            (a.Status == AppointmentStatus.Scheduled || a.Status == AppointmentStatus.Waiting)).ToList();
        if (todaysAppts.Count > 0)
            items.Add(new NotificationDto(
                "Appointment", "info",
                $"{todaysAppts.Count} appointment(s) today",
                $"Next: {todaysAppts[0].Patient?.Name ?? "Patient"} at " +
                $"{todaysAppts[0].ScheduledTime:HH:mm}.",
                "/appointments", DateTime.UtcNow));

        foreach (var a in appts.Where(a => a.ScheduledDate == today.AddDays(1) &&
                     a.Status == AppointmentStatus.Scheduled))
            items.Add(new NotificationDto(
                "Appointment", "info",
                "Upcoming appointment",
                $"{a.Patient?.Name ?? "Patient"} tomorrow at {a.ScheduledTime:HH:mm}.",
                "/appointments", DateTime.UtcNow));

        // No-show appointments today.
        foreach (var a in appts.Where(a => a.ScheduledDate == today &&
                     a.Status == AppointmentStatus.NoShow))
            items.Add(new NotificationDto(
                "NoShow", "warning",
                "No-show appointment",
                $"{a.Patient?.Name ?? "Patient"} missed the {a.ScheduledTime:HH:mm} slot.",
                "/appointments", DateTime.UtcNow));

        // Follow-up reminders: patients whose last visit was a follow-up due soon.
        var followUps = allVisits
            .Where(v => v.VisitType == VisitType.FollowUp && v.VisitDate == today)
            .Select(v => v.PatientId).Distinct().Count();
        if (followUps > 0)
            items.Add(new NotificationDto(
                "FollowUp", "info",
                "Follow-up visits today",
                $"{followUps} patient(s) came in for follow-up today.",
                "/today", DateTime.UtcNow));

        // Daily summary.
        items.Add(new NotificationDto(
            "DailySummary", "info",
            "Today's summary",
            $"{todays.Select(v => v.PatientId).Distinct().Count()} patients · " +
            $"{Rupee(todays.Sum(v => v.AmountPaid))} collected.",
            "/", DateTime.UtcNow));

        return new NotificationsResponse(
            items.Count(i => i.Severity == "warning"),
            items);
    }

    public async Task<List<DoctorStat>> GetDoctorStatsAsync(DateOnly date)
    {
        var visits = await ClinicVisits.Include(v => v.Doctor)
            .Where(v => v.VisitDate == date).ToListAsync();
        return visits
            .GroupBy(v => new { v.DoctorId, Name = v.Doctor!.Name })
            .Select(g => new DoctorStat(g.Key.DoctorId, g.Key.Name, g.Count(), g.Sum(v => v.AmountPaid)))
            .OrderByDescending(x => x.Collection)
            .ToList();
    }
}
