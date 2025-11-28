document.addEventListener('DOMContentLoaded', function() {
    
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