$tex = Get-Content "C:\Users\nguye\Desktop\web_coding_self_learn_html\resumeRefinement\resume-tailor\src\exampleLatexFiles\example1.tex" -Raw

$body = @{
    content = $tex
} | ConvertTo-Json

Invoke-RestMethod `
  -Uri "https://texapi.ovh/api/latex/compile" `
  -Method Post `
  -Headers @{
      "X-API-KEY" = "your-api-key-here"
      "Content-Type" = "application/json"
  } `
  -Body $body `
  -OutFile "result.json"
