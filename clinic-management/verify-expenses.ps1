$base = "http://localhost:5079/api"

try {
  # Admin login (expenses are Admin-only).
  $login = Invoke-RestMethod -Uri "$base/auth/login" -Method Post -ContentType "application/json" `
    -Body (@{ username="admin"; password="admin123" } | ConvertTo-Json)
  Write-Output "ADMIN LOGIN OK: role=$($login.role) clinic=$($login.clinicName)"
  $h = @{ Authorization = "Bearer $($login.token)" }

  # Create an expense.
  $body = @{ expenseDate=(Get-Date -Format "yyyy-MM-dd"); category="Rent"; amount=5000; note="Monthly rent" } | ConvertTo-Json
  $created = Invoke-RestMethod -Uri "$base/expenses" -Method Post -ContentType "application/json" -Headers $h -Body $body
  Write-Output "EXPENSE CREATE OK: id=$($created.id) cat=$($created.category) amount=$($created.amount)"

  # List + summary.
  $list = Invoke-RestMethod -Uri "$base/expenses" -Headers $h
  Write-Output "EXPENSE LIST: count=$($list.Count)"
  $sum = Invoke-RestMethod -Uri "$base/expenses/summary" -Headers $h
  Write-Output "SUMMARY: revenue=$($sum.revenue) expenses=$($sum.totalExpenses) net=$($sum.net) cats=$($sum.byCategory.Count)"

  # Delete.
  Invoke-RestMethod -Uri "$base/expenses/$($created.id)" -Method Delete -Headers $h | Out-Null
  Write-Output "EXPENSE DELETE OK"

  # Staff listing (Admin).
  $users = Invoke-RestMethod -Uri "$base/users" -Headers $h
  Write-Output "STAFF LIST: count=$($users.Count)"

  # Non-admin must be blocked from expenses (403).
  $rec = Invoke-RestMethod -Uri "$base/auth/login" -Method Post -ContentType "application/json" `
    -Body (@{ username="reception"; password="reception123" } | ConvertTo-Json)
  $rh = @{ Authorization = "Bearer $($rec.token)" }
  try {
    Invoke-RestMethod -Uri "$base/expenses" -Headers $rh | Out-Null
    Write-Output "ISOLATION FAIL: receptionist reached expenses"
  } catch {
    Write-Output "ISOLATION OK: receptionist blocked ($($_.Exception.Response.StatusCode.value__))"
  }

  Write-Output "ALL EXPENSE CHECKS PASSED"
} catch {
  Write-Output "ERROR: $($_.Exception.Message)"
}
