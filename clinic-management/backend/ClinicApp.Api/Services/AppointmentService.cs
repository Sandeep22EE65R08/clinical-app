using ClinicApp.Api.Domain.Entities;
using ClinicApp.Api.Domain.Enums;
using ClinicApp.Api.DTOs;
using ClinicApp.Api.Mapping;
using ClinicApp.Api.Repositories;
using Microsoft.EntityFrameworkCore;

namespace ClinicApp.Api.Services;

public class AppointmentService : IAppointmentService
{
    private readonly IRepository<Appointment> _appointments;
    private readonly IRepository<User> _users;
    private readonly ICurrentUserService _current;

    public AppointmentService(IRepository<Appointment> appointments,
        IRepository<User> users, ICurrentUserService current)
    {
        _appointments = appointments;
        _users = users;
        _current = current;
    }

    public async Task<AppointmentDto> CreateAsync(CreateAppointmentRequest r)
    {
        var doctorId = await ResolveDoctorAsync(r.DoctorId);
        var appointment = new Appointment
        {
            ClinicId = _current.ClinicId,
            PatientId = r.PatientId,
            DoctorId = doctorId,
            ScheduledDate = r.ScheduledDate,
            ScheduledTime = r.ScheduledTime,
            Reason = r.Reason,
            Status = AppointmentStatus.Scheduled
        };
        await _appointments.AddAsync(appointment);
        await _appointments.SaveChangesAsync();
        return await LoadDtoAsync(appointment.Id) ?? appointment.ToDto();
    }

    public async Task<List<AppointmentDto>> GetRangeAsync(DateOnly from, DateOnly to, Guid? doctorId)
    {
        var q = _appointments.Query()
            .Include(a => a.Patient)
            .Include(a => a.Doctor)
            .Where(a => a.ClinicId == _current.ClinicId &&
                        a.ScheduledDate >= from && a.ScheduledDate <= to);

        if (doctorId.HasValue && doctorId.Value != Guid.Empty)
            q = q.Where(a => a.DoctorId == doctorId.Value);

        var list = await q
            .OrderBy(a => a.ScheduledDate).ThenBy(a => a.ScheduledTime)
            .ToListAsync();
        return list.Select(a => a.ToDto()).ToList();
    }

    public async Task<AppointmentDto?> GetAsync(Guid id) => await LoadDtoAsync(id);

    public async Task<AppointmentDto?> UpdateStatusAsync(Guid id, UpdateAppointmentStatusRequest r)
    {
        var appointment = await _appointments.Query()
            .FirstOrDefaultAsync(a => a.Id == id && a.ClinicId == _current.ClinicId);
        if (appointment is null) return null;

        appointment.Status = r.Status;
        _appointments.Update(appointment);
        await _appointments.SaveChangesAsync();
        return await LoadDtoAsync(id);
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var appointment = await _appointments.Query()
            .FirstOrDefaultAsync(a => a.Id == id && a.ClinicId == _current.ClinicId);
        if (appointment is null) return false;
        _appointments.Remove(appointment);
        await _appointments.SaveChangesAsync();
        return true;
    }

    private async Task<AppointmentDto?> LoadDtoAsync(Guid id)
    {
        var appointment = await _appointments.Query()
            .Include(a => a.Patient)
            .Include(a => a.Doctor)
            .FirstOrDefaultAsync(a => a.Id == id && a.ClinicId == _current.ClinicId);
        return appointment?.ToDto();
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
