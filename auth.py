from functools import wraps
from flask import session, jsonify, request
from models import Usuario

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'error': 'Não autenticado'}), 401
        return f(*args, **kwargs)
    return decorated_function

def get_current_user():
    if 'user_id' not in session:
        return None
    return Usuario.query.get(session['user_id'])

