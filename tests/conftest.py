import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker
from backend.db.models import Base
from backend.db.session import get_db
from backend.main import app

# Use a file-based SQLite for tests so all connections share the same database
TEST_DATABASE_URL = "sqlite:///./test.db"


@pytest.fixture(scope="session")
def engine():
    eng = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
    Base.metadata.create_all(eng)
    yield eng
    Base.metadata.drop_all(eng)
    import os
    if os.path.exists("test.db"):
        os.remove("test.db")


@pytest.fixture(autouse=True)
def clean_tables(engine):
    """Truncate all tables before each test for isolation."""
    with engine.begin() as conn:
        for table in reversed(Base.metadata.sorted_tables):
            conn.execute(table.delete())


@pytest.fixture
def db(engine, clean_tables):
    TestSession = sessionmaker(bind=engine)
    session = TestSession()
    yield session
    session.rollback()
    session.close()


@pytest.fixture
def client(db):
    def override_get_db():
        yield db
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()
