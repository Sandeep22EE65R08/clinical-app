using ClinicApp.Api.Domain.Entities;
using ClinicApp.Api.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace ClinicApp.Api.Data;

public static class DbSeeder
{
    // Always applies migrations. The demo clinic (with well-known demo passwords) is only
    // created when seedDemoData is true (config key "SeedDemoData"); it is OFF by default
    // so production starts empty and users create their own clinic via /register.
    public static async Task SeedAsync(ApplicationDbContext db, bool seedDemoData = false)
    {
        await db.Database.MigrateAsync();
        if (!seedDemoData) return;
        if (await db.Clinics.AnyAsync()) return;

        var clinic = new Clinic
        {
            Name = "ABC Clinic",
            Address = "Main Road, Arrah, Bihar",
            Phone = "9876543210",
            DefaultConsultationFee = 500,
            WorkingHours = "9:00 AM - 8:00 PM"
        };
        db.Clinics.Add(clinic);

        string Hash(string p) => BCrypt.Net.BCrypt.HashPassword(p);

        var admin = new User
        {
            ClinicId = clinic.Id, Name = "Clinic Admin", Username = "admin",
            PasswordHash = Hash("admin123"), Role = UserRole.Admin
        };
        var drSharma = new User
        {
            ClinicId = clinic.Id, Name = "Dr. Sharma", Username = "sharma",
            PasswordHash = Hash("doctor123"), Role = UserRole.Doctor,
            ConsultationFee = 500, Specialization = "General Physician"
        };
        var drKumar = new User
        {
            ClinicId = clinic.Id, Name = "Dr. Kumar", Username = "kumar",
            PasswordHash = Hash("doctor123"), Role = UserRole.Doctor,
            ConsultationFee = 400, Specialization = "Dentist"
        };
        var reception = new User
        {
            ClinicId = clinic.Id, Name = "Reception Desk", Username = "reception",
            PasswordHash = Hash("reception123"), Role = UserRole.Receptionist
        };
        db.Users.AddRange(admin, drSharma, drKumar, reception);

        var villages = new[] { "Rampur", "Arrah", "Koilwar", "Bihta", "Rampur" };
        var names = new[] { "Ramesh Kumar", "Sunita Devi", "Ajay Kumar", "Ravi Kumar", "Meena Kumari" };
        var rnd = new Random(7);
        var patients = new List<Patient>();
        for (var i = 0; i < names.Length; i++)
        {
            patients.Add(new Patient
            {
                ClinicId = clinic.Id, Name = names[i], MobileNumber = $"98765000{i:00}",
                Age = 25 + i * 5, Gender = i % 2 == 0 ? Gender.Male : Gender.Female,
                VillageTownCity = villages[i],
                // Demo patient-portal login: mobile 9876500000 / patient123
                PasswordHash = i == 0 ? Hash("patient123") : null
            });
        }
        db.Patients.AddRange(patients);

        var today = DateOnly.FromDateTime(DateTime.Now);
        var token = 1;
        for (var d = 0; d < 7; d++)
        {
            var day = today.AddDays(-d);
            var dayCount = rnd.Next(3, 6);
            for (var j = 0; j < dayCount; j++)
            {
                var patient = patients[rnd.Next(patients.Count)];
                var doctor = j % 2 == 0 ? drSharma : drKumar;
                var fee = doctor.ConsultationFee ?? 500;
                var paid = rnd.Next(0, 5) == 0 ? 0 : fee;
                db.PatientVisits.Add(new PatientVisit
                {
                    ClinicId = clinic.Id, PatientId = patient.Id, DoctorId = doctor.Id,
                    VisitDate = day, VisitTime = new TimeOnly(10 + j, rnd.Next(0, 59)),
                    VisitType = j % 3 == 0 ? VisitType.FollowUp : VisitType.NewConsultation,
                    ConsultationFee = fee, AmountPaid = paid,
                    PaymentStatus = paid >= fee ? PaymentStatus.Paid : PaymentStatus.Pending,
                    PaymentMethod = j % 2 == 0 ? PaymentMethod.Cash : PaymentMethod.Upi,
                    TokenNumber = d == 0 ? token++ : j + 1
                });
            }
        }

        await db.SaveChangesAsync();
    }
}
