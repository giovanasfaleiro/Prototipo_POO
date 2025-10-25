document.addEventListener('DOMContentLoaded', function() {
    
    // NOTA: Em uma aplicação real, estes dados viriam de um servidor 
    // ou do localStorage após o login ser efetuado com sucesso.
    // Como nosso formulário de login atual não salva dados, 
    // estamos usando um objeto fictício para demonstração.
    const usuarioFicticio = {
        nome: "Giovana",
        tipo: "Pessoa Física",
        cpf: "123.456.789-00",
        dataNascimento: "15/05/1995"
    };

    function carregarDadosUsuario(usuario) {
        document.getElementById('user-name').textContent = `${usuario.nome} (${usuario.tipo})`;
        document.getElementById('user-cpf').textContent = usuario.cpf;
        document.getElementById('user-birthdate').textContent = usuario.dataNascimento;
    }

    carregarDadosUsuario(usuarioFicticio);
});