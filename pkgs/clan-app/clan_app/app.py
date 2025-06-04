import logging

from clan_cli.profiler import profile

log = logging.getLogger(__name__)
import os
from dataclasses import dataclass
from pathlib import Path

from clan_lib.api import API, ErrorDataClass, SuccessDataClass
from clan_lib.custom_logger import setup_logging

from clan_app.api.file_gtk import open_file
from clan_app.deps.webview.webview import Size, SizeHint, Webview


@dataclass
class ClanAppOptions:
    content_uri: str
    debug: bool


@profile
def app_run(app_opts: ClanAppOptions) -> int:
    if app_opts.debug:
        setup_logging(logging.DEBUG)
    else:
        setup_logging(logging.INFO)

    log.debug("Debug mode enabled")

    if app_opts.content_uri:
        content_uri = app_opts.content_uri
    else:
        site_index: Path = Path(os.getenv("WEBUI_PATH", ".")).resolve() / "index.html"
        content_uri = f"file://{site_index}"

    webview = Webview(debug=app_opts.debug)
    webview.title = "Clan App"
    # This seems to call the gtk api correctly but and gtk also seems to our icon, but somehow the icon is not loaded.
    webview.icon = "clan-white"

    def cancel_task(
        task_id: str, *, op_key: str
    ) -> SuccessDataClass[None] | ErrorDataClass:
        """Cancel a task by its op_key."""
        log.debug(f"Cancelling task with op_key: {task_id}")
        future = webview.threads.get(task_id)
        if future:
            future.stop_event.set()
            log.debug(f"Task {task_id} cancelled.")
        else:
            log.warning(f"Task {task_id} not found.")
        return SuccessDataClass(
            op_key=op_key,
            data=None,
            status="success",
        )

    def list_tasks(
        *,
        op_key: str,
    ) -> SuccessDataClass[list[str]] | ErrorDataClass:
        """List all tasks."""
        log.debug("Listing all tasks.")
        tasks = list(webview.threads.keys())
        return SuccessDataClass(
            op_key=op_key,
            data=tasks,
            status="success",
        )

    # TODO: We have to manually import python files to make the API.register be triggered.
    # We NEED to fix this, as this is super unintuitive and error-prone.
    import clan_lib.machines.actions  # noqa: F401

    API.overwrite_fn(list_tasks)
    API.overwrite_fn(open_file)
    API.overwrite_fn(cancel_task)
    webview.bind_jsonschema_api(API)
    webview.size = Size(1280, 1024, SizeHint.NONE)
    webview.navigate(content_uri)
    webview.run()
    return 0
