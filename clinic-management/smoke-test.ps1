$base = "http://localhost:5079/api"
$login = Invoke-RestMethod -Uri "$base/auth/login" -Method Post -ContentType "application/json" `
  -Body '{"username":"reception","password":"reception123"}'
$h = @{ Authorization = "Bearer $($login.token)" }

$dash = Invoke-RestMethod -Uri "$base/dashboard" -Headers $h
Write-Output "DASHBOARD: patientsToday=$($dash.patientsToday) collection=$($dash.collectionToday) pending=$($dash.pendingToday)"

$patients = Invoke-RestMethod -Uri "$base/patients" -Headers $h
Write-Output "PATIENTS: count=$($patients.Count) first=$($patients[0].name) / $($patients[0].villageTownCity)"

$body = @{
  patient = @{ name = "Test Rogi"; mobileNumber = "9000000123"; age = 33; gender = "Male"; villageTownCity = "Rampur" }
  doctorId = $null; visitType = "NewConsultation"; consultationFee = 500; amountPaid = 500
  paymentStatus = "Paid"; paymentMethod = "Cash"
} | ConvertTo-Json
$qr = Invoke-RestMethod -Uri "$base/visits/quick-register" -Method Post -ContentType "application/json" -Headers $h -Body $body
Write-Output "QUICK-REGISTER: token=$($qr.visit.tokenNumber) patient=$($qr.patient.name) doctor=$($qr.visit.doctorName)"

$today = Invoke-RestMethod -Uri "$base/visits/today" -Headers $h
Write-Output "TODAY: visits=$($today.Count)"

$daily = Invoke-RestMethod -Uri "$base/reports/daily" -Headers $h
Write-Output "DAILY REPORT: patients=$($daily.patients) total=$($daily.totalCollection) cash=$($daily.cash) upi=$($daily.upi)"

# Receptionist must NOT see analytics (Admin/Doctor only) -> expect 403
try { Invoke-RestMethod -Uri "$base/analytics" -Headers $h | Out-Null; Write-Output "ANALYTICS: UNEXPECTED ACCESS" }
catch { Write-Output "ANALYTICS (receptionist) correctly blocked: $($_.Exception.Response.StatusCode.value__)" }

Write-Output "ALL SMOKE TESTS DONE"
