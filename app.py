from flask import Flask, render_template, session, redirect, url_for
from flask_login import LoginManager
from models import db, Usuario
from config import Config
from routes import api
from auth import get_current_user
import os

app = Flask(__name__)
app.config.from_object(Config)

db.init_app(app)
app.register_blueprint(api)

login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

@login_manager.user_loader
def load_user(user_id):
    return Usuario.query.get(int(user_id))


# ==================== ROTAS DE PÁGINAS ====================

@app.route("/")
def index():
    if 'user_id' in session:
        return redirect(url_for('dashboard'))
    return redirect(url_for('login'))


@app.route("/login") 
def login():
    if 'user_id' in session:
        return redirect(url_for('dashboard'))
    return render_template('login.html')


@app.route("/cadastro") 
def cadastro():
    if 'user_id' in session:
        return redirect(url_for('dashboard'))
    return render_template('cadastro.html')


@app.route("/dashboard")
def dashboard():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    usuario = get_current_user()
    return render_template('dashboard.html', usuario=usuario)


@app.route("/lancamentos")
def lancamentos():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    return render_template('lancamentos.html')


@app.route("/relatorios")
def relatorios():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    return render_template('relatorios.html')


@app.route("/perfil")
def perfil():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    return render_template('perfil.html')


@app.route("/logout")
def logout():
    session.clear()
    return redirect(url_for('login'))


# ==================== INICIALIZAÇÃO DO BANCO ====================

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    
    print("Iniciando o servidor Flask em http://127.0.0.1:5000")
    app.run(debug=True, port=5000)

