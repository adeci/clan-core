import pytest

from clan_cli.tests.helpers import cli
from clan_cli.tests.stdout import CaptureOutput


@pytest.mark.impure
def test_flash_list_languages(capture_output: CaptureOutput) -> None:
    with capture_output as output:
        cli.run(["flash", "list", "languages"])
    assert "en_US.UTF-8" in output.out
    assert "C" in output.out
    languages = output.out.strip().split("\n")
    assert len(languages) > 1


@pytest.mark.impure
def test_flash_list_keymaps(capture_output: CaptureOutput) -> None:
    with capture_output as output:
        cli.run(["flash", "list", "keymaps"])
    assert "us" in output.out
    keymaps = output.out.strip().split("\n")
    assert len(keymaps) > 1
