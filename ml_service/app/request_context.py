import uuid
from fastapi import Request


def request_id(request: Request) -> str:
    return getattr(request.state, "request_id", "req_unknown")


def new_request_id() -> str:
    return f"req_{uuid.uuid4().hex}"
