from flask import Blueprint, request, jsonify, session
from models import db, Usuario, Transacao, Categoria
from auth import login_required, get_current_user
from datetime import datetime
from sqlalchemy import extract, func

api = Blueprint('api', __name__, url_prefix='/api')


# ==================== AUTENTICAÇÃO ====================

@api.route('/cadastro', methods=['POST'])
def cadastro():
    try:
        data = request.get_json()
        
        if not data.get('email') or not data.get('senha') or not data.get('nome') or not data.get('username'):
            return jsonify({'error': 'Email, usuário, senha e nome são obrigatórios'}), 400
        
        if Usuario.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'Email já cadastrado'}), 400
        
        if Usuario.query.filter_by(username=data['username']).first():
            return jsonify({'error': 'Usuário já cadastrado'}), 400
        
        usuario = Usuario(
            username=data['username'],
            nome=data['nome'],
            email=data['email'],
            tipo=data.get('tipo', 'PF')
        )
        usuario.set_senha(data['senha'])
        
        if data.get('tipo') == 'PF':
            usuario.cpf = data.get('cpf')
            if data.get('birth_date'):
                usuario.data_nascimento = datetime.strptime(data['birth_date'], '%Y-%m-%d').date()
        elif data.get('tipo') == 'PJ':
            usuario.cnpj = data.get('cnpj')
            usuario.razao_social = data.get('razao_social')
            usuario.inscricao_estadual = data.get('inscricao_estadual')
        
        db.session.add(usuario)
        db.session.commit()
        
        categorias_padrao = ['Salário', 'Moradia', 'Alimentação', 'Extra', 'Lazer']
        for cat_nome in categorias_padrao:
            categoria = Categoria(nome=cat_nome, usuario_id=usuario.id)
            db.session.add(categoria)
        db.session.commit()
        
        session['user_id'] = usuario.id
        session.permanent = True
        
        return jsonify({
            'message': 'Cadastro realizado com sucesso',
            'usuario': usuario.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@api.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        email = data.get('email')
        senha = data.get('senha')
        
        if not email or not senha:
            return jsonify({'error': 'Email e senha são obrigatórios'}), 400
        
        usuario = Usuario.query.filter_by(email=email).first()
        
        if not usuario or not usuario.check_senha(senha):
            return jsonify({'error': 'Email ou senha incorretos'}), 401
        
        session['user_id'] = usuario.id
        session.permanent = True
        
        return jsonify({
            'message': 'Login realizado com sucesso',
            'usuario': usuario.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@api.route('/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'message': 'Logout realizado com sucesso'}), 200


@api.route('/usuario/atual', methods=['GET'])
@login_required
def usuario_atual():
    usuario = get_current_user()
    if not usuario:
        return jsonify({'error': 'Usuário não encontrado'}), 404
    return jsonify(usuario.to_dict()), 200


@api.route('/usuario/meta', methods=['PUT'])
@login_required
def atualizar_meta_usuario():
    try:
        usuario = get_current_user()
        data = request.get_json()
        meta = data.get('meta_despesa_mensal')
        if meta is None:
            usuario.meta_despesa_mensal = None
        else:
            usuario.meta_despesa_mensal = float(meta)
        db.session.commit()
        return jsonify(usuario.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


# ==================== TRANSAÇÕES ====================

@api.route('/transacoes', methods=['GET'])
@login_required
def listar_transacoes():
    try:
        usuario = get_current_user()
        transacoes = Transacao.query.filter_by(usuario_id=usuario.id).order_by(Transacao.data.desc()).all()
        return jsonify([t.to_dict() for t in transacoes]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@api.route('/transacoes', methods=['POST'])
@login_required
def criar_transacao():
    try:
        usuario = get_current_user()
        data = request.get_json()
        
        if not data.get('descricao') or not data.get('valor') or not data.get('tipo'):
            return jsonify({'error': 'Descrição, valor e tipo são obrigatórios'}), 400
        
        data_transacao = datetime.now().date()
        if data.get('data'):
            data_transacao = datetime.strptime(data['data'], '%Y-%m-%d').date()
        
        categoria_id = None
        categoria_nome = data.get('categoria')
        
        if categoria_nome:
            categoria = Categoria.query.filter_by(
                nome=categoria_nome,
                usuario_id=usuario.id
            ).first()
            
            if categoria:
                categoria_id = categoria.id
            else:
                nova_categoria = Categoria(nome=categoria_nome, usuario_id=usuario.id)
                db.session.add(nova_categoria)
                db.session.flush()
                categoria_id = nova_categoria.id
        
        transacao = Transacao(
            descricao=data['descricao'],
            valor=float(data['valor']),
            tipo=data['tipo'],
            data=data_transacao,
            usuario_id=usuario.id,
            categoria_id=categoria_id,
            categoria_nome=categoria_nome
        )
        
        db.session.add(transacao)
        db.session.commit()
        
        return jsonify(transacao.to_dict()), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@api.route('/transacoes/<int:transacao_id>', methods=['DELETE'])
@login_required
def deletar_transacao(transacao_id):
    try:
        usuario = get_current_user()
        transacao = Transacao.query.filter_by(id=transacao_id, usuario_id=usuario.id).first()
        
        if not transacao:
            return jsonify({'error': 'Transação não encontrada'}), 404
        
        db.session.delete(transacao)
        db.session.commit()
        
        return jsonify({'message': 'Transação deletada com sucesso'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@api.route('/transacoes/<int:transacao_id>', methods=['PUT'])
@login_required
def atualizar_transacao(transacao_id):
    try:
        usuario = get_current_user()
        transacao = Transacao.query.filter_by(id=transacao_id, usuario_id=usuario.id).first()
        
        if not transacao:
            return jsonify({'error': 'Transação não encontrada'}), 404
        
        data = request.get_json()
        
        if data.get('descricao'):
            transacao.descricao = data['descricao']
        if data.get('valor'):
            transacao.valor = float(data['valor'])
        if data.get('tipo'):
            transacao.tipo = data['tipo']
        if data.get('data'):
            transacao.data = datetime.strptime(data['data'], '%Y-%m-%d').date()
        if data.get('categoria'):
            categoria_nome = data['categoria']
            categoria = Categoria.query.filter_by(
                nome=categoria_nome,
                usuario_id=usuario.id
            ).first()
            
            if categoria:
                transacao.categoria_id = categoria.id
            else:
                nova_categoria = Categoria(nome=categoria_nome, usuario_id=usuario.id)
                db.session.add(nova_categoria)
                db.session.flush()
                transacao.categoria_id = nova_categoria.id
            
            transacao.categoria_nome = categoria_nome
        
        db.session.commit()
        
        return jsonify(transacao.to_dict()), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


# ==================== CATEGORIAS ====================

@api.route('/categorias', methods=['GET'])
@login_required
def listar_categorias():
    try:
        usuario = get_current_user()
        categorias = Categoria.query.filter_by(usuario_id=usuario.id).order_by(Categoria.nome).all()
        return jsonify([c.to_dict() for c in categorias]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@api.route('/categorias', methods=['POST'])
@login_required
def criar_categoria():
    try:
        usuario = get_current_user()
        data = request.get_json()
        
        if not data.get('nome'):
            return jsonify({'error': 'Nome da categoria é obrigatório'}), 400
        
        categoria_existente = Categoria.query.filter_by(
            nome=data['nome'],
            usuario_id=usuario.id
        ).first()
        
        if categoria_existente:
            return jsonify({'error': 'Categoria já existe'}), 400
        
        categoria = Categoria(nome=data['nome'], usuario_id=usuario.id)
        db.session.add(categoria)
        db.session.commit()
        
        return jsonify(categoria.to_dict()), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@api.route('/categorias/<int:categoria_id>', methods=['DELETE'])
@login_required
def deletar_categoria(categoria_id):
    try:
        usuario = get_current_user()
        categoria = Categoria.query.filter_by(id=categoria_id, usuario_id=usuario.id).first()
        
        if not categoria:
            return jsonify({'error': 'Categoria não encontrada'}), 404
        
        db.session.delete(categoria)
        db.session.commit()
        
        return jsonify({'message': 'Categoria deletada com sucesso'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


# ==================== DASHBOARD E ESTATÍSTICAS ====================

@api.route('/dashboard/estatisticas', methods=['GET'])
@login_required
def estatisticas_dashboard():
    try:
        usuario = get_current_user()
        hoje = datetime.now()
        mes_atual = hoje.month
        ano_atual = hoje.year
        
        transacoes_mes = Transacao.query.filter(
            Transacao.usuario_id == usuario.id,
            extract('month', Transacao.data) == mes_atual,
            extract('year', Transacao.data) == ano_atual
        ).all()
        
        total_receitas = sum(float(t.valor) for t in transacoes_mes if t.tipo == 'Receita')
        total_despesas = sum(float(t.valor) for t in transacoes_mes if t.tipo == 'Despesa')
        saldo_atual = total_receitas - total_despesas
        
        ultimas_transacoes = Transacao.query.filter_by(
            usuario_id=usuario.id
        ).order_by(Transacao.data.desc(), Transacao.id.desc()).limit(5).all()
        
        return jsonify({
            'saldo_atual': saldo_atual,
            'total_receitas': total_receitas,
            'total_despesas': total_despesas,
            'meta_despesa_mensal': float(usuario.meta_despesa_mensal) if usuario.meta_despesa_mensal is not None else None,
            'ultimas_transacoes': [t.to_dict() for t in ultimas_transacoes]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@api.route('/relatorios/despesas-por-categoria', methods=['GET'])
@login_required
def despesas_por_categoria():
    try:
        usuario = get_current_user()
        
        resultado = db.session.query(
            func.coalesce(Transacao.categoria_nome, 'Sem Categoria').label('categoria'),
            func.sum(Transacao.valor).label('total')
        ).filter(
            Transacao.usuario_id == usuario.id,
            Transacao.tipo == 'Despesa'
        ).group_by('categoria').all()
        
        dados = {categoria: float(total) for categoria, total in resultado}
        
        return jsonify(dados), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@api.route('/relatorios/receitas-vs-despesas', methods=['GET'])
@login_required
def receitas_vs_despesas():
    try:
        usuario = get_current_user()
        
        resultado = db.session.query(
            Transacao.tipo,
            func.sum(Transacao.valor).label('total')
        ).filter(
            Transacao.usuario_id == usuario.id
        ).group_by(Transacao.tipo).all()
        
        dados = {tipo: float(total) for tipo, total in resultado}
        
        return jsonify({
            'receitas': dados.get('Receita', 0),
            'despesas': dados.get('Despesa', 0)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

