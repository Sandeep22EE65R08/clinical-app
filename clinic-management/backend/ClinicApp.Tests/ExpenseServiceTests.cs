using ClinicApp.Api.Data;
using ClinicApp.Api.Domain.Entities;
using ClinicApp.Api.Domain.Enums;
using ClinicApp.Api.DTOs;
using ClinicApp.Api.Repositories;
using ClinicApp.Api.Services;
using Microsoft.EntityFrameworkCore;

namespace ClinicApp.Tests;

public class ExpenseServiceTests
{
    private static ApplicationDbContext NewDb() =>
        new(new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options);

    private sealed class FakeCurrentUser : ICurrentUserService
    {
        public Guid UserId { get; init; } = Guid.NewGuid();
        public Guid ClinicId { get; init; }
        public Guid PatientId => Guid.Empty;
        public UserRole Role => UserRole.Admin;
        public bool IsAuthenticated => true;
    }

    private static ExpenseService NewService(ApplicationDbContext db, Guid clinicId) =>
        new(new Repository<Expense>(db), new Repository<PatientVisit>(db),
            new FakeCurrentUser { ClinicId = clinicId });

    private static readonly DateOnly From = new(2026, 10, 1);
    private static readonly DateOnly To = new(2026, 10, 31);
    private static DateOnly Day(int d) => new(2026, 10, d);

    [Fact]
    public async Task GetSummary_ComputesRevenueMinusExpenses_AndGroupsByCategory()
    {
        var clinic = Guid.NewGuid();
        await using var db = NewDb();
        db.Expenses.AddRange(
            new Expense { ClinicId = clinic, ExpenseDate = Day(2), Category = ExpenseCategory.Rent, Amount = 5000 },
            new Expense { ClinicId = clinic, ExpenseDate = Day(3), Category = ExpenseCategory.Rent, Amount = 1000 },
            new Expense { ClinicId = clinic, ExpenseDate = Day(4), Category = ExpenseCategory.Electricity, Amount = 2000 });
        db.PatientVisits.AddRange(
            new PatientVisit { ClinicId = clinic, VisitDate = Day(2), AmountPaid = 8000 },
            new PatientVisit { ClinicId = clinic, VisitDate = Day(5), AmountPaid = 2000 });
        await db.SaveChangesAsync();

        var summary = await NewService(db, clinic).GetSummaryAsync(From, To);

        Assert.Equal(8000m, summary.TotalExpenses);
        Assert.Equal(10000m, summary.Revenue);
        Assert.Equal(2000m, summary.Net);
        // Grouped + ordered by amount descending: Rent (6000) before Electricity (2000).
        Assert.Equal(2, summary.ByCategory.Count);
        Assert.Equal(ExpenseCategory.Rent, summary.ByCategory[0].Category);
        Assert.Equal(6000m, summary.ByCategory[0].Amount);
        Assert.Equal(ExpenseCategory.Electricity, summary.ByCategory[1].Category);
        Assert.Equal(2000m, summary.ByCategory[1].Amount);
    }

    [Fact]
    public async Task Queries_AreScopedToCurrentClinic()
    {
        var mine = Guid.NewGuid();
        var other = Guid.NewGuid();
        await using var db = NewDb();
        db.Expenses.AddRange(
            new Expense { ClinicId = mine, ExpenseDate = Day(2), Category = ExpenseCategory.Rent, Amount = 5000 },
            new Expense { ClinicId = other, ExpenseDate = Day(2), Category = ExpenseCategory.Rent, Amount = 9999 });
        db.PatientVisits.AddRange(
            new PatientVisit { ClinicId = mine, VisitDate = Day(2), AmountPaid = 3000 },
            new PatientVisit { ClinicId = other, VisitDate = Day(2), AmountPaid = 7777 });
        await db.SaveChangesAsync();

        var service = NewService(db, mine);

        var list = await service.GetRangeAsync(From, To);
        Assert.Single(list);
        Assert.Equal(5000m, list[0].Amount);

        var summary = await service.GetSummaryAsync(From, To);
        Assert.Equal(5000m, summary.TotalExpenses);
        Assert.Equal(3000m, summary.Revenue);
        Assert.Equal(-2000m, summary.Net);
    }

    [Fact]
    public async Task Create_ThenDelete_RespectsClinicScope()
    {
        var mine = Guid.NewGuid();
        var other = Guid.NewGuid();
        await using var db = NewDb();
        var service = NewService(db, mine);

        var created = await service.CreateAsync(
            new CreateExpenseRequest(Day(10), ExpenseCategory.MedicalSupplies, 1500, "Gloves"));
        Assert.Equal(1500m, created.Amount);
        Assert.Equal(ExpenseCategory.MedicalSupplies, created.Category);

        // Another clinic cannot delete it.
        Assert.False(await NewService(db, other).DeleteAsync(created.Id));
        // Owning clinic can.
        Assert.True(await service.DeleteAsync(created.Id));
        Assert.Empty(await service.GetRangeAsync(From, To));
    }

    [Fact]
    public async Task GetSummary_WithNoData_ReturnsZeros()
    {
        await using var db = NewDb();
        var summary = await NewService(db, Guid.NewGuid()).GetSummaryAsync(From, To);

        Assert.Equal(0m, summary.TotalExpenses);
        Assert.Equal(0m, summary.Revenue);
        Assert.Equal(0m, summary.Net);
        Assert.Empty(summary.ByCategory);
    }
}
