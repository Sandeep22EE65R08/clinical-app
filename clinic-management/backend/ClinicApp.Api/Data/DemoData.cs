using ClinicApp.Api.Domain.Entities;
using ClinicApp.Api.Domain.Enums;

namespace ClinicApp.Api.Data;

// Generates recent sample data (doctors, patients, visits, expenses) for a clinic.
// Dates are always relative to "today" so dashboard trend charts look populated
// no matter when the clinic is created. Entities are added to the context but NOT
// saved here; the caller is responsible for SaveChanges within its own unit of work.
public static class DemoData
{
    private static readonly string[] Villages =
        { "Rampur", "Arrah", "Koilwar", "Bihta", "Danapur", "Maner" };
    private static readonly string[] Names =
    {
        "Ramesh Kumar", "Sunita Devi", "Ajay Kumar", "Ravi Kumar", "Meena Kumari",
        "Pooja Singh", "Amit Yadav", "Geeta Devi",
    };

    public static void Populate<T>(T db, Guid clinicId, Guid adminUserId)
        where T : ApplicationDbContext
    {
        var rnd = new Random(clinicId.GetHashCode());

        var drSharma = new User
        {
            ClinicId = clinicId, Name = "Dr. Sharma", Username = $"sharma_{Suffix(clinicId)}",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("doctor123"), Role = UserRole.Doctor,
            ConsultationFee = 500, Specialization = "General Physician",
        };
        var drKumar = new User
        {
            ClinicId = clinicId, Name = "Dr. Kumar", Username = $"kumar_{Suffix(clinicId)}",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("doctor123"), Role = UserRole.Doctor,
            ConsultationFee = 400, Specialization = "Dentist",
        };
        db.Users.AddRange(drSharma, drKumar);

        var patients = new List<Patient>();
        for (var i = 0; i < Names.Length; i++)
        {
            patients.Add(new Patient
            {
                ClinicId = clinicId, Name = Names[i],
                MobileNumber = $"9{rnd.Next(100000000, 999999999)}",
                Age = 22 + rnd.Next(0, 50),
                Gender = i % 2 == 0 ? Gender.Male : Gender.Female,
                VillageTownCity = Villages[i % Villages.Length],
            });
        }
        db.Patients.AddRange(patients);

        var today = DateOnly.FromDateTime(DateTime.Now);
        var token = 1;
        for (var d = 0; d < 10; d++)
        {
            var day = today.AddDays(-d);
            var dayCount = rnd.Next(2, 7);
            for (var j = 0; j < dayCount; j++)
            {
                var patient = patients[rnd.Next(patients.Count)];
                var doctor = j % 2 == 0 ? drSharma : drKumar;
                var fee = doctor.ConsultationFee ?? 500;
                var paid = rnd.Next(0, 6) == 0 ? 0 : fee;
                db.PatientVisits.Add(new PatientVisit
                {
                    ClinicId = clinicId, PatientId = patient.Id, DoctorId = doctor.Id,
                    VisitDate = day, VisitTime = new TimeOnly(9 + (j % 9), rnd.Next(0, 59)),
                    VisitType = j % 3 == 0 ? VisitType.FollowUp : VisitType.NewConsultation,
                    ConsultationFee = fee, AmountPaid = paid,
                    PaymentStatus = paid >= fee ? PaymentStatus.Paid : PaymentStatus.Pending,
                    PaymentMethod = (PaymentMethod)(j % 3),
                    TokenNumber = d == 0 ? token++ : j + 1,
                });
            }
        }

        // A couple of recent expenses so the Expenses page has data too.
        db.Expenses.AddRange(
            new Expense
            {
                ClinicId = clinicId, ExpenseDate = today.AddDays(-2),
                Category = ExpenseCategory.Rent, Amount = 8000, Note = "Monthly rent",
                CreatedBy = adminUserId,
            },
            new Expense
            {
                ClinicId = clinicId, ExpenseDate = today.AddDays(-1),
                Category = ExpenseCategory.MedicalSupplies, Amount = 2500, Note = "Supplies",
                CreatedBy = adminUserId,
            });
    }

    // Short unique suffix so demo doctor usernames stay globally unique.
    private static string Suffix(Guid clinicId) => clinicId.ToString("N")[..6];
}
