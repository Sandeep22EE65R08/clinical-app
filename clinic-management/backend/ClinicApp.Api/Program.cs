using System.Text;
using System.Text.Json.Serialization;
using ClinicApp.Api.Data;
using ClinicApp.Api.Repositories;
using ClinicApp.Api.Services;
using ClinicApp.Api.Services.Sms;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// ---- Database ----
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// ---- JWT ----
var jwtSettings = builder.Configuration.GetSection("Jwt").Get<JwtSettings>() ?? new JwtSettings();
builder.Services.AddSingleton(jwtSettings);

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSettings.Issuer,
            ValidAudience = jwtSettings.Audience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.Key))
        };
    });
// Staff roles may use the clinic back-office; Patient role is limited to the
// patient portal only and can never reach clinic/clinical endpoints.
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("Staff", p =>
        p.RequireRole("Admin", "Doctor", "Receptionist", "Nurse", "Staff"));
    options.AddPolicy("Patient", p => p.RequireRole("Patient"));
});

// ---- App services ----
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
builder.Services.AddScoped<ICurrentUserService, CurrentUserService>();
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IPatientService, PatientService>();
builder.Services.AddScoped<IVisitService, VisitService>();
builder.Services.AddScoped<IReportService, ReportService>();
builder.Services.AddScoped<IClinicService, ClinicService>();
builder.Services.AddScoped<IAppointmentService, AppointmentService>();
builder.Services.AddScoped<IQueueService, QueueService>();
builder.Services.AddScoped<IPortalService, PortalService>();
builder.Services.AddScoped<IExpenseService, ExpenseService>();

// ---- SMS / WhatsApp (modular; logs by default, real provider pluggable) ----
var smsSettings = builder.Configuration.GetSection("Sms").Get<SmsSettings>() ?? new SmsSettings();
builder.Services.AddSingleton(smsSettings);
builder.Services.AddScoped<ISmsSender, LoggingSmsSender>();

// ---- CORS for the React dev server ----
const string CorsPolicy = "frontend";
builder.Services.AddCors(options =>
    options.AddPolicy(CorsPolicy, policy => policy
        .WithOrigins("http://localhost:5173", "http://localhost:4173")
        .AllowAnyHeader()
        .AllowAnyMethod()));

builder.Services.AddControllers().AddJsonOptions(o =>
    o.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()));
builder.Services.AddOpenApi();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors(CorsPolicy);
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// ---- Migrate + seed demo data on startup ----
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    await DbSeeder.SeedAsync(db);
}

app.Run();
