from app.services.calibration import Calibration


def test_calibration_identity():
    c = Calibration(
        version="test",
        raw_age_knots=[0, 10, 20],
        calibrated_age_knots=[0, 11, 21],
        max_abs_correction=6,
    )
    assert round(c.transform(15), 1) == 15.5
