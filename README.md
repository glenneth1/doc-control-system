# Document Control System

A modern web-based document management system built with Python and FastAPI.

## Features

- Document upload and management
- Version control and document history
- User authentication and authorization
- Full-text search functionality
- Document tagging and metadata
- RESTful API
- Modern, responsive web interface

## Tech Stack

- **Backend**: Python 3.11+ with FastAPI
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Search**: Elasticsearch for full-text search
- **Authentication**: JWT-based auth with OAuth2
- **Storage**: Local filesystem with cloud storage support
- **Frontend**: React with TypeScript
- **Documentation**: OpenAPI/Swagger

## Project Structure

```
doc-control-system/
├── backend/                # Python backend code
│   ├── app/
│   │   ├── api/           # API endpoints
│   │   ├── core/          # Core functionality
│   │   ├── models/        # SQLAlchemy models
│   │   ├── schemas/       # Pydantic schemas
│   │   └── services/      # Business logic
│   ├── tests/             # Test suite
│   └── alembic/           # Database migrations
├── frontend/              # React frontend
│   ├── src/
│   ├── public/
│   └── package.json
└── docs/                  # Documentation
```

## Setup and Installation

### Prerequisites
- Python 3.11+
- PostgreSQL
- Node.js 18+

### Development Setup
1. Clone the repository
2. Create and activate a Python virtual environment
3. Install dependencies: `pip install -r requirements.txt`
4. Set up environment variables
5. Run migrations: `alembic upgrade head`
6. Start the development server: `uvicorn app.main:app --reload`

## API Documentation

API documentation is automatically generated and available at `/docs` when running the server.

## Development

- Follow PEP 8 style guide
- Use type hints
- Write tests for new features
- Use pre-commit hooks for code quality

## Testing

Run tests with pytest:
```bash
pytest
```
