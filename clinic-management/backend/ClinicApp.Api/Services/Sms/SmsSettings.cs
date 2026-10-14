namespace ClinicApp.Api.Services.Sms;

// Bound from the optional "Sms" configuration section. Kept intentionally
// minimal so a concrete provider can extend it (ApiKey, SenderId, etc.).
public class SmsSettings
{
    // "Log" (default, no external calls) or a future provider name.
    public string Provider { get; set; } = "Log";
    public bool Enabled { get; set; } = true;
    public string? SenderId { get; set; }
}
