from flask import Flask, render_template
import os

app = Flask(__name__)


@app.route("/")
@app.route("/login") 
def login():
    return render_template('login.html')

@app.route("/cadastro") 
def cadastro():
    return render_template('cadastro.html')


@app.route("/dashboard")
def dashboard():
    return render_template('dashboard.html')

@app.route("/lancamentos")
def lancamentos():
    return render_template('lancamentos.html')

@app.route("/relatorios")
def relatorios():
    return render_template('relatorios.html')

@app.route("/perfil")
def perfil():
    return render_template('perfil.html')

if __name__ == '__main__':
    print("Iniciando o servidor Flask em http://127.0.0.1:5000")
    app.run(debug=True, port=5000)

