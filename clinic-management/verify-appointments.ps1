$base = "http://localhost:5079/api"
try {
  $adm = Invoke-RestMethod -Uri "$base/auth/login" -Method Post -ContentType "application/json" -Body '{"username":"admin","password":"admin123"}'
  $h = @{ Authorization = "Bearer $($adm.token)" }

  # Analytics (the earlier 500 fix)
  $an = Invoke-RestMethod -Uri "$base/analytics" -Headers $h
  Write-Output "ANALYTICS OK: total=$($an.totalPatients) today=$($an.patientsToday) week=$($an.patientsThisWeek) locations=$($an.topLocations.Count)"

  # Pick a patient + doctor to create an appointment
  $patients = Invoke-RestMethod -Uri "$base/patients" -Headers $h
  $doctors = Invoke-RestMethod -Uri "$base/users/doctors" -Headers $h
  $patientId = $patients[0].id
  $doctorId = $doctors[0].id
  $today = (Get-Date).ToString("yyyy-MM-dd")

  $apptBody = @{ patientId=$patientId; doctorId=$doctorId; scheduledDate=$today; scheduledTime="10:30:00"; reason="Fever review" } | ConvertTo-Json
  $appt = Invoke-RestMethod -Uri "$base/appointments" -Method Post -Headers $h -ContentType "application/json" -Body $apptBody
  Write-Output "APPOINTMENT CREATED: id=$($appt.id) patient=$($appt.patientName) status=$($appt.status) time=$($appt.scheduledTime)"

  $list = Invoke-RestMethod -Uri "$base/appointments?from=$today&to=$today" -Headers $h
  Write-Output "APPOINTMENTS TODAY: count=$($list.Count)"

  $upd = Invoke-RestMethod -Uri "$base/appointments/$($appt.id)/status" -Method Put -Headers $h -ContentType "application/json" -Body '{"status":"Completed"}'
  Write-Output "APPOINTMENT STATUS UPDATED: $($upd.status)"

  # Queue
  $q0 = Invoke-RestMethod -Uri "$base/queue" -Headers $h
  Write-Output "QUEUE INITIAL: nowServing=$($q0.nowServing.tokenNumber) waiting=$($q0.waitingCount) completed=$($q0.completed.Count)"

  $q1 = Invoke-RestMethod -Uri "$base/queue/call-next" -Method Post -Headers $h
  Write-Output "QUEUE AFTER CALL-NEXT: nowServing=$($q1.nowServing.tokenNumber) ($($q1.nowServing.patientName)) waiting=$($q1.waitingCount)"

  if ($q1.nowServing) {
    $q2 = Invoke-RestMethod -Uri "$base/queue/$($q1.nowServing.visitId)/complete" -Method Post -Headers $h
    Write-Output "QUEUE AFTER COMPLETE: nowServing=$($q2.nowServing.tokenNumber) completed=$($q2.completed.Count)"
  }

  # Notifications (should now include appointment/follow-up types)
  $notif = Invoke-RestMethod -Uri "$base/notifications" -Headers $h
  Write-Output "NOTIFICATIONS: unread=$($notif.unreadCount) items=$($notif.items.Count)"
  $notif.items | ForEach-Object { Write-Output ("  - [{0}] {1}" -f $_.type, $_.title) }

  Write-Output "ALL GOOD"
} catch {
  Write-Output "ERR: $($_.Exception.Message)"
  if ($_.ErrorDetails) { Write-Output $_.ErrorDetails.Message }
}
