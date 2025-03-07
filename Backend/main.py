# Backend/main.py
from flask import Flask
from flask_cors import CORS

def create_app():
    app = Flask(__name__)
    
    # Configure CORS to allow frontend to communicate
    CORS(app, resources={
        r"/api/*": {
            "origins": [
                "http://localhost:3000",  # React development server
                "http://127.0.0.1:3000"
            ]
        }
    })
    
    # Register blueprints and routes
    from api.routes import api as api_blueprint
    app.register_blueprint(api_blueprint, url_prefix='/api')
    
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5000)