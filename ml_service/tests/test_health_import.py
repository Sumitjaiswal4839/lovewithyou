def test_import():
    import app.main
    assert app.main.app is not None
