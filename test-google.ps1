$json = '{"url": "https://google.com", "active": true}'
$mavisArgs = @('browser', 'tool', 'open_tab', $json)
& 'C:\Users\Pick\.mavis\bin\mavis.cmd' $mavisArgs
