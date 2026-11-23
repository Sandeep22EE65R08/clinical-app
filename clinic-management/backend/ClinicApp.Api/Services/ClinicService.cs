using ClinicApp.Api.Domain.Entities;
using ClinicApp.Api.DTOs;
using ClinicApp.Api.Mapping;
using ClinicApp.Api.Repositories;
using Microsoft.EntityFrameworkCore;

namespace ClinicApp.Api.Services;

public class ClinicService : IClinicService
{
    private readonly IRepository<Clinic> _clinics;
    private readonly ICurrentUserService _current;

    public ClinicService(IRepository<Clinic> clinics, ICurrentUserService current)
    {
        _clinics = clinics;
        _current = current;
    }

    public async Task<ClinicDto?> GetAsync()
    {
        var clinic = await _clinics.Query().FirstOrDefaultAsync(c => c.Id == _current.ClinicId);
        return clinic?.ToDto();
    }

    public async Task<ClinicDto?> UpdateAsync(UpdateClinicRequest r)
    {
        var clinic = await _clinics.Query().FirstOrDefaultAsync(c => c.Id == _current.ClinicId);
        if (clinic is null) return null;

        clinic.Name = r.Name.Trim();
        clinic.Address = r.Address.Trim();
        clinic.Phone = r.Phone;
        clinic.DefaultConsultationFee = r.DefaultConsultationFee;
        clinic.WorkingHours = r.WorkingHours;
        clinic.IsListedPublicly = r.IsListedPublicly;
        _clinics.Update(clinic);
        await _clinics.SaveChangesAsync();
        return clinic.ToDto();
    }
}
