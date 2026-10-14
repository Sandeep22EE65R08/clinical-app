using ClinicApp.Api.DTOs;
using ClinicApp.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ClinicApp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "Staff")]
public class QueueController : ControllerBase
{
    private readonly IQueueService _queue;

    public QueueController(IQueueService queue) => _queue = queue;

    [HttpGet]
    public async Task<ActionResult<QueueStateDto>> Get([FromQuery] Guid? doctorId) =>
        Ok(await _queue.GetStateAsync(doctorId));

    [HttpPost("call-next")]
    [Authorize(Roles = "Admin,Receptionist,Doctor")]
    public async Task<ActionResult<QueueStateDto>> CallNext([FromQuery] Guid? doctorId) =>
        Ok(await _queue.CallNextAsync(doctorId));

    [HttpPost("{visitId:guid}/skip")]
    [Authorize(Roles = "Admin,Receptionist,Doctor")]
    public async Task<ActionResult<QueueStateDto>> Skip(Guid visitId, [FromQuery] Guid? doctorId) =>
        Ok(await _queue.SkipAsync(visitId, doctorId));

    [HttpPost("{visitId:guid}/complete")]
    [Authorize(Roles = "Admin,Receptionist,Doctor")]
    public async Task<ActionResult<QueueStateDto>> Complete(Guid visitId, [FromQuery] Guid? doctorId) =>
        Ok(await _queue.CompleteAsync(visitId, doctorId));

    [HttpPost("{visitId:guid}/requeue")]
    [Authorize(Roles = "Admin,Receptionist,Doctor")]
    public async Task<ActionResult<QueueStateDto>> Requeue(Guid visitId, [FromQuery] Guid? doctorId) =>
        Ok(await _queue.RequeueAsync(visitId, doctorId));
}
