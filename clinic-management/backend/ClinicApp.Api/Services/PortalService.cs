using ClinicApp.Api.Domain.Entities;
using ClinicApp.Api.Domain.Enums;
using ClinicApp.Api.DTOs;
using ClinicApp.Api.Mapping;
using ClinicApp.Api.Repositories;
using ClinicApp.Api.Services.Sms;
using Microsoft.EntityFrameworkCore;

namespace ClinicApp.Api.Services;

public class PortalService : IPortalService
{
    private readonly IRepository<Patient> _patients;
    private readonly IRepository<User> _users;
    private readonly IRepository<Appointment> _appointments;
    private readonly IRepository<PatientVisit> _visits;
    private readonly ICurrentUserService _current;
    private readonly ISmsSender _sms;

    public PortalService(IRepository<Patient> patients, IRepository<User> users,
        IRepository<Appointment> appointments, IRepository<PatientVisit> visits,
        ICurrentUserService current, ISmsSender sms)
    {
        _patients = patients;
        _users = users;
        _appointments = appointments;
        _visits = visits;
        _current = current;
        _sms = sms;
    }

    private Guid PatientId => _current.PatientId;
    private Guid ClinicId => _current.ClinicId;

    public async Task<PortalProfileDto?> GetProfileAsync()
    {
        var p = await _patients.Query().Include(x => x.Clinic)
            .FirstOrDefaultAsync(x => x.Id == PatientId && x.ClinicId == ClinicId);
        if (p is null) return null;
        return new PortalProfileDto(p.Id, p.Name, p.MobileNumber, p.Age, p.Gender,
            p.VillageTownCity, p.Clinic?.Name ?? "Clinic", p.Clinic?.Phone, p.Clinic?.Address);
    }

    public async Task<List<PortalDoctorDto>> GetDoctorsAsync()
    {
        var docs = await _users.Query()
            .Where(u => u.ClinicId == ClinicId && u.Role == UserRole.Doctor && u.IsActive)
            .OrderBy(u => u.Name).ToListAsync();
        return docs.Select(d => new PortalDoctorDto(d.Id, d.Name, d.Specialization)).ToList();
    }

    public async Task<List<AppointmentDto>> GetAppointmentsAsync()
    {
        var list = await _appointments.Query()
            .Include(a => a.Patient).Include(a => a.Doctor)
            .Where(a => a.ClinicId == ClinicId && a.PatientId == PatientId)
            .OrderByDescending(a => a.ScheduledDate).ThenByDescending(a => a.ScheduledTime)
            .ToListAsync();
        return list.Select(a => a.ToDto()).ToList();
    }

    public async Task<AppointmentDto?> BookAppointmentAsync(BookAppointmentRequest r)
    {
        var patient = await _patients.Query().Include(x => x.Clinic)
            .FirstOrDefaultAsync(x => x.Id == PatientId && x.ClinicId == ClinicId);
        if (patient is null) return null;

        var doctorId = await ResolveDoctorAsync(r.DoctorId);
        if (doctorId == Guid.Empty) return null;

        var appt = new Appointment
        {
            ClinicId = ClinicId,
            PatientId = PatientId,
            DoctorId = doctorId,
            ScheduledDate = r.ScheduledDate,
            ScheduledTime = r.ScheduledTime,
            Reason = r.Reason,
            Status = AppointmentStatus.Scheduled
        };
        await _appointments.AddAsync(appt);
        await _appointments.SaveChangesAsync();

        var doctor = await _users.GetByIdAsync(doctorId);
        var loaded = await _appointments.Query()
            .Include(a => a.Patient).Include(a => a.Doctor)
            .FirstOrDefaultAsync(a => a.Id == appt.Id);

        if (!string.IsNullOrWhiteSpace(patient.MobileNumber))
            await _sms.SendAsync(patient.MobileNumber,
                $"Appointment booked with {doctor?.Name ?? "the doctor"} on " +
                $"{r.ScheduledDate:dd MMM yyyy} at {r.ScheduledTime:HH:mm}. - {patient.Clinic?.Name ?? "Clinic"}");

        return (loaded ?? appt).ToDto();
    }

    public async Task<bool> CancelAppointmentAsync(Guid appointmentId)
    {
        var appt = await _appointments.Query()
            .FirstOrDefaultAsync(a => a.Id == appointmentId &&
                a.ClinicId == ClinicId && a.PatientId == PatientId);
        if (appt is null) return false;
        appt.Status = AppointmentStatus.Cancelled;
        _appointments.Update(appt);
        await _appointments.SaveChangesAsync();
        return true;
    }

    public async Task<List<PortalVisitDto>> GetVisitsAsync()
    {
        var list = await _visits.Query().Include(v => v.Doctor)
            .Where(v => v.ClinicId == ClinicId && v.PatientId == PatientId)
            .OrderByDescending(v => v.VisitDate).ThenByDescending(v => v.VisitTime)
            .ToListAsync();
        return list.Select(v => new PortalVisitDto(v.Id, v.VisitDate, v.VisitTime,
            v.Doctor?.Name ?? string.Empty, v.VisitType, v.ConsultationFee,
            v.AmountPaid, v.PaymentStatus)).ToList();
    }

    public async Task<NotificationsResponse> GetNotificationsAsync()
    {
        var today = DateOnly.FromDateTime(DateTime.Now);
        var items = new List<NotificationDto>();

        var appts = await _appointments.Query().Include(a => a.Doctor)
            .Where(a => a.ClinicId == ClinicId && a.PatientId == PatientId)
            .ToListAsync();

        // Upcoming appointment reminders.
        foreach (var a in appts
                     .Where(a => a.ScheduledDate >= today && a.Status == AppointmentStatus.Scheduled)
                     .OrderBy(a => a.ScheduledDate).ThenBy(a => a.ScheduledTime))
        {
            var when = a.ScheduledDate == today ? "today" : a.ScheduledDate.ToString("dd MMM yyyy");
            items.Add(new NotificationDto("Appointment", "info",
                a.ScheduledDate == today ? "Appointment today" : "Upcoming appointment",
                $"With {a.Doctor?.Name ?? "the doctor"} {when} at {a.ScheduledTime:HH:mm}.",
                "/portal/appointments", DateTime.UtcNow));
        }

        var visits = await _visits.Query().Include(v => v.Doctor)
            .Where(v => v.ClinicId == ClinicId && v.PatientId == PatientId)
            .ToListAsync();

        // Pending payments on the patient's own visits.
        foreach (var v in visits.Where(v => v.PaymentStatus != PaymentStatus.Paid)
                     .OrderByDescending(v => v.VisitDate))
        {
            var due = Math.Max(0, v.ConsultationFee - v.AmountPaid);
            if (due <= 0) continue;
            items.Add(new NotificationDto("PendingPayment", "warning",
                "Pending payment",
                $"₹{Math.Round(due):#,##0} due for your visit on {v.VisitDate:dd MMM yyyy}.",
                "/portal/visits", DateTime.UtcNow));
        }

        // Follow-up reminder: recent visit but no upcoming appointment booked.
        var lastVisit = visits.OrderByDescending(v => v.VisitDate).FirstOrDefault();
        var hasUpcoming = appts.Any(a => a.ScheduledDate >= today &&
            a.Status == AppointmentStatus.Scheduled);
        if (lastVisit is not null && !hasUpcoming)
            items.Add(new NotificationDto("FollowUp", "info",
                "Follow-up reminder",
                $"Your last visit was on {lastVisit.VisitDate:dd MMM yyyy}. " +
                "Book a follow-up appointment if you still need care.",
                "/portal/book", DateTime.UtcNow));

        return new NotificationsResponse(items.Count(i => i.Severity == "warning"), items);
    }

    private async Task<Guid> ResolveDoctorAsync(Guid? requested)
    {
        if (requested.HasValue && requested.Value != Guid.Empty)
        {
            var ok = await _users.Query().AnyAsync(u => u.Id == requested.Value &&
                u.ClinicId == ClinicId && u.Role == UserRole.Doctor && u.IsActive);
            if (ok) return requested.Value;
        }
        var doctor = await _users.Query()
            .Where(u => u.ClinicId == ClinicId && u.Role == UserRole.Doctor && u.IsActive)
            .OrderBy(u => u.Name).FirstOrDefaultAsync();
        return doctor?.Id ?? Guid.Empty;
    }
}
