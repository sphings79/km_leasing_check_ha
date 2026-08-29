"""Shared fixtures for the Leasing KM tests."""

import pytest


@pytest.fixture(autouse=True)
def auto_enable_custom_integrations(enable_custom_integrations):
    """Make Home Assistant load the integration from custom_components."""
    yield
