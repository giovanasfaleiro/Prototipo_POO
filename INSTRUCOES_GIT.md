# Instruções para Fazer Push para o GitHub

Siga estes passos para enviar seu código para o repositório GitHub:

## Passo 1: Abrir o Terminal

Abra o PowerShell ou CMD no diretório do projeto:
```
cd "C:\Users\josec\OneDrive\Área de Trabalho\Programas\POOTrabalho\Prototipo_POO"
```

## Passo 2: Configurar o Git (se ainda não configurou)

```bash
git config user.name "Júlia Júnior"
git config user.email "albuja@discente.ufg.br"
```

## Passo 3: Inicializar o Repositório (se necessário)

```bash
git init
```

## Passo 4: Adicionar o Remote

```bash
git remote remove origin
git remote add origin https://github.com/giovanasfaleiro/Prototipo_POO.git
```

## Passo 5: Adicionar Todos os Arquivos

```bash
git add .
```

## Passo 6: Fazer o Commit

```bash
git commit -m "Backend completo com Flask, SQLAlchemy e autenticação"
```

## Passo 7: Renomear Branch para Main

```bash
git branch -M main
```

## Passo 8: Fazer Push para o GitHub

```bash
git push -u origin main
```

**Nota:** Se for a primeira vez fazendo push, o GitHub pode pedir autenticação. Você precisará:
- Usar um Personal Access Token (PAT) ao invés de senha
- Ou autenticar via GitHub CLI

## Alternativa: Usar o Script Automático

Você também pode executar o arquivo `git_push.bat` que foi criado:
- Clique duas vezes no arquivo `git_push.bat`
- Ou execute no terminal: `.\git_push.bat`

## Se Der Erro de Autenticação

1. Vá para: https://github.com/settings/tokens
2. Clique em "Generate new token (classic)"
3. Dê um nome ao token
4. Selecione as permissões: `repo` (acesso completo aos repositórios)
5. Copie o token gerado
6. Use o token como senha quando o Git pedir credenciais

## Verificar se Funcionou

Acesse: https://github.com/giovanasfaleiro/Prototipo_POO

Você deve ver todos os arquivos do projeto lá!

