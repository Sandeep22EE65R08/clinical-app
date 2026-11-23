using ClinicApp.Api.DTOs;

namespace ClinicApp.Api.Services;

// Maps symptoms to a medical department and flags emergency warning signs.
// IMPORTANT: this is guidance for choosing where to go, never a diagnosis. The tables
// below are deliberately plain data so a doctor can review and change them.
public static class SymptomGuide
{
    public const string Disclaimer =
        "This is not a diagnosis. It only suggests which type of doctor to see. " +
        "If you feel very unwell, go to the nearest hospital.";

    public const string EmergencyMessage =
        "These can be warning signs of a medical emergency. Call 112 or go to the nearest " +
        "hospital emergency department now. Do not wait for an appointment.";

    // Id, English label, Hindi label, department, keyword matched against doctor specialization,
    // and extra words (English/Hindi/Hinglish) used to recognise the symptom in free text.
    private record Entry(string Id, string Label, string LabelHi, string Department, string Keyword,
        bool Emergency, string[] Words);

    private static readonly Entry[] Entries =
    {
        new("fever", "Fever", "बुखार", "General Medicine", "general", false, new[] { "fever", "bukhar", "बुखार", "temperature" }),
        new("headache", "Headache", "सिरदर्द", "General Medicine", "general", false, new[] { "headache", "sir dard", "sardard", "सिरदर्द", "सिर दर्द" }),
        new("cough", "Cough", "खांसी", "General Medicine", "general", false, new[] { "cough", "khansi", "खांसी", "cold" }),
        new("stomach", "Stomach pain", "पेट दर्द", "General Medicine", "general", false, new[] { "stomach", "pet dard", "पेट दर्द", "vomit", "loose motion", "diarrhea" }),
        new("chest", "Chest discomfort", "सीने में बेचैनी", "Cardiology", "cardio", true, new[] { "chest", "seene", "सीने", "heart" }),
        new("skin", "Skin problems", "त्वचा की समस्या", "Dermatology", "dermat", false, new[] { "skin", "rash", "itch", "khujli", "त्वचा", "खुजली" }),
        new("joint", "Joint pain", "जोड़ों का दर्द", "Orthopedics", "ortho", false, new[] { "joint", "knee", "back pain", "jodo", "घुटने", "जोड़" }),
        new("eye", "Eye problems", "आँखों की समस्या", "Ophthalmology", "eye", false, new[] { "eye", "aankh", "आँख", "आंख" }),
        new("tooth", "Toothache", "दांत दर्द", "Dental", "dent", false, new[] { "tooth", "teeth", "dant", "दांत", "gum" }),
    };

    // Free-text phrases that always trigger urgent-care guidance.
    private static readonly string[] EmergencyPhrases =
    {
        "chest pain", "pain in chest", "breathless", "breathing", "cannot breathe", "can't breathe", "short of breath",
        "stroke", "paralysis", "face drooping", "slurred speech", "unconscious", "fainted", "not responding",
        "seizure", "fits", "heavy bleeding", "bleeding a lot", "poison", "overdose", "suicid", "snake bite",
        "सांस", "साँस", "सीने में दर्द", "बेहोश", "दौरा", "लकवा", "खून बह", "ज़हर", "जहर", "सांप",
        "saans", "seene mein dard", "behosh", "lakwa",
    };

    public static List<SymptomDto> Catalog() =>
        Entries.Select(e => new SymptomDto(e.Id, e.Label, e.LabelHi, e.Department)).ToList();

    public static TriageDto Triage(IEnumerable<string>? symptomIds, string? text)
    {
        var ids = new HashSet<string>(symptomIds ?? Enumerable.Empty<string>(), StringComparer.OrdinalIgnoreCase);
        var lowered = (text ?? string.Empty).ToLowerInvariant();

        // Recognise symptoms typed as free text (English / Hindi / Hinglish).
        if (lowered.Length > 0)
            foreach (var e in Entries)
                if (e.Words.Any(w => lowered.Contains(w))) ids.Add(e.Id);

        var matched = Entries.Where(e => ids.Contains(e.Id)).ToList();
        var emergency = matched.Any(e => e.Emergency) ||
                        EmergencyPhrases.Any(p => lowered.Contains(p));

        var departments = matched
            .GroupBy(e => e.Department)
            .Select(g => new DepartmentSuggestionDto(g.Key, g.First().Keyword))
            .ToList();

        return new TriageDto(emergency, emergency ? EmergencyMessage : null, departments, Disclaimer);
    }
}
