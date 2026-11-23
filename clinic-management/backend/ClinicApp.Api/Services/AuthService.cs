using ClinicApp.Api.Data;
using ClinicApp.Api.Domain.Entities;
using ClinicApp.Api.Domain.Enums;
using ClinicApp.Api.DTOs;
using ClinicApp.Api.Repositories;
using Microsoft.EntityFrameworkCore;

namespace ClinicApp.Api.Services;

public class AuthService : IAuthService
{
    private readonly IRepository<User> _users;
    private readonly IRepository<Clinic> _clinics;
    private readonly IRepository<Patient> _patients;
    private readonly ITokenService _tokens;
    private readonly ICurrentUserService _current;
    private readonly ApplicationDbContext _db;

    public AuthService(IRepository<User> users, IRepository<Clinic> clinics,
        IRepository<Patient> patients, ITokenService tokens, ICurrentUserService current,
        ApplicationDbContext db)
    {
        _users = users;
        _clinics = clinics;
        _patients = patients;
        _tokens = tokens;
        _current = current;
        _db = db;
    }

    public async Task<AuthResponse?> LoginAsync(LoginRequest request)
    {
        var user = await _users.Query()
            .Include(u => u.Clinic)
            .FirstOrDefaultAsync(u => u.Username == request.Username && u.IsActive);

        if (user is null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            return null;

        var clinicName = user.Clinic?.Name ?? "Clinic";
        var token = _tokens.CreateToken(user, clinicName);
        return new AuthResponse(token, user.Id, user.Name, user.Username, user.Role, user.ClinicId, clinicName);
    }

    public async Task<AuthResponse> RegisterClinicAsync(RegisterClinicRequest request)
    {
        var username = request.Username.Trim();
        // Usernames are globally unique so logins are unambiguous across clinics.
        var taken = await _users.Query().AnyAsync(u => u.Username == username);
        if (taken)
            throw new InvalidOperationException("Username already exists. Please choose another.");

        var clinic = new Clinic
        {
            Name = request.ClinicName.Trim(),
            Address = request.Address.Trim(),
            Phone = request.Phone,
            // Demo clinics (with fake doctors) must not show up in public search.
            IsListedPublicly = !request.IncludeSampleData
        };
        await _clinics.AddAsync(clinic);

        var admin = new User
        {
            ClinicId = clinic.Id,
            Name = request.AdminName.Trim(),
            Username = username,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Role = UserRole.Admin
        };
        await _users.AddAsync(admin);
        await _users.SaveChangesAsync();

        if (request.IncludeSampleData)
        {
            DemoData.Populate(_db, clinic.Id, admin.Id);
            await _db.SaveChangesAsync();
        }

        var token = _tokens.CreateToken(admin, clinic.Name);
        return new AuthResponse(token, admin.Id, admin.Name, admin.Username, admin.Role, clinic.Id, clinic.Name);
    }

    public async Task<UserDto> CreateUserAsync(CreateUserRequest request)
    {
        var exists = await _users.Query()
            .AnyAsync(u => u.Username == request.Username);
        if (exists)
            throw new InvalidOperationException("Username already exists.");

        var user = new User
        {
            ClinicId = _current.ClinicId,
            Name = request.Name,
            Username = request.Username,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Role = request.Role,
            Phone = request.Phone,
            ConsultationFee = request.ConsultationFee,
            Specialization = request.Specialization
        };
        await _users.AddAsync(user);
        await _users.SaveChangesAsync();
        return ToDto(user);
    }

    public async Task<List<UserDto>> GetUsersAsync()
    {
        var list = await _users.Query()
            .Where(u => u.ClinicId == _current.ClinicId)
            .OrderBy(u => u.Name)
            .ToListAsync();
        return list.Select(ToDto).ToList();
    }

    public async Task<List<UserDto>> GetDoctorsAsync()
    {
        var list = await _users.Query()
            .Where(u => u.ClinicId == _current.ClinicId && u.Role == UserRole.Doctor && u.IsActive)
            .OrderBy(u => u.Name)
            .ToListAsync();
        return list.Select(ToDto).ToList();
    }

    private static UserDto ToDto(User u) =>
        new(u.Id, u.Name, u.Username, u.Role, u.Phone, u.ConsultationFee, u.Specialization, u.IsActive);

    // ---- Patient portal ----

    public async Task<List<PublicClinicDto>> GetPublicClinicsAsync()
    {
        var list = await _clinics.Query().OrderBy(c => c.Name).ToListAsync();
        return list.Select(c => new PublicClinicDto(c.Id, c.Name, c.Address)).ToList();
    }

    public async Task<AuthResponse> RegisterPatientAsync(PatientRegisterRequest request)
    {
        var clinic = await _clinics.Query().FirstOrDefaultAsync(c => c.Id == request.ClinicId)
            ?? throw new InvalidOperationException("Selected clinic was not found.");

        var mobile = request.MobileNumber.Trim();
        // Re-use an existing patient record (e.g. created by reception) if the
        // mobile already exists in this clinic; otherwise create a new one.
        var patient = await _patients.Query()
            .FirstOrDefaultAsync(p => p.ClinicId == clinic.Id && p.MobileNumber == mobile);

        if (patient is not null && !string.IsNullOrEmpty(patient.PasswordHash))
            throw new InvalidOperationException("This mobile number is already registered. Please log in.");

        if (patient is null)
        {
            patient = new Patient
            {
                ClinicId = clinic.Id,
                Name = request.Name.Trim(),
                MobileNumber = mobile,
                Age = request.Age,
                Gender = request.Gender,
                VillageTownCity = request.VillageTownCity?.Trim() ?? string.Empty
            };
            await _patients.AddAsync(patient);
        }
        else
        {
            patient.Name = request.Name.Trim();
            if (request.Age > 0) patient.Age = request.Age;
            if (!string.IsNullOrWhiteSpace(request.VillageTownCity))
                patient.VillageTownCity = request.VillageTownCity.Trim();
            _patients.Update(patient);
        }

        patient.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);
        await _patients.SaveChangesAsync();

        var token = _tokens.CreatePatientToken(patient, clinic.Name);
        return new AuthResponse(token, patient.Id, patient.Name, mobile,
            UserRole.Patient, clinic.Id, clinic.Name);
    }

    public async Task<AuthResponse?> PatientLoginAsync(PatientLoginRequest request)
    {
        var mobile = request.MobileNumber.Trim();
        var patient = await _patients.Query()
            .Include(p => p.Clinic)
            .FirstOrDefaultAsync(p => p.MobileNumber == mobile && p.PasswordHash != null);

        if (patient is null || !BCrypt.Net.BCrypt.Verify(request.Password, patient.PasswordHash))
            return null;

        var clinicName = patient.Clinic?.Name ?? "Clinic";
        var token = _tokens.CreatePatientToken(patient, clinicName);
        return new AuthResponse(token, patient.Id, patient.Name, mobile,
            UserRole.Patient, patient.ClinicId, clinicName);
    }
}
