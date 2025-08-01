import functools
import json
import logging
from collections.abc import Callable
from dataclasses import dataclass, field
from enum import IntEnum
from typing import TYPE_CHECKING, Any

from clan_lib.api import MethodRegistry
from clan_lib.api.tasks import WebThread
from clan_lib.log_manager import LogManager

from ._webview_ffi import _encode_c_string, _webview_lib

if TYPE_CHECKING:
    from clan_app.api.middleware import Middleware

    from .webview_bridge import WebviewBridge

log = logging.getLogger(__name__)


class SizeHint(IntEnum):
    NONE = 0
    MIN = 1
    MAX = 2
    FIXED = 3


class FuncStatus(IntEnum):
    SUCCESS = 0
    FAILURE = 1


@dataclass(frozen=True)
class Size:
    width: int
    height: int
    hint: SizeHint


@dataclass
class Webview:
    title: str
    debug: bool = False
    size: Size | None = None
    window: int | None = None
    shared_threads: dict[str, WebThread] | None = None

    # initialized later
    _bridge: "WebviewBridge | None" = None
    _handle: Any | None = None
    _callbacks: dict[str, Callable[..., Any]] = field(default_factory=dict)
    _middleware: list["Middleware"] = field(default_factory=list)

    def _create_handle(self) -> None:
        # Initialize the webview handle
        handle = _webview_lib.webview_create(int(self.debug), self.window)
        callbacks: dict[str, Callable[..., Any]] = {}

        # Since we can't use object.__setattr__, we'll initialize differently
        # by storing in __dict__ directly (this works for init=False fields)
        self._handle = handle
        self._callbacks = callbacks

        if self.title:
            self.set_title(self.title)

        if self.size:
            self.set_size(self.size)

    @property
    def handle(self) -> Any:
        """Get the webview handle, creating it if necessary."""
        if self._handle is None:
            self._create_handle()
        return self._handle

    @property
    def bridge(self) -> "WebviewBridge":
        """Get the bridge, creating it if necessary."""
        if self._bridge is None:
            self.create_bridge()
        assert self._bridge is not None, "Bridge should be created"
        return self._bridge

    def api_wrapper(
        self,
        method_name: str,
        wrap_method: Callable[..., Any],
        op_key_bytes: bytes,
        request_data: bytes,
        arg: int,
    ) -> None:
        """Legacy API wrapper - delegates to the bridge."""
        self.bridge.handle_webview_call(
            method_name=method_name,
            op_key_bytes=op_key_bytes,
            request_data=request_data,
            arg=arg,
        )

    @property
    def threads(self) -> dict[str, WebThread]:
        """Access threads from the bridge for compatibility."""
        return self.bridge.threads

    def add_middleware(self, middleware: "Middleware") -> None:
        """Add middleware to the middleware chain."""
        if self._bridge is not None:
            msg = "Cannot add middleware after bridge creation."
            raise RuntimeError(msg)

        self._middleware.append(middleware)

    def create_bridge(self) -> "WebviewBridge":
        """Create and initialize the WebviewBridge with current middleware."""
        from .webview_bridge import WebviewBridge

        # Use shared_threads if provided, otherwise let WebviewBridge use its default
        if self.shared_threads is not None:
            bridge = WebviewBridge(
                webview=self,
                middleware_chain=tuple(self._middleware),
                threads=self.shared_threads,
            )
        else:
            bridge = WebviewBridge(
                webview=self, middleware_chain=tuple(self._middleware), threads={}
            )
        self._bridge = bridge
        return bridge

    # Legacy methods for compatibility
    def set_size(self, value: Size) -> None:
        """Set the webview size (legacy compatibility)."""
        _webview_lib.webview_set_size(
            self.handle, value.width, value.height, value.hint
        )

    def set_title(self, value: str) -> None:
        """Set the webview title (legacy compatibility)."""
        _webview_lib.webview_set_title(self.handle, _encode_c_string(value))

    def destroy(self) -> None:
        """Destroy the webview."""
        for name in list(self._callbacks.keys()):
            self.unbind(name)
        _webview_lib.webview_terminate(self.handle)
        _webview_lib.webview_destroy(self.handle)
        # Can't set _handle to None on frozen dataclass

    def navigate(self, url: str) -> None:
        """Navigate to a URL."""
        _webview_lib.webview_navigate(self.handle, _encode_c_string(url))

    def run(self) -> None:
        """Run the webview."""
        _webview_lib.webview_run(self.handle)
        log.info("Shutting down webview...")
        self.destroy()

    def bind_jsonschema_api(self, api: MethodRegistry, log_manager: LogManager) -> None:
        for name, method in api.functions.items():
            wrapper = functools.partial(
                self.api_wrapper,
                name,
                method,
            )
            c_callback = _webview_lib.binding_callback_t(wrapper)

            if name in self._callbacks:
                msg = f"Callback {name} already exists. Skipping binding."
                raise RuntimeError(msg)

            self._callbacks[name] = c_callback
            _webview_lib.webview_bind(
                self.handle, _encode_c_string(name), c_callback, None
            )

    def bind(self, name: str, callback: Callable[..., Any]) -> None:
        def wrapper(seq: bytes, req: bytes, arg: int) -> None:
            args = json.loads(req.decode())
            try:
                result = callback(*args)
                success = True
            except Exception as e:
                result = str(e)
                success = False
            self.return_(seq.decode(), 0 if success else 1, json.dumps(result))

        c_callback = _webview_lib.binding_callback_t(wrapper)
        self._callbacks[name] = c_callback
        _webview_lib.webview_bind(self.handle, _encode_c_string(name), c_callback, None)

    def unbind(self, name: str) -> None:
        if name in self._callbacks:
            _webview_lib.webview_unbind(self.handle, _encode_c_string(name))
            del self._callbacks[name]

    def return_(self, seq: str, status: int, result: str) -> None:
        _webview_lib.webview_return(
            self.handle, _encode_c_string(seq), status, _encode_c_string(result)
        )

    def eval(self, source: str) -> None:
        _webview_lib.webview_eval(self.handle, _encode_c_string(source))


if __name__ == "__main__":
    wv = Webview(title="Hello, World!")
    wv.navigate("https://www.google.com")
    wv.run()
