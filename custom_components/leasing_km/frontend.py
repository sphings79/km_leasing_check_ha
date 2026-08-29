"""Serve the Lovelace card that ships with this integration.

HACS installs the integration folder only, so the built card bundle lives in
`frontend/` next to this module. The integration serves that folder and
registers the card as a Lovelace resource, which means users of a storage mode
dashboard do not have to add a resource entry by hand. YAML dashboards still
need the entry, which is documented in the README.
"""

from __future__ import annotations

import logging

from homeassistant.components.http import StaticPathConfig
from homeassistant.components.lovelace import LOVELACE_DATA
from homeassistant.components.lovelace.resources import ResourceStorageCollection
from homeassistant.core import HomeAssistant
from homeassistant.loader import async_get_integration

from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)

CARD_FILENAME = "leasing-km-card.js"
FRONTEND_URL = f"/{DOMAIN}"
CARD_URL = f"{FRONTEND_URL}/{CARD_FILENAME}"
REGISTERED = f"{DOMAIN}_frontend_registered"


async def async_register_card(hass: HomeAssistant) -> None:
    """Serve the card and make sure a Lovelace resource points at it."""
    if hass.data.get(REGISTERED):
        return
    hass.data[REGISTERED] = True

    integration = await async_get_integration(hass, DOMAIN)
    version = integration.version
    # The whole folder, not just the entry file: the translation catalogs are
    # separate chunks the card fetches for the user's language.
    await hass.http.async_register_static_paths(
        [
            StaticPathConfig(
                FRONTEND_URL,
                str(integration.file_path / "frontend"),
                cache_headers=False,
            )
        ]
    )
    await _async_register_resource(hass, f"{CARD_URL}?v={version}")


async def _async_register_resource(hass: HomeAssistant, url: str) -> None:
    """Add or update the Lovelace resource entry for the card."""
    lovelace = hass.data.get(LOVELACE_DATA)
    if lovelace is None:
        _LOGGER.debug("Lovelace is not set up, skipping resource registration")
        return
    resources = lovelace.resources
    if not isinstance(resources, ResourceStorageCollection):
        _LOGGER.debug("Lovelace resources are managed in YAML, add %s manually", url)
        return

    await resources.async_get_info()
    for item in resources.async_items():
        if not str(item.get("url", "")).startswith(CARD_URL):
            continue
        if item["url"] != url:
            await resources.async_update_item(item["id"], {"url": url})
        return

    await resources.async_create_item({"res_type": "module", "url": url})
    _LOGGER.debug("Registered %s as a Lovelace resource", url)
