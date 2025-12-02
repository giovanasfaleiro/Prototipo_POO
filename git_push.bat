@echo off
echo ========================================
echo Configurando Git e fazendo push
echo ========================================
echo.

cd /d "%~dp0"

echo Configurando usuario Git...
git config user.name "Júlia Júnior"
git config user.email "albuja@discente.ufg.br"
echo.

echo Verificando se Git esta inicializado...
if not exist .git (
    echo Inicializando repositorio Git...
    git init
)

echo.
echo Adicionando todos os arquivos...
git add .

echo.
echo Verificando status...
git status

echo.
echo Fazendo commit...
git commit -m "atualização final"

echo.
echo Configurando remote...
git remote remove origin 2>nul
git remote add origin https://github.com/giovanasfaleiro/Prototipo_POO.git

echo.
echo Renomeando branch para main...
git branch -M main

echo.
echo Fazendo push para GitHub...
echo NOTA: Voce precisara autenticar no GitHub
git push -u origin main

echo.
echo ========================================
echo Processo concluido!
echo ========================================
pause

