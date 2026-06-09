param([int]$tabId, [string]$selector, [string]$text, [switch]$clear)
$args = @{
    tabId = $tabId
    selector = $selector
    text = $text
    clear = $clear.IsPresent
}
$json = $args | ConvertTo-Json -Compress
$proc = Start-Process -FilePath "mavis" -ArgumentList "browser","tool","type",$json -NoNewWindow -Wait -PassThru
