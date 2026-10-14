using ClinicApp.Api.Domain.Entities;
using ClinicApp.Api.Domain.Enums;
using ClinicApp.Api.DTOs;
using ClinicApp.Api.Mapping;
using ClinicApp.Api.Repositories;
using Microsoft.EntityFrameworkCore;

namespace ClinicApp.Api.Services;

public class VisitService : IVisitService
{
    private readonly IRepository<PatientVisit> _visits;
    private readonly IRepository<Patient> _patients;
    private readonly IRepository<User> _users;
    private readonly IPatientService _patientService;
    private readonly ICurrentUserService _current;

    public VisitService(IRepository<PatientVisit> visits, IRepository<Patient> patients,
        IRepository<User> users, IPatientService patientService, ICurrentUserService current)
    {
        _visits = visits;
        _patients = patients;
        _users = users;
        _patientService = patientService;
        _current = current;
    }

    public async Task<VisitDto> CreateAsync(CreateVisitRequest r)
    {
        var doctorId = await ResolveDoctorAsync(r.DoctorId);
        var today = DateOnly.FromDateTime(DateTime.Now);
        var token = await NextTokenAsync(today);

        var visit = new PatientVisit
        {
            ClinicId = _current.ClinicId,
            PatientId = r.PatientId,
            DoctorId = doctorId,
            VisitDate = today,
            VisitTime = TimeOnly.FromDateTime(DateTime.Now),
            VisitType = r.VisitType,
            ConsultationFee = r.ConsultationFee,
            AmountPaid = r.AmountPaid,
            PaymentStatus = r.PaymentStatus,
            PaymentMethod = r.PaymentMethod,
            TokenNumber = token,
            Notes = r.Notes
        };
        await _visits.AddAsync(visit);
        await _visits.SaveChangesAsync();
        return await LoadDtoAsync(visit.Id) ?? visit.ToDto();
    }

    public async Task<(PatientDto Patient, VisitDto Visit)> QuickRegisterAsync(QuickRegisterRequest r)
    {
        var patient = await _patientService.CreateAsync(r.Patient);
        var visit = await CreateAsync(new CreateVisitRequest(
            patient.Id, r.DoctorId, r.VisitType, r.ConsultationFee,
            r.AmountPaid, r.PaymentStatus, r.PaymentMethod, null));
        return (patient, visit);
    }

    public async Task<List<VisitDto>> GetTodayAsync(Guid? doctorId, PaymentStatus? paymentStatus, string? search)
    {
        var today = DateOnly.FromDateTime(DateTime.Now);
        var q = _visits.Query()
            .Include(v => v.Patient)
            .Include(v => v.Doctor)
            .Where(v => v.ClinicId == _current.ClinicId && v.VisitDate == today);

        if (doctorId.HasValue) q = q.Where(v => v.DoctorId == doctorId.Value);
        if (paymentStatus.HasValue) q = q.Where(v => v.PaymentStatus == paymentStatus.Value);
        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            q = q.Where(v => v.Patient!.Name.ToLower().Contains(term) ||
                             v.Patient!.VillageTownCity.ToLower().Contains(term));
        }

        var list = await q.OrderBy(v => v.TokenNumber).ToListAsync();
        return list.Select(v => v.ToDto()).ToList();
    }

    public async Task<VisitDto?> GetAsync(Guid id) => await LoadDtoAsync(id);

    public async Task<VisitDto?> UpdatePaymentAsync(Guid id, UpdateVisitPaymentRequest r)
    {
        var visit = await _visits.Query()
            .FirstOrDefaultAsync(v => v.Id == id && v.ClinicId == _current.ClinicId);
        if (visit is null) return null;

        visit.AmountPaid = r.AmountPaid;
        visit.PaymentStatus = r.PaymentStatus;
        visit.PaymentMethod = r.PaymentMethod;
        _visits.Update(visit);
        await _visits.SaveChangesAsync();
        return await LoadDtoAsync(id);
    }

    private async Task<VisitDto?> LoadDtoAsync(Guid id)
    {
        var visit = await _visits.Query()
            .Include(v => v.Patient)
            .Include(v => v.Doctor)
            .FirstOrDefaultAsync(v => v.Id == id && v.ClinicId == _current.ClinicId);
        return visit?.ToDto();
    }

    private async Task<int> NextTokenAsync(DateOnly date)
    {
        var count = await _visits.Query()
            .CountAsync(v => v.ClinicId == _current.ClinicId && v.VisitDate == date);
        return count + 1;
    }

    private async Task<Guid> ResolveDoctorAsync(Guid? requested)
    {
        if (requested.HasValue && requested.Value != Guid.Empty) return requested.Value;
        if (_current.Role == UserRole.Doctor) return _current.UserId;

        var doctor = await _users.Query()
            .Where(u => u.ClinicId == _current.ClinicId && u.Role == UserRole.Doctor && u.IsActive)
            .OrderBy(u => u.Name)
            .FirstOrDefaultAsync();
        return doctor?.Id ?? _current.UserId;
    }
}
