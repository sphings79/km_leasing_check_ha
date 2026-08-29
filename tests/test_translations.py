"""Every shipped language has to carry exactly the same keys."""

import json
import pathlib

import pytest

TRANSLATIONS = pathlib.Path("custom_components/leasing_km/translations")
STRINGS = pathlib.Path("custom_components/leasing_km/strings.json")
ICONS = pathlib.Path("custom_components/leasing_km/icons.json")
CARD = pathlib.Path("frontend/src/translations")


def _keys(node: dict, prefix: str = "") -> set[str]:
    found = set()
    for key, value in node.items():
        found.add(prefix + key)
        if isinstance(value, dict):
            found |= _keys(value, f"{prefix}{key}.")
    return found


def _load(path: pathlib.Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


REFERENCE = _keys(_load(TRANSLATIONS / "en.json"))
LANGUAGES = sorted(p.stem for p in TRANSLATIONS.glob("*.json"))


def test_all_expected_languages_are_shipped():
    assert LANGUAGES == [
        "cs",
        "da",
        "de",
        "en",
        "es",
        "fr",
        "it",
        "nl",
        "pl",
        "pt",
        "sv",
    ]


@pytest.mark.parametrize("language", LANGUAGES)
def test_integration_language_has_the_same_keys(language: str):
    assert _keys(_load(TRANSLATIONS / f"{language}.json")) == REFERENCE


@pytest.mark.parametrize("language", LANGUAGES)
def test_card_language_has_the_same_keys(language: str):
    reference = set(_load(CARD / "en.json"))
    assert set(_load(CARD / f"{language}.json")) == reference


def test_strings_and_english_translation_match():
    assert _keys(_load(STRINGS)) == REFERENCE


def test_every_entity_has_an_icon():
    icons = _load(ICONS)["entity"]
    english = _load(TRANSLATIONS / "en.json")["entity"]
    for platform, entities in english.items():
        assert set(icons[platform]) == set(entities), platform
