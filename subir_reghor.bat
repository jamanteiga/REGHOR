@echo off
setlocal

set "REPO_DIR=C:\Users\jaman\Documents\PROYECTOS\REGHOR"
set "REPO_URL=https://github.com/jamanteiga/REGHOR.git"
set "LOG_FILE=%~dp0subir_reghor_log.txt"

echo ===== %date% %time% ===== > "%LOG_FILE%"

if not exist "%REPO_DIR%" (
    echo ERROR: no existe la carpeta %REPO_DIR% >> "%LOG_FILE%"
    goto FIN
)

cd /d "%REPO_DIR%"
if errorlevel 1 (
    echo ERROR: no se pudo entrar en %REPO_DIR% >> "%LOG_FILE%"
    goto FIN
)

if not exist ".git" (
    echo Esta carpeta aun no es un repositorio git. Inicializando... >> "%LOG_FILE%"
    git init >> "%LOG_FILE%" 2>&1
    git branch -M main >> "%LOG_FILE%" 2>&1
    git remote add origin "%REPO_URL%" >> "%LOG_FILE%" 2>&1
) else (
    git remote get-url origin >nul 2>&1
    if errorlevel 1 (
        git remote add origin "%REPO_URL%" >> "%LOG_FILE%" 2>&1
    )
)

echo Preparando todos los ficheros de %REPO_DIR%... >> "%LOG_FILE%"
git add -A >> "%LOG_FILE%" 2>&1

git diff --cached --quiet
if errorlevel 1 (
    echo Creando commit... >> "%LOG_FILE%"
    git commit -m "Actualizacion automatica REGHOR %date% %time%" >> "%LOG_FILE%" 2>&1
) else (
    echo No hay cambios nuevos respecto al ultimo commit local. >> "%LOG_FILE%"
)

echo Subiendo todo a GitHub (esta copia local manda: sobrescribe lo que hubiera en GitHub)... >> "%LOG_FILE%"
git push origin main --force >> "%LOG_FILE%" 2>&1
if errorlevel 1 (
    echo ERROR al subir a GitHub ^(git push^). Puede que haga falta iniciar sesion una vez a mano. >> "%LOG_FILE%"
    goto FIN
)
echo Subida completada correctamente. >> "%LOG_FILE%"

:FIN
echo ===== Fin: %date% %time% ===== >> "%LOG_FILE%"
endlocal
exit