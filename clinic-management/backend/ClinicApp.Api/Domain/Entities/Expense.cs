using ClinicApp.Api.Domain.Enums;

namespace ClinicApp.Api.Domain.Entities;

// A clinic operating expense (rent, salaries, supplies, etc.). Scoped per clinic.
public class Expense : BaseEntity
{
    public Guid ClinicId { get; set; }
    public Clinic? Clinic { get; set; }

    public DateOnly ExpenseDate { get; set; }
    public ExpenseCategory Category { get; set; }
    public decimal Amount { get; set; }
    public string? Note { get; set; }

    // The staff member who recorded the expense.
    public Guid CreatedBy { get; set; }
}
