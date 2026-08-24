[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

try {
    $excel = New-Object -ComObject Excel.Application
    $excel.Visible = $false
    $excel.DisplayAlerts = $false
    $excel.AutomationSecurity = 3  # msoAutomationSecurityForceDisable
    
    $wb = $excel.Workbooks.Open("C:\Users\Pick\Downloads\2026-06-01 ~ 06-30.xlsx")
    
    Write-Host "Sheets: $($wb.Sheets.Count)"
    
    foreach ($sheet in $wb.Sheets) {
        Write-Host "`n=== Sheet: $($sheet.Name) ==="
        
        $usedRange = $sheet.UsedRange
        $rowCount = $usedRange.Rows.Count
        $colCount = $usedRange.Columns.Count
        
        Write-Host "Rows: $rowCount, Cols: $colCount"
        
        # Get headers
        $headers = @()
        for ($c = 1; $c -le $colCount; $c++) {
            $headers += $sheet.Cells.Item(1, $c).Text
        }
        Write-Host "Headers: $($headers -join ', ')"
        
        # Print all rows
        $allData = @()
        for ($r = 2; $r -le $rowCount; $r++) {
            $rowData = @()
            for ($c = 1; $c -le $colCount; $c++) {
                $cellValue = $sheet.Cells.Item($r, $c).Text
                $rowData += $cellValue
            }
            $allData += [PSCustomObject]@{
                Col1 = $rowData[0]
                Col2 = $rowData[1]
                Col3 = $rowData[2]
                Col4 = $rowData[3]
                Col5 = $rowData[4]
                Col6 = $rowData[5]
                Col7 = $rowData[6]
                Col8 = $rowData[7]
                Col9 = $rowData[8]
                Col10 = $rowData[9]
                Col11 = $rowData[10]
            }
        }
        
        # Export to CSV with UTF-8 BOM
        $csvPath = "D:\Coding Folder\dailystack-fintech\june-transactions.csv"
        $allData | Export-Csv -Path $csvPath -Encoding UTF8 -NoTypeInformation
        Write-Host "`nExported to: $csvPath"
        Write-Host "Total transactions: $($allData.Count)"
        
        # Summary
        $totalAmount = 0
        foreach ($row in $allData) {
            $amount = 0
            if ($row.Col6 -match '[\d,]+') {
                $amount = [double]($row.Col6 -replace ',', '')
                $totalAmount += $amount
            }
        }
        Write-Host "Total spending: $totalAmount THB"
    }
    
    $wb.Close($false)
    $excel.Quit()
    [System.Runtime.Interopservices.Marshal]::ReleaseComObject($excel) | Out-Null
}
catch {
    Write-Host "Error: $_"
}
