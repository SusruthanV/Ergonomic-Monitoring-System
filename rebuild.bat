@echo off
echo Rebuilding ErgoGuard frontend...
docker compose down
docker compose build --no-cache frontend
docker compose up -d
echo.
echo Done! Refresh http://localhost:3000
pause
