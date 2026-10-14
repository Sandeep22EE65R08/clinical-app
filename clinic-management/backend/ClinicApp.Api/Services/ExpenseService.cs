using ClinicApp.Api.Domain.Entities;
using ClinicApp.Api.DTOs;
using ClinicApp.Api.Repositories;
using Microsoft.EntityFrameworkCore;

namespace ClinicApp.Api.Services;

public class ExpenseService : IExpenseService
{
    private readonly IRepository<Expense> _expenses;
    private readonly IRepository<PatientVisit> _visits;
    private readonly ICurrentUserService _current;

    public ExpenseService(IRepository<Expense> expenses,
        IRepository<PatientVisit> visits, ICurrentUserService current)
    {
        _expenses = expenses;
        _visits = visits;
        _current = current;
    }

    private IQueryable<Expense> ClinicExpenses =>
        _expenses.Query().Where(e => e.ClinicId == _current.ClinicId);

    public async Task<ExpenseDto> CreateAsync(CreateExpenseRequest r)
    {
        var expense = new Expense
        {
            ClinicId = _current.ClinicId,
            ExpenseDate = r.ExpenseDate == default
                ? DateOnly.FromDateTime(DateTime.Now)
                : r.ExpenseDate,
            Category = r.Category,
            Amount = r.Amount,
            Note = r.Note,
            CreatedBy = _current.UserId
        };
        await _expenses.AddAsync(expense);
        await _expenses.SaveChangesAsync();
        return ToDto(expense);
    }

    public async Task<List<ExpenseDto>> GetRangeAsync(DateOnly from, DateOnly to)
    {
        var list = await ClinicExpenses
            .Where(e => e.ExpenseDate >= from && e.ExpenseDate <= to)
            .OrderByDescending(e => e.ExpenseDate).ThenByDescending(e => e.CreatedAt)
            .ToListAsync();
        return list.Select(ToDto).ToList();
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var expense = await ClinicExpenses.FirstOrDefaultAsync(e => e.Id == id);
        if (expense is null) return false;
        _expenses.Remove(expense);
        await _expenses.SaveChangesAsync();
        return true;
    }

    public async Task<ExpenseSummaryDto> GetSummaryAsync(DateOnly from, DateOnly to)
    {
        var expenses = await ClinicExpenses
            .Where(e => e.ExpenseDate >= from && e.ExpenseDate <= to)
            .ToListAsync();

        var revenue = await _visits.Query()
            .Where(v => v.ClinicId == _current.ClinicId &&
                        v.VisitDate >= from && v.VisitDate <= to)
            .SumAsync(v => (decimal?)v.AmountPaid) ?? 0;

        var total = expenses.Sum(e => e.Amount);
        var byCategory = expenses
            .GroupBy(e => e.Category)
            .Select(g => new CategoryTotal(g.Key, g.Sum(e => e.Amount)))
            .OrderByDescending(c => c.Amount)
            .ToList();

        return new ExpenseSummaryDto(total, revenue, revenue - total, byCategory);
    }

    private static ExpenseDto ToDto(Expense e) =>
        new(e.Id, e.ExpenseDate, e.Category, e.Amount, e.Note, e.CreatedAt);
}
