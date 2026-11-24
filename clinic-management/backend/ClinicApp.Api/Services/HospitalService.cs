using ClinicApp.Api.Data;
using ClinicApp.Api.Domain.Entities;
using ClinicApp.Api.Domain.Enums;
using ClinicApp.Api.DTOs;
using Microsoft.EntityFrameworkCore;

namespace ClinicApp.Api.Services;

public interface IHospitalService
{
    Task<List<FacilityDto>> GetFacilitiesAsync();
    Task<FacilityDto> CreateFacilityAsync(SaveFacilityRequest r);
    Task<bool> DeleteFacilityAsync(Guid id);

    Task<List<DepartmentDto>> GetDepartmentsAsync();
    Task<DepartmentDto> CreateDepartmentAsync(SaveDepartmentRequest r);
    Task<DepartmentDto?> UpdateDepartmentAsync(Guid id, SaveDepartmentRequest r);
    Task<bool> DeleteDepartmentAsync(Guid id);
    Task<DepartmentDto?> AssignDoctorsAsync(Guid departmentId, List<Guid> doctorIds);

    Task<List<DoctorProfileDto>> GetDoctorProfilesAsync();
    Task<DoctorProfileDto?> SaveDoctorProfileAsync(Guid userId, SaveDoctorProfileRequest r);
    Task<List<DepartmentReportRow>> GetDepartmentReportAsync(DateOnly from, DateOnly to);
}

// Every query is filtered by the caller's ClinicId, so one hospital can never see or
// change another hospital's departments, branches or doctors.
public class HospitalService : IHospitalService
{
    private readonly ApplicationDbContext _db;
    private readonly ICurrentUserService _current;

    public HospitalService(ApplicationDbContext db, ICurrentUserService current)
    {
        _db = db;
        _current = current;
    }

    private Guid ClinicId => _current.ClinicId;

    // ---- Facilities (branches) ----
    public async Task<List<FacilityDto>> GetFacilitiesAsync() =>
        await _db.Facilities.Where(f => f.ClinicId == ClinicId).OrderBy(f => f.Name)
            .Select(f => new FacilityDto(f.Id, f.Name, f.Address, f.Phone)).ToListAsync();

    public async Task<FacilityDto> CreateFacilityAsync(SaveFacilityRequest r)
    {
        var f = new Facility { ClinicId = ClinicId, Name = r.Name.Trim(), Address = r.Address.Trim(), Phone = r.Phone };
        _db.Facilities.Add(f);
        await _db.SaveChangesAsync();
        return new FacilityDto(f.Id, f.Name, f.Address, f.Phone);
    }

    public async Task<bool> DeleteFacilityAsync(Guid id)
    {
        var f = await _db.Facilities.FirstOrDefaultAsync(x => x.Id == id && x.ClinicId == ClinicId);
        if (f is null) return false;
        _db.Facilities.Remove(f);
        await _db.SaveChangesAsync();
        return true;
    }

    // ---- Departments ----
    private IQueryable<Department> Departments =>
        _db.Departments.Include(d => d.Doctors).Where(d => d.ClinicId == ClinicId);

    private static DepartmentDto ToDto(Department d) =>
        new(d.Id, d.Name, d.Description, d.FacilityId, d.IsActive, d.Doctors.Count,
            d.Doctors.Select(x => x.UserId).ToList());

    public async Task<List<DepartmentDto>> GetDepartmentsAsync() =>
        (await Departments.OrderBy(d => d.Name).ToListAsync()).Select(ToDto).ToList();

    private async Task<Guid?> ValidFacilityAsync(Guid? facilityId) =>
        facilityId is null ? null
            : await _db.Facilities.AnyAsync(f => f.Id == facilityId && f.ClinicId == ClinicId) ? facilityId : null;

    public async Task<DepartmentDto> CreateDepartmentAsync(SaveDepartmentRequest r)
    {
        var name = r.Name.Trim();
        if (await _db.Departments.AnyAsync(d => d.ClinicId == ClinicId && d.Name == name))
            throw new InvalidOperationException("A department with this name already exists.");
        var d = new Department
        {
            ClinicId = ClinicId, Name = name, Description = r.Description,
            FacilityId = await ValidFacilityAsync(r.FacilityId), IsActive = r.IsActive,
        };
        _db.Departments.Add(d);
        await _db.SaveChangesAsync();
        return ToDto(d);
    }

    public async Task<DepartmentDto?> UpdateDepartmentAsync(Guid id, SaveDepartmentRequest r)
    {
        var d = await Departments.FirstOrDefaultAsync(x => x.Id == id);
        if (d is null) return null;
        var name = r.Name.Trim();
        if (await _db.Departments.AnyAsync(x => x.ClinicId == ClinicId && x.Name == name && x.Id != id))
            throw new InvalidOperationException("A department with this name already exists.");
        d.Name = name; d.Description = r.Description; d.IsActive = r.IsActive;
        d.FacilityId = await ValidFacilityAsync(r.FacilityId);
        await _db.SaveChangesAsync();
        return ToDto(d);
    }

    public async Task<bool> DeleteDepartmentAsync(Guid id)
    {
        var d = await _db.Departments.FirstOrDefaultAsync(x => x.Id == id && x.ClinicId == ClinicId);
        if (d is null) return false;
        _db.Departments.Remove(d);
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<DepartmentDto?> AssignDoctorsAsync(Guid departmentId, List<Guid> doctorIds)
    {
        var d = await Departments.FirstOrDefaultAsync(x => x.Id == departmentId);
        if (d is null) return null;
        // Only active doctors of THIS clinic may be assigned.
        var valid = await _db.Users
            .Where(u => u.ClinicId == ClinicId && u.Role == UserRole.Doctor && doctorIds.Contains(u.Id))
            .Select(u => u.Id).ToListAsync();
        _db.DoctorDepartments.RemoveRange(d.Doctors);
        d.Doctors = valid.Select(id => new DoctorDepartment { UserId = id, DepartmentId = d.Id }).ToList();
        await _db.SaveChangesAsync();
        return ToDto(d);
    }

    // ---- Doctor profiles ----
    public async Task<List<DoctorProfileDto>> GetDoctorProfilesAsync()
    {
        var doctors = await _db.Users.Where(u => u.ClinicId == ClinicId && u.Role == UserRole.Doctor)
            .OrderBy(u => u.Name).ToListAsync();
        var ids = doctors.Select(d => d.Id).ToList();
        var profiles = await _db.DoctorProfiles.Where(p => ids.Contains(p.UserId)).ToDictionaryAsync(p => p.UserId);
        var links = await _db.DoctorDepartments.Where(x => ids.Contains(x.UserId)).ToListAsync();
        return doctors.Select(u =>
        {
            profiles.TryGetValue(u.Id, out var p);
            return new DoctorProfileDto(u.Id, u.Name, u.Specialization, u.ConsultationFee,
                p?.Qualifications, p?.CouncilRegistrationNumber, p?.CouncilName, p?.ExperienceYears ?? 0,
                p?.Bio, p?.VerificationStatus ?? DoctorVerificationStatus.Pending,
                links.Where(l => l.UserId == u.Id).Select(l => l.DepartmentId).ToList());
        }).ToList();
    }

    public async Task<DoctorProfileDto?> SaveDoctorProfileAsync(Guid userId, SaveDoctorProfileRequest r)
    {
        var doctor = await _db.Users.FirstOrDefaultAsync(u =>
            u.Id == userId && u.ClinicId == ClinicId && u.Role == UserRole.Doctor);
        if (doctor is null) return null;
        var p = await _db.DoctorProfiles.FirstOrDefaultAsync(x => x.UserId == userId);
        if (p is null) { p = new DoctorProfile { UserId = userId }; _db.DoctorProfiles.Add(p); }
        p.Qualifications = r.Qualifications; p.CouncilRegistrationNumber = r.CouncilRegistrationNumber;
        p.CouncilName = r.CouncilName; p.ExperienceYears = Math.Max(0, r.ExperienceYears); p.Bio = r.Bio;
        await _db.SaveChangesAsync();
        return (await GetDoctorProfilesAsync()).First(x => x.UserId == userId);
    }

    // ---- Department-wise report (visits are attributed through the visit's doctor) ----
    public async Task<List<DepartmentReportRow>> GetDepartmentReportAsync(DateOnly from, DateOnly to)
    {
        var depts = await Departments.ToListAsync();
        var visits = await _db.PatientVisits
            .Where(v => v.ClinicId == ClinicId && v.VisitDate >= from && v.VisitDate <= to).ToListAsync();
        var rows = new List<DepartmentReportRow>();
        foreach (var d in depts.OrderBy(x => x.Name))
        {
            var docIds = d.Doctors.Select(x => x.UserId).ToHashSet();
            var vs = visits.Where(v => docIds.Contains(v.DoctorId)).ToList();
            rows.Add(new DepartmentReportRow(d.Id, d.Name, docIds.Count, vs.Count,
                vs.Sum(v => v.AmountPaid), vs.Sum(v => v.ConsultationFee - v.AmountPaid)));
        }
        var assigned = depts.SelectMany(d => d.Doctors.Select(x => x.UserId)).ToHashSet();
        var rest = visits.Where(v => !assigned.Contains(v.DoctorId)).ToList();
        if (rest.Count > 0)
            rows.Add(new DepartmentReportRow(null, "Unassigned", 0, rest.Count,
                rest.Sum(v => v.AmountPaid), rest.Sum(v => v.ConsultationFee - v.AmountPaid)));
        return rows;
    }
}
