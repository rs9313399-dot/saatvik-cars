$ErrorActionPreference = 'Stop'

$backupRoot = Join-Path $env:LOCALAPPDATA 'SaatvikCars\migration-backups'
New-Item -ItemType Directory -Path $backupRoot -Force | Out-Null

$acl = New-Object System.Security.AccessControl.DirectorySecurity
$acl.SetAccessRuleProtection($true, $false)
$identity = [System.Security.Principal.WindowsIdentity]::GetCurrent().Name
$rule = New-Object System.Security.AccessControl.FileSystemAccessRule(
    $identity,
    'FullControl',
    'ContainerInherit,ObjectInherit',
    'None',
    'Allow'
)
$acl.SetAccessRule($rule)
Set-Acl -LiteralPath $backupRoot -AclObject $acl

$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$backupFile = Join-Path $backupRoot "saatvik-cars-supabase-$stamp.json.dpapi"
if (Test-Path -LiteralPath $backupFile) {
    throw 'Backup already exists; refusing to overwrite it.'
}

$jsonLines = & node --env-file=.env scripts/export-db-snapshot.ts 2>$null
if ($LASTEXITCODE -ne 0) {
    throw 'Database export failed; no backup was written.'
}

$json = $jsonLines -join "`n"
$snapshot = $json | ConvertFrom-Json
if ($snapshot.schemaVersion -ne 1 -or $snapshot.source -ne 'supabase') {
    throw 'Export metadata validation failed; no backup was written.'
}

$secure = ConvertTo-SecureString -String $json -AsPlainText -Force
$encrypted = ConvertFrom-SecureString -SecureString $secure
Set-Content -LiteralPath $backupFile -Value $encrypted -Encoding ascii

$encryptedText = (Get-Content -LiteralPath $backupFile -Raw).Trim()
$recoveredSecure = ConvertTo-SecureString -String $encryptedText
$recoveredJson = [System.Net.NetworkCredential]::new('', $recoveredSecure).Password
$verified = $recoveredJson | ConvertFrom-Json
if ($verified.schemaVersion -ne 1 -or $verified.exportedAt -ne $snapshot.exportedAt) {
    throw 'Encrypted backup round-trip verification failed.'
}

$rowCounts = [ordered]@{}
foreach ($table in $verified.tables.PSObject.Properties) {
    $rowCounts[$table.Name] = @($table.Value).Count
}

[pscustomobject]@{
    Backup = $backupFile
    Encryption = 'Windows DPAPI, current Windows user'
    Verified = $true
    SHA256 = (Get-FileHash -LiteralPath $backupFile -Algorithm SHA256).Hash
    RowCounts = ($rowCounts | ConvertTo-Json -Compress)
}

$json = $null
$recoveredJson = $null
$secure = $null
$recoveredSecure = $null
