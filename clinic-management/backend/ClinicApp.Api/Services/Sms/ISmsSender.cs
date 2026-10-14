namespace ClinicApp.Api.Services.Sms;

// Abstraction over the outbound SMS / WhatsApp gateway. The default
// implementation only logs messages; a real provider (Twilio, MSG91,
// WhatsApp Cloud API, etc.) can be dropped in later without touching callers.
public interface ISmsSender
{
    Task SendAsync(string toMobileNumber, string message, CancellationToken ct = default);
}
