"""
Rate limiting contract.

This module intentionally exposes a small interface so production can use
Redis without coupling the inference pipeline to a specific Redis client.

Recommended production policy:
- per authenticated user
- per source IP
- per endpoint
- short burst limit
- daily quota
- count rejected/quality-failed attempts

Do not rely only on IP addresses because NAT/shared networks exist.
"""

import time
from collections import defaultdict
from threading import Lock

from app.exceptions import APIException
from app.schemas import ErrorCode


class InMemoryRateLimiter:
    """
    Development fallback only. Do not use this for multi-worker production.
    """

    def __init__(self, limit: int = 20, window_seconds: int = 60):
        self.limit = limit
        self.window_seconds = window_seconds
        self._events = defaultdict(list)
        self._lock = Lock()

    def check(self, key: str) -> None:
        now = time.time()

        with self._lock:
            events = self._events[key]
            cutoff = now - self.window_seconds
            events[:] = [t for t in events if t > cutoff]

            if len(events) >= self.limit:
                retry = max(1, int(events[0] + self.window_seconds - now))
                raise APIException(
                    ErrorCode.RATE_LIMITED.value,
                    "Too many requests. Please try again later.",
                    429,
                    {"retry_after_seconds": retry},
                )

            events.append(now)
