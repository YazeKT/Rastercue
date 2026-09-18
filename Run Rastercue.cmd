@echo off
if exist "%~dp0dist\win-unpacked\Rastercue.exe" (
  start "" "%~dp0dist\win-unpacked\Rastercue.exe"
) else (
  echo Build a local Windows candidate first. See docs\DEVELOPMENT.md.
  pause
)
