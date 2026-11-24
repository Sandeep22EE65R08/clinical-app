namespace ClinicApp.Api.Domain.Enums;

public enum UserRole
{
    Admin = 0,
    Doctor = 1,
    Receptionist = 2,
    Nurse = 3,
    Staff = 4,
    // Self-service patient account (patient portal). Not a clinic staff member.
    Patient = 5
}

public enum Gender
{
    Male = 0,
    Female = 1,
    Other = 2
}

public enum VisitType
{
    NewConsultation = 0,
    FollowUp = 1,
    Emergency = 2,
    Other = 3
}

public enum PaymentStatus
{
    Paid = 0,
    Pending = 1,
    PartiallyPaid = 2
}

public enum PaymentMethod
{
    Cash = 0,
    Upi = 1,
    Card = 2,
    Other = 3
}

public enum AppointmentStatus
{
    Scheduled = 0,
    Waiting = 1,
    InConsultation = 2,
    Completed = 3,
    Cancelled = 4,
    NoShow = 5
}

// Live queue state for a patient's visit on the current day.
public enum VisitStatus
{
    Waiting = 0,
    InConsultation = 1,
    Completed = 2,
    Skipped = 3
}

public enum DoctorVerificationStatus
{
    Pending = 0,
    Verified = 1,
    Rejected = 2
}

public enum ExpenseCategory
{
    StaffSalary = 0,
    Rent = 1,
    Electricity = 2,
    MedicalSupplies = 3,
    Equipment = 4,
    Maintenance = 5,
    Other = 6
}
