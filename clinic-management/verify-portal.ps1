$base = "http://localhost:5079/api"
function J($o) { $o | ConvertTo-Json -Depth 6 }

try {
  # 1) Public clinic directory (anonymous)
  $clinics = Invoke-RestMethod -Uri "$base/auth/clinics"
  $clinic = $clinics | Select-Object -First 1
  Write-Output "CLINICS: count=$($clinics.Count) first=$($clinic.name)"

  # 2) Patient self-registration under the chosen clinic
  $mobile = "9" + (Get-Random -Minimum 100000000 -Maximum 999999999)
  $reg = @{ clinicId=$clinic.id; name="Test Patient"; mobileNumber=$mobile; password="patient123";
            age=30; gender="Male"; villageTownCity="Rampur" } | ConvertTo-Json
  $r = Invoke-RestMethod -Uri "$base/auth/patient/register" -Method Post -ContentType "application/json" -Body $reg
  Write-Output "PATIENT REGISTER OK: name=$($r.name) role=$($r.role) clinic=$($r.clinicName)"

  # Patient login
  $login = Invoke-RestMethod -Uri "$base/auth/patient/login" -Method Post -ContentType "application/json" `
    -Body (@{ mobileNumber=$mobile; password="patient123" } | ConvertTo-Json)
  Write-Output "PATIENT LOGIN OK: name=$($login.name) role=$($login.role) clinic=$($login.clinicName)"
  $h = @{ Authorization = "Bearer $($login.token)" }

  # 3) Profile + doctor directory
  $me = Invoke-RestMethod -Uri "$base/portal/me" -Headers $h
  Write-Output "PROFILE: $($me.name) mobile=$($me.mobileNumber) clinic=$($me.clinicName)"
  $docs = Invoke-RestMethod -Uri "$base/portal/doctors" -Headers $h
  Write-Output "DOCTORS: count=$($docs.Count) first=$($docs[0].name) ($($docs[0].specialization))"

  # 4) Book an appointment
  $date = (Get-Date).AddDays(2).ToString("yyyy-MM-dd")
  $body = @{ doctorId=$docs[0].id; scheduledDate=$date; scheduledTime="10:30:00"; reason="Fever check" } | ConvertTo-Json
  $appt = Invoke-RestMethod -Uri "$base/portal/appointments" -Method Post -Headers $h -ContentType "application/json" -Body $body
  Write-Output "BOOKED: id=$($appt.id) with=$($appt.doctorName) on=$($appt.scheduledDate) status=$($appt.status)"

  # 5) List own appointments + notifications
  $appts = Invoke-RestMethod -Uri "$base/portal/appointments" -Headers $h
  Write-Output "MY APPOINTMENTS: count=$($appts.Count)"
  $notif = Invoke-RestMethod -Uri "$base/portal/notifications" -Headers $h
  Write-Output "NOTIFICATIONS: unread=$($notif.unreadCount) items=$($notif.items.Count)"
  $notif.items | Select-Object -First 4 | ForEach-Object { Write-Output ("  - [{0}] {1} :: {2}" -f $_.severity, $_.title, $_.message) }

  # 6) ISOLATION: patient token must be blocked from staff endpoints
  foreach ($ep in @("patients","appointments","reports/daily","analytics","clinic","queue")) {
    try {
      Invoke-RestMethod -Uri "$base/$ep" -Headers $h | Out-Null
      Write-Output "LEAK! patient could read /$ep"
    } catch {
      Write-Output ("BLOCKED /{0} -> {1}" -f $ep, $_.Exception.Response.StatusCode.value__)
    }
  }
  Write-Output "ALL DONE"
} catch {
  Write-Output "ERR: $($_.Exception.Message)"
}
