using ClinicApp.Api.DTOs;
using ClinicApp.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ClinicApp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class ExpensesController : ControllerBase
{
    private readonly IExpenseService _expenses;

    public ExpensesController(IExpenseService expenses) => _expenses = expenses;

    [HttpGet]
    public async Task<ActionResult<List<ExpenseDto>>> GetRange(
        [FromQuery] DateOnly? from, [FromQuery] DateOnly? to)
    {
        var start = from ?? new DateOnly(DateTime.Now.Year, DateTime.Now.Month, 1);
        var end = to ?? DateOnly.FromDateTime(DateTime.Now);
        return Ok(await _expenses.GetRangeAsync(start, end));
    }

    [HttpGet("summary")]
    public async Task<ActionResult<ExpenseSummaryDto>> Summary(
        [FromQuery] DateOnly? from, [FromQuery] DateOnly? to)
    {
        var start = from ?? new DateOnly(DateTime.Now.Year, DateTime.Now.Month, 1);
        var end = to ?? DateOnly.FromDateTime(DateTime.Now);
        return Ok(await _expenses.GetSummaryAsync(start, end));
    }

    [HttpPost]
    public async Task<ActionResult<ExpenseDto>> Create(CreateExpenseRequest request) =>
        Ok(await _expenses.CreateAsync(request));

    [HttpDelete("{id:guid}")]
    public async Task<ActionResult> Delete(Guid id)
    {
        var ok = await _expenses.DeleteAsync(id);
        return ok ? NoContent() : NotFound();
    }
}
