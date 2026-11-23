namespace ClinicApp.Api.DTOs;

// One selectable symptom in the public "Find care" flow.
public record SymptomDto(string Id, string Label, string LabelHi, string Department);

// A suggested medical department. Keyword is matched against doctors' Specialization.
public record DepartmentSuggestionDto(string Department, string Keyword);

// Result of the symptom -> department guidance. This is NOT a diagnosis.
public record TriageDto(
    bool IsEmergency,
    string? EmergencyMessage,
    List<DepartmentSuggestionDto> Departments,
    string Disclaimer);

public record DiscoverDoctorDto(Guid Id, string Name, string? Specialization, decimal? ConsultationFee);

public record DiscoverClinicDto(
    Guid Id,
    string Name,
    string Address,
    string? Phone,
    string? WorkingHours,
    decimal DefaultConsultationFee,
    List<DiscoverDoctorDto> Doctors);

public record DiscoverResultDto(TriageDto Triage, List<DiscoverClinicDto> Clinics);
