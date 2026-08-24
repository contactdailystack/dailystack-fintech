try {
    $excel = New-Object -ComObject Excel.Application
    $excel.Visible = $false
    $excel.DisplayAlerts = $false
    
    $wb = $excel.Workbooks.Open("C:\Users\Pick\Downloads\2026-06-01 ~ 06-30.xlsx")
    
    Write-Host "Sheets: $($wb.Sheets.Count)"
    
    foreach ($sheet in $wb.Sheets) {
        Write-Host "`n=== Sheet: $($sheet.Name) ==="
        
        $usedRange = $sheet.UsedRange
        $rowCount = $usedRange.Rows.Count
        $colCount = $usedRange.Columns.Count
        
        Write-Host "Rows: $rowCount, Cols: $colCount"
        
        # Print first 10 rows
        for ($r = 1; $r -le [Math]::Min(15, $rowCount); $r++) {
            $rowData = @()
            for ($c = 1; $c -le [Math]::Min($colCount, 8); $c++) {
                $cellValue = $sheet.Cells.Item($r, $c).Text
                $rowData += $cellValue
            }
            Write-Host ($rowData -join " | ")
        }
    }
    
    $wb.Close($false)
    $excel.Quit()
    [System.Runtime.Interopservices.Marshal]::ReleaseComObject($excel) | Out-Null
}
catch {
    Write-Host "Error: $_"
}
