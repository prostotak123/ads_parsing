import pytest


# Глобальна фікстура: включає доступ до БД всюди автоматично
@pytest.fixture(autouse=True)
def enable_db_access_for_all_tests(db):
    pass
