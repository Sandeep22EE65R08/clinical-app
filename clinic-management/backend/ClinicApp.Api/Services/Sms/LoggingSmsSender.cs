namespace ClinicApp.Api.Services.Sms;

// Default modular SMS sender. Writes messages to the application log instead
// of calling an external gateway, so the notification flow works end-to-end
// during development. Swap the DI registration to add a real provider later.
public class LoggingSmsSender : ISmsSender
{
    private readonly ILogger<LoggingSmsSender> _logger;
    private readonly SmsSettings _settings;

    public LoggingSmsSender(ILogger<LoggingSmsSender> logger, SmsSettings settings)
    {
        _logger = logger;
        _settings = settings;
    }

    public Task SendAsync(string toMobileNumber, string message, CancellationToken ct = default)
    {
        if (!_settings.Enabled || string.IsNullOrWhiteSpace(toMobileNumber))
            return Task.CompletedTask;

        _logger.LogInformation("[SMS:{Provider}] to {Mobile}: {Message}",
            _settings.Provider, toMobileNumber, message);
        return Task.CompletedTask;
    }
}
