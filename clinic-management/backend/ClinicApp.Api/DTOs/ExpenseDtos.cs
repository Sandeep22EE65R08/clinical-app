using System.ComponentModel.DataAnnotations;
using ClinicApp.Api.Domain.Enums;

namespace ClinicApp.Api.DTOs;

public record CreateExpenseRequest(
    DateOnly ExpenseDate,
    ExpenseCategory Category,
    [Required] decimal Amount,
    string? Note);

public record ExpenseDto(
    Guid Id,
    DateOnly ExpenseDate,
    ExpenseCategory Category,
    decimal Amount,
    string? Note,
    DateTime CreatedAt);

public record CategoryTotal(ExpenseCategory Category, decimal Amount);

// Expense totals + revenue/net for a period, plus a per-category breakdown.
public record ExpenseSummaryDto(
    decimal TotalExpenses,
    decimal Revenue,
    decimal Net,
    List<CategoryTotal> ByCategory);
