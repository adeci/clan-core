"""
This module provides utility functions for serialization and deserialization of data classes.

Functions:
- sanitize_string(s: str) -> str: Ensures a string is properly escaped for json serializing.
- dataclass_to_dict(obj: Any) -> Any: Converts a data class and its nested data classes, lists, tuples, and dictionaries to dictionaries.
- from_dict(t: type[T], data: Any) -> T: Dynamically instantiates a data class from a dictionary, constructing nested data classes, validates all required fields exist and have the expected type.

Classes:
- TypeAdapter: A Pydantic type adapter for data classes.

Exceptions:
- ValidationError: Raised when there is a validation error during deserialization.
- ClanError: Raised when there is an error during serialization or deserialization.

Dependencies:
- dataclasses: Provides the @dataclass decorator and related functions for creating data classes.
- json: Provides functions for working with JSON data.
- collections.abc: Provides abstract base classes for collections.
- functools: Provides functions for working with higher-order functions and decorators.
- inspect: Provides functions for inspecting live objects.
- operator: Provides functions for working with operators.
- pathlib: Provides classes for working with filesystem paths.
- types: Provides functions for working with types.
- typing: Provides support for type hints.
- pydantic: A library for data validation and settings management.
- pydantic_core: Core functionality for Pydantic.

Note: This module assumes the presence of other modules and classes such as `ClanError` and `ErrorDetails` from the `clan_cli.errors` module.
"""

import dataclasses
import json
from dataclasses import dataclass, fields, is_dataclass
from pathlib import Path
from types import UnionType
from typing import (
    Annotated,
    Any,
    Literal,
    TypeVar,
    Union,
    get_args,
    get_origin,
)

from clan_cli.errors import ClanError


def sanitize_string(s: str) -> str:
    # Using the native string sanitizer to handle all edge cases
    # Remove the outer quotes '"string"'
    return json.dumps(s)[1:-1]


def dataclass_to_dict(obj: Any, *, use_alias: bool = True) -> Any:
    def _to_dict(obj: Any) -> Any:
        """
        Utility function to convert dataclasses to dictionaries
        It converts all nested dataclasses, lists, tuples, and dictionaries to dictionaries

        It does NOT convert member functions.
        """
        if is_dataclass(obj):
            return {
                # Use either the original name or name
                sanitize_string(
                    field.metadata.get("alias", field.name) if use_alias else field.name
                ): _to_dict(getattr(obj, field.name))
                for field in fields(obj)
                if not field.name.startswith("_")
                and getattr(obj, field.name) is not None  # type: ignore
            }
        elif isinstance(obj, list | tuple):
            return [_to_dict(item) for item in obj]
        elif isinstance(obj, dict):
            return {sanitize_string(k): _to_dict(v) for k, v in obj.items()}
        elif isinstance(obj, Path):
            return sanitize_string(str(obj))
        elif isinstance(obj, str):
            return sanitize_string(obj)
        else:
            return obj

    return _to_dict(obj)


T = TypeVar("T", bound=dataclass)  # type: ignore
G = TypeVar("G")  # type: ignore


def is_union_type(type_hint: type | UnionType) -> bool:
    return (
        type(type_hint) is UnionType
        or isinstance(type_hint, UnionType)
        or get_origin(type_hint) is Union
    )


def is_type_in_union(union_type: type | UnionType, target_type: type) -> bool:
    if get_origin(union_type) is UnionType:
        return any(issubclass(arg, target_type) for arg in get_args(union_type))
    return union_type == target_type


def unwrap_none_type(type_hint: type | UnionType) -> type:
    """
    Takes a type union and returns the first non-None type.
    None | str
    =>
    str
    """

    if is_union_type(type_hint):
        # Return the first non-None type
        return next(t for t in get_args(type_hint) if t is not type(None))

    return type_hint  # type: ignore


JsonValue = str | float | dict[str, Any] | list[Any] | None


def construct_value(t: type, field_value: JsonValue, loc: list[str] = []) -> Any:
    """
    Construct a field value from a type hint and a field value.
    """
    if t is None and field_value:
        raise ClanError(f"Expected None but got: {field_value}", location=f"{loc}")

    if is_type_in_union(t, type(None)) and field_value is None:
        # Sometimes the field value is None, which is valid if the type hint allows None
        return None

    # If the field is another dataclass
    # Field_value must be a dictionary
    if is_dataclass(t) and isinstance(field_value, dict):
        return construct_dataclass(t, field_value)

    # If the field expects a path
    # Field_value must be a string
    elif is_type_in_union(t, Path):
        if not isinstance(field_value, str):
            raise ClanError(
                f"Expected string, cannot construct pathlib.Path() from: {field_value} ",
                location=f"{loc}",
            )

        return Path(field_value)

    # Trivial values
    elif t is str:
        if not isinstance(field_value, str):
            raise ClanError(f"Expected string, got {field_value}", location=f"{loc}")

        return field_value

    elif t is int and not isinstance(field_value, str):
        return int(field_value)  # type: ignore
    elif t is float and not isinstance(field_value, str):
        return float(field_value)  # type: ignore
    elif t is bool and isinstance(field_value, bool):
        return field_value  # type: ignore

    # Union types construct the first non-None type
    elif is_union_type(t):
        # Unwrap the union type
        inner = unwrap_none_type(t)
        # Construct the field value
        return construct_value(inner, field_value)

    # Nested types
    # list
    # dict
    elif get_origin(t) is list:
        if not isinstance(field_value, list):
            raise ClanError(f"Expected list, got {field_value}", location=f"{loc}")

        return [construct_value(get_args(t)[0], item) for item in field_value]
    elif get_origin(t) is dict and isinstance(field_value, dict):
        return {
            key: construct_value(get_args(t)[1], value)
            for key, value in field_value.items()
        }
    elif get_origin(t) is Literal:
        valid_values = get_args(t)
        if field_value not in valid_values:
            raise ClanError(
                f"Expected one of {valid_values}, got {field_value}", location=f"{loc}"
            )
        return field_value

    elif get_origin(t) is Annotated:
        (base_type,) = get_args(t)
        return construct_value(base_type, field_value)

    # elif get_origin(t) is Union:

    # Unhandled
    else:
        raise ClanError(f"Unhandled field type {t} with value {field_value}")


def construct_dataclass(t: type[T], data: dict[str, Any], path: list[str] = []) -> T:
    """
    type t MUST be a dataclass
    Dynamically instantiate a data class from a dictionary, handling nested data classes.
    """
    if not is_dataclass(t):
        raise ClanError(f"{t.__name__} is not a dataclass")

    # Attempt to create an instance of the data_class#
    field_values: dict[str, Any] = {}
    required: list[str] = []

    for field in fields(t):
        if field.name.startswith("_"):
            continue
        # The first type in a Union
        # str <- None | str | Path
        field_type: type[Any] = unwrap_none_type(field.type)  # type: ignore
        data_field_name = field.metadata.get("alias", field.name)

        if (
            field.default is dataclasses.MISSING
            and field.default_factory is dataclasses.MISSING
        ):
            required.append(field.name)

        # Populate the field_values dictionary with the field value
        # if present in the data
        if data_field_name in data:
            field_value = data.get(data_field_name)

            if field_value is None and (
                field.type is None or is_type_in_union(field.type, type(None))
            ):
                field_values[field.name] = None
            else:
                field_values[field.name] = construct_value(field_type, field_value)

    # Check that all required field are present.
    for field_name in required:
        if field_name not in field_values:
            formatted_path = " ".join(path)
            raise ClanError(
                f"Default value missing for: '{field_name}' in {t} {formatted_path}, got Value: {data}"
            )

    return t(**field_values)  # type: ignore


def from_dict(t: type[G], data: dict[str, Any] | Any, path: list[str] = []) -> G:
    if is_dataclass(t):
        if not isinstance(data, dict):
            raise ClanError(f"{data} is not a dict. Expected {t}")
        return construct_dataclass(t, data, path)  # type: ignore
    else:
        return construct_value(t, data, path)
