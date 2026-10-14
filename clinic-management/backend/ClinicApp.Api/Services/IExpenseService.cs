using ClinicApp.Api.DTOs;

namespace ClinicApp.Api.Services;

public interface IExpenseService
{
    Task<ExpenseDto> CreateAsync(CreateExpenseRequest request);
    Task<List<ExpenseDto>> GetRangeAsync(DateOnly from, DateOnly to);
    Task<bool> DeleteAsync(Guid id);
    Task<ExpenseSummaryDto> GetSummaryAsync(DateOnly from, DateOnly to);
}
