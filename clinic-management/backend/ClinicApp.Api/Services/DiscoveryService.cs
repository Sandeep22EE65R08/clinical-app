using ClinicApp.Api.Domain.Entities;
using ClinicApp.Api.Domain.Enums;
using ClinicApp.Api.DTOs;
using ClinicApp.Api.Repositories;
using Microsoft.EntityFrameworkCore;

namespace ClinicApp.Api.Services;

public interface IDiscoveryService
{
    List<SymptomDto> GetSymptoms();
    Task<DiscoverResultDto> SearchAsync(string? symptoms, string? text, string? location);
}

// Public (no login) search used by the patient "Find care" page. Only returns business
// information a clinic chose to publish (name, address, phone, doctors, fees) and never
// any patient data. Clinics can opt out via Clinic.IsListedPublicly.
public class DiscoveryService : IDiscoveryService
{
    private const int MaxClinics = 50;
    private readonly IRepository<Clinic> _clinics;

    public DiscoveryService(IRepository<Clinic> clinics) => _clinics = clinics;

    public List<SymptomDto> GetSymptoms() => SymptomGuide.Catalog();

    public async Task<DiscoverResultDto> SearchAsync(string? symptoms, string? text, string? location)
    {
        var ids = (symptoms ?? string.Empty).Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
        var triage = SymptomGuide.Triage(ids, text);
        var keywords = triage.Departments.Select(d => d.Keyword).ToList();

        var query = _clinics.Query().AsNoTracking().Where(c => c.IsListedPublicly);
        var loc = location?.Trim();
        if (!string.IsNullOrEmpty(loc))
        {
            // Escape LIKE wildcards so user input is matched literally.
            var escaped = loc.Replace("\\", "\\\\").Replace("%", "\\%").Replace("_", "\\_");
            query = query.Where(c => EF.Functions.ILike(c.Address, $"%{escaped}%"));
        }

        var clinics = await query.Include(c => c.Users).OrderBy(c => c.Name).Take(200).ToListAsync();

        var result = new List<DiscoverClinicDto>();
        foreach (var c in clinics)
        {
            var doctors = c.Users.Where(u => u.Role == UserRole.Doctor && u.IsActive).ToList();
            if (keywords.Count > 0)
            {
                // Only clinics that have a doctor in a suggested department.
                doctors = doctors.Where(d => !string.IsNullOrEmpty(d.Specialization) &&
                    keywords.Any(k => d.Specialization!.Contains(k, StringComparison.OrdinalIgnoreCase))).ToList();
                if (doctors.Count == 0) continue;
            }
            result.Add(new DiscoverClinicDto(c.Id, c.Name, c.Address, c.Phone, c.WorkingHours,
                c.DefaultConsultationFee,
                doctors.OrderBy(d => d.Name)
                    .Select(d => new DiscoverDoctorDto(d.Id, d.Name, d.Specialization, d.ConsultationFee)).ToList()));
            if (result.Count >= MaxClinics) break;
        }
        return new DiscoverResultDto(triage, result);
    }
}
