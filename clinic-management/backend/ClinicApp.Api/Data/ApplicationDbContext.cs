using ClinicApp.Api.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace ClinicApp.Api.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

    public DbSet<Clinic> Clinics => Set<Clinic>();
    public DbSet<User> Users => Set<User>();
    public DbSet<Patient> Patients => Set<Patient>();
    public DbSet<PatientVisit> PatientVisits => Set<PatientVisit>();
    public DbSet<Appointment> Appointments => Set<Appointment>();
    public DbSet<Expense> Expenses => Set<Expense>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();
    public DbSet<Facility> Facilities => Set<Facility>();
    public DbSet<Department> Departments => Set<Department>();
    public DbSet<DoctorProfile> DoctorProfiles => Set<DoctorProfile>();
    public DbSet<DoctorDepartment> DoctorDepartments => Set<DoctorDepartment>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        base.OnModelCreating(b);

        b.Entity<User>(e =>
        {
            e.HasIndex(x => x.Username).IsUnique();
            e.Property(x => x.ConsultationFee).HasColumnType("numeric(10,2)");
        });

        b.Entity<Patient>(e =>
        {
            e.HasIndex(x => new { x.ClinicId, x.MobileNumber });
            e.HasIndex(x => x.Name);
            e.HasIndex(x => x.VillageTownCity);
            e.HasMany(x => x.Visits).WithOne(v => v.Patient!).HasForeignKey(v => v.PatientId);
        });

        b.Entity<PatientVisit>(e =>
        {
            e.Property(x => x.ConsultationFee).HasColumnType("numeric(10,2)");
            e.Property(x => x.AmountPaid).HasColumnType("numeric(10,2)");
            e.HasIndex(x => new { x.ClinicId, x.VisitDate });
            e.HasOne(x => x.Doctor).WithMany(u => u.Visits).HasForeignKey(x => x.DoctorId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        b.Entity<Clinic>(e =>
        {
            e.Property(x => x.DefaultConsultationFee).HasColumnType("numeric(10,2)");
        });

        b.Entity<Appointment>(e =>
        {
            e.HasIndex(x => new { x.ClinicId, x.ScheduledDate });
            e.HasOne(x => x.Patient).WithMany().HasForeignKey(x => x.PatientId)
                .OnDelete(DeleteBehavior.Cascade);
            e.HasOne(x => x.Doctor).WithMany().HasForeignKey(x => x.DoctorId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        b.Entity<Facility>(e => e.HasIndex(x => x.ClinicId));

        b.Entity<Department>(e =>
        {
            e.HasIndex(x => new { x.ClinicId, x.Name }).IsUnique();
            e.HasOne(x => x.Facility).WithMany().HasForeignKey(x => x.FacilityId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        b.Entity<DoctorProfile>(e => e.HasIndex(x => x.UserId).IsUnique());

        b.Entity<DoctorDepartment>(e =>
        {
            e.HasKey(x => new { x.UserId, x.DepartmentId });
            e.HasOne(x => x.User).WithMany().HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(x => x.Department).WithMany(d => d.Doctors).HasForeignKey(x => x.DepartmentId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        b.Entity<Expense>(e =>
        {
            e.Property(x => x.Amount).HasColumnType("numeric(12,2)");
            e.HasIndex(x => new { x.ClinicId, x.ExpenseDate });
        });
    }

    public override int SaveChanges()
    {
        TouchTimestamps();
        return base.SaveChanges();
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        TouchTimestamps();
        return base.SaveChangesAsync(cancellationToken);
    }

    private void TouchTimestamps()
    {
        foreach (var entry in ChangeTracker.Entries<BaseEntity>())
        {
            if (entry.State == EntityState.Modified)
                entry.Entity.UpdatedAt = DateTime.UtcNow;
        }
    }
}
