using ClinicApp.Api.Domain.Entities;
using ClinicApp.Api.Domain.Enums;
using ClinicApp.Api.DTOs;
using ClinicApp.Api.Mapping;
using ClinicApp.Api.Repositories;
using Microsoft.EntityFrameworkCore;

namespace ClinicApp.Api.Services;

public class PatientService : IPatientService
{
    private readonly IRepository<Patient> _patients;
    private readonly IRepository<PatientVisit> _visits;
    private readonly ICurrentUserService _current;

    public PatientService(IRepository<Patient> patients, IRepository<PatientVisit> visits,
        ICurrentUserService current)
    {
        _patients = patients;
        _visits = visits;
        _current = current;
    }

    public async Task<PatientDto> CreateAsync(CreatePatientRequest r)
    {
        var patient = new Patient
        {
            ClinicId = _current.ClinicId,
            Name = r.Name.Trim(),
            MobileNumber = string.IsNullOrWhiteSpace(r.MobileNumber) ? null : r.MobileNumber.Trim(),
            Age = r.Age,
            Gender = r.Gender,
            VillageTownCity = r.VillageTownCity.Trim()
        };
        await _patients.AddAsync(patient);
        await _patients.SaveChangesAsync();
        return patient.ToDto();
    }

    public async Task<PatientDto?> UpdateAsync(Guid id, UpdatePatientRequest r)
    {
        var patient = await _patients.Query()
            .FirstOrDefaultAsync(p => p.Id == id && p.ClinicId == _current.ClinicId);
        if (patient is null) return null;

        patient.Name = r.Name.Trim();
        patient.MobileNumber = string.IsNullOrWhiteSpace(r.MobileNumber) ? null : r.MobileNumber.Trim();
        patient.Age = r.Age;
        patient.Gender = r.Gender;
        patient.VillageTownCity = r.VillageTownCity.Trim();
        _patients.Update(patient);
        await _patients.SaveChangesAsync();
        return patient.ToDto();
    }

    public async Task<PatientDto?> GetAsync(Guid id)
    {
        var patient = await _patients.Query()
            .FirstOrDefaultAsync(p => p.Id == id && p.ClinicId == _current.ClinicId);
        return patient?.ToDto();
    }

    public async Task<List<PatientDto>> SearchAsync(string? query)
    {
        var q = _patients.Query().Where(p => p.ClinicId == _current.ClinicId);
        if (!string.IsNullOrWhiteSpace(query))
        {
            var term = query.Trim().ToLower();
            q = q.Where(p =>
                p.Name.ToLower().Contains(term) ||
                (p.MobileNumber != null && p.MobileNumber.Contains(term)) ||
                p.VillageTownCity.ToLower().Contains(term));
        }
        var list = await q.OrderByDescending(p => p.CreatedAt).Take(100).ToListAsync();
        return list.Select(p => p.ToDto()).ToList();
    }

    public async Task<PatientHistoryDto?> GetHistoryAsync(Guid id)
    {
        var patient = await _patients.Query()
            .FirstOrDefaultAsync(p => p.Id == id && p.ClinicId == _current.ClinicId);
        if (patient is null) return null;

        var visits = await _visits.Query()
            .Include(v => v.Doctor)
            .Include(v => v.Patient)
            .Where(v => v.PatientId == id)
            .OrderByDescending(v => v.VisitDate).ThenByDescending(v => v.VisitTime)
            .ToListAsync();

        var totalPaid = visits.Sum(v => v.AmountPaid);
        var totalPending = visits.Sum(v => v.ConsultationFee - v.AmountPaid);
        DateOnly? last = visits.Count > 0 ? visits.Max(v => v.VisitDate) : null;

        return new PatientHistoryDto(
            patient.ToDto(),
            visits.Count,
            last,
            totalPaid,
            totalPending < 0 ? 0 : totalPending,
            visits.Select(v => v.ToDto()).ToList());
    }

    public async Task<PatientDto?> FindExistingAsync(string? mobile, string? name, int? age)
    {
        var q = _patients.Query().Where(p => p.ClinicId == _current.ClinicId);
        Patient? match = null;
        if (!string.IsNullOrWhiteSpace(mobile))
            match = await q.FirstOrDefaultAsync(p => p.MobileNumber == mobile.Trim());
        if (match is null && !string.IsNullOrWhiteSpace(name) && age.HasValue)
        {
            var term = name.Trim().ToLower();
            match = await q.FirstOrDefaultAsync(p => p.Name.ToLower() == term && p.Age == age.Value);
        }
        return match?.ToDto();
    }
}
