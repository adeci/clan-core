import logging
from abc import ABC, abstractmethod
from contextlib import ExitStack
from dataclasses import dataclass
from typing import TYPE_CHECKING, Any

if TYPE_CHECKING:
    from .middleware import Middleware

log = logging.getLogger(__name__)


@dataclass(frozen=True)
class BackendRequest:
    method_name: str
    args: dict[str, Any]
    header: dict[str, Any]
    op_key: str


@dataclass(frozen=True)
class BackendResponse:
    body: Any
    header: dict[str, Any]
    _op_key: str


@dataclass
class ApiBridge(ABC):
    """Generic interface for API bridges that can handle method calls from different sources."""

    middleware_chain: tuple["Middleware", ...]

    @abstractmethod
    def send_response(self, response: BackendResponse) -> None:
        """Send response back to the client."""

    def process_request(self, request: BackendRequest) -> None:
        """Process an API request through the middleware chain."""
        from .middleware import MiddlewareContext

        with ExitStack() as stack:
            context = MiddlewareContext(
                request=request,
                bridge=self,
                exit_stack=stack,
            )

            # Process through middleware chain
            for middleware in self.middleware_chain:
                try:
                    log.debug(
                        f"{middleware.__class__.__name__} => {request.method_name}"
                    )
                    middleware.process(context)
                except Exception as e:
                    # If middleware fails, handle error
                    self.send_error_response(
                        request.op_key, str(e), ["middleware_error"]
                    )
                    return

    def send_error_response(
        self, op_key: str, error_message: str, location: list[str]
    ) -> None:
        """Send an error response."""
        from clan_lib.api import ApiError, ErrorDataClass

        error_data = ErrorDataClass(
            op_key=op_key,
            status="error",
            errors=[
                ApiError(
                    message="An internal error occured",
                    description=error_message,
                    location=location,
                )
            ],
        )

        response = BackendResponse(
            body=error_data,
            header={},
            _op_key=op_key,
        )

        self.send_response(response)
