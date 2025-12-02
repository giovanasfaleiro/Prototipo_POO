from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import UserMixin
from datetime import datetime

db = SQLAlchemy()


class Usuario(UserMixin, db.Model):
    __tablename__ = 'usuarios'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False, index=True)
    nome = db.Column(db.String(200), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    senha_hash = db.Column(db.String(255), nullable=False)
    tipo = db.Column(db.String(20), nullable=False)
    
    cpf = db.Column(db.String(14), nullable=True)
    data_nascimento = db.Column(db.Date, nullable=True)
    
    cnpj = db.Column(db.String(18), nullable=True)
    razao_social = db.Column(db.String(200), nullable=True)
    inscricao_estadual = db.Column(db.String(50), nullable=True)
    meta_despesa_mensal = db.Column(db.Numeric(10, 2), nullable=True)
    
    data_criacao = db.Column(db.DateTime, default=datetime.utcnow)
    data_atualizacao = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    transacoes = db.relationship('Transacao', backref='usuario', lazy=True, cascade='all, delete-orphan')
    categorias = db.relationship('Categoria', backref='usuario', lazy=True, cascade='all, delete-orphan')
    
    def set_senha(self, senha):
        self.senha_hash = generate_password_hash(senha)
    
    def check_senha(self, senha):
        return check_password_hash(self.senha_hash, senha)
    
    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'nome': self.nome,
            'email': self.email,
            'tipo': self.tipo,
            'cpf': self.cpf,
            'data_nascimento': self.data_nascimento.strftime('%d/%m/%Y') if self.data_nascimento else None,
            'cnpj': self.cnpj,
            'razao_social': self.razao_social,
            'inscricao_estadual': self.inscricao_estadual,
            'meta_despesa_mensal': float(self.meta_despesa_mensal) if self.meta_despesa_mensal is not None else None
        }


class Categoria(db.Model):
    __tablename__ = 'categorias'
    
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuarios.id'), nullable=False)
    
    data_criacao = db.Column(db.DateTime, default=datetime.utcnow)
    
    transacoes = db.relationship('Transacao', backref='categoria_obj', lazy=True)
    
    __table_args__ = (db.UniqueConstraint('nome', 'usuario_id', name='uq_categoria_usuario'),)
    
    def to_dict(self):
        return {
            'id': self.id,
            'nome': self.nome,
            'usuario_id': self.usuario_id
        }


class Transacao(db.Model):
    __tablename__ = 'transacoes'
    
    id = db.Column(db.Integer, primary_key=True)
    descricao = db.Column(db.String(200), nullable=False)
    valor = db.Column(db.Numeric(10, 2), nullable=False)
    tipo = db.Column(db.String(20), nullable=False)
    data = db.Column(db.Date, nullable=False, default=datetime.utcnow)
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuarios.id'), nullable=False)
    categoria_id = db.Column(db.Integer, db.ForeignKey('categorias.id'), nullable=True)
    categoria_nome = db.Column(db.String(100), nullable=True)
    
    data_criacao = db.Column(db.DateTime, default=datetime.utcnow)
    data_atualizacao = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'descricao': self.descricao,
            'valor': float(self.valor),
            'tipo': self.tipo,
            'data': self.data.strftime('%d/%m/%Y'),
            'categoria': self.categoria_nome or (self.categoria_obj.nome if self.categoria_obj else None),
            'usuario_id': self.usuario_id
        }

