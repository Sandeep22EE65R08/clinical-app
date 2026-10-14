using ClinicApp.Api.Domain.Entities;
using ClinicApp.Api.Domain.Enums;
using ClinicApp.Api.DTOs;
using ClinicApp.Api.Repositories;
using Microsoft.EntityFrameworkCore;

namespace ClinicApp.Api.Services;

// Simple daily token queue built on top of today's PatientVisit records.
public class QueueService : IQueueService
{
    private readonly IRepository<PatientVisit> _visits;
    private readonly ICurrentUserService _current;

    public QueueService(IRepository<PatientVisit> visits, ICurrentUserService current)
    {
        _visits = visits;
        _current = current;
    }

    public async Task<QueueStateDto> GetStateAsync(Guid? doctorId) => await BuildStateAsync(doctorId);

    public async Task<QueueStateDto> CallNextAsync(Guid? doctorId)
    {
        var visits = await TodayVisitsAsync(doctorId);

        // Any currently-serving patient is left as-is unless already done; we
        // simply promote the lowest-token waiting patient to InConsultation.
        var next = visits
            .Where(v => v.VisitStatus == VisitStatus.Waiting)
            .OrderBy(v => v.TokenNumber)
            .FirstOrDefault();

        if (next is not null)
        {
            foreach (var v in visits.Where(v => v.VisitStatus == VisitStatus.InConsultation))
            {
                v.VisitStatus = VisitStatus.Completed;
                _visits.Update(v);
            }
            next.VisitStatus = VisitStatus.InConsultation;
            _visits.Update(next);
            await _visits.SaveChangesAsync();
        }
        return await BuildStateAsync(doctorId);
    }

    public async Task<QueueStateDto> SkipAsync(Guid visitId, Guid? doctorId) =>
        await SetStatusAsync(visitId, VisitStatus.Skipped, doctorId);

    public async Task<QueueStateDto> CompleteAsync(Guid visitId, Guid? doctorId) =>
        await SetStatusAsync(visitId, VisitStatus.Completed, doctorId);

    public async Task<QueueStateDto> RequeueAsync(Guid visitId, Guid? doctorId) =>
        await SetStatusAsync(visitId, VisitStatus.Waiting, doctorId);

    private async Task<QueueStateDto> SetStatusAsync(Guid visitId, VisitStatus status, Guid? doctorId)
    {
        var visit = await _visits.Query()
            .FirstOrDefaultAsync(v => v.Id == visitId && v.ClinicId == _current.ClinicId);
        if (visit is not null)
        {
            visit.VisitStatus = status;
            _visits.Update(visit);
            await _visits.SaveChangesAsync();
        }
        return await BuildStateAsync(doctorId);
    }

    private async Task<List<PatientVisit>> TodayVisitsAsync(Guid? doctorId)
    {
        var today = DateOnly.FromDateTime(DateTime.Now);
        var q = _visits.Query()
            .Include(v => v.Patient)
            .Include(v => v.Doctor)
            .Where(v => v.ClinicId == _current.ClinicId && v.VisitDate == today);
        if (doctorId.HasValue && doctorId.Value != Guid.Empty)
            q = q.Where(v => v.DoctorId == doctorId.Value);
        return await q.ToListAsync();
    }

    private async Task<QueueStateDto> BuildStateAsync(Guid? doctorId)
    {
        var visits = await TodayVisitsAsync(doctorId);

        var nowServing = visits
            .Where(v => v.VisitStatus == VisitStatus.InConsultation)
            .OrderBy(v => v.TokenNumber)
            .Select(Map)
            .FirstOrDefault();

        var waiting = visits
            .Where(v => v.VisitStatus == VisitStatus.Waiting || v.VisitStatus == VisitStatus.Skipped)
            .OrderBy(v => v.TokenNumber)
            .Select(Map)
            .ToList();

        var completed = visits
            .Where(v => v.VisitStatus == VisitStatus.Completed)
            .OrderBy(v => v.TokenNumber)
            .Select(Map)
            .ToList();

        return new QueueStateDto(nowServing, waiting, completed, waiting.Count);
    }

    private static QueueEntryDto Map(PatientVisit v) =>
        new(
            v.Id,
            v.TokenNumber,
            v.PatientId,
            v.Patient?.Name ?? string.Empty,
            v.Patient?.Age ?? 0,
            v.Patient?.VillageTownCity ?? string.Empty,
            v.DoctorId,
            v.Doctor?.Name ?? string.Empty,
            v.VisitStatus);
}
