namespace ClinicApp.Api.Domain.Entities;

public class Clinic : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public decimal DefaultConsultationFee { get; set; } = 500;
    public string? WorkingHours { get; set; }

    // Whether the clinic and its doctors appear in the public "Find care" search.
    public bool IsListedPublicly { get; set; } = true;

    public ICollection<User> Users { get; set; } = new List<User>();
    public ICollection<Patient> Patients { get; set; } = new List<Patient>();
}
