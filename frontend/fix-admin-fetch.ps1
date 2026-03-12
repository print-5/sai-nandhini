# PowerShell script to add credentials: "include" to fetch calls in admin pages

$adminPath = "src/app/admin"
$files = Get-ChildItem -Path $adminPath -Recurse -Filter "*.tsx" -File

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $modified = $false
    
    # Pattern 1: fetch with just URL (no options)
    # fetch("/api/admin/something") -> fetch("/api/admin/something", { credentials: "include" })
    if ($content -match 'fetch\s*\(\s*["`'']\/api\/admin[^)]*["`'']\s*\)') {
        $content = $content -replace 'fetch\s*\(\s*(["`'']\/api\/admin[^)]*["`''])\s*\)', 'fetch($1, { credentials: "include" })'
        $modified = $true
    }
    
    # Pattern 2: fetch with options but no credentials
    # fetch("/api/admin/something", { method: "POST" }) -> add credentials
    if ($content -match 'fetch\s*\(\s*["`'']\/api\/admin[^)]*["`'']\s*,\s*\{[^}]*\}') {
        # Only add if credentials is not already present
        if ($content -notmatch 'credentials\s*:\s*["`'']include["`'']') {
            $content = $content -replace '(fetch\s*\(\s*["`'']\/api\/admin[^)]*["`'']\s*,\s*\{)([^}]*)\}', '$1$2, credentials: "include" }'
            $modified = $true
        }
    }
    
    if ($modified) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "Updated: $($file.FullName)" -ForegroundColor Green
    }
}

Write-Host "`nDone! All admin fetch calls have been updated." -ForegroundColor Cyan
