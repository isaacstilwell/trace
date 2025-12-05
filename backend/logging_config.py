# logging_config.py
import logging
from logging.config import dictConfig
import sys
import colorlog

def setup_logging():
    """
    Sets up logging for the app
    """

    # Define the logging configuration (lifted from https://betterstack.com/community/guides/logging/logging-with-fastapi/)
    log_config = {
        "version": 1,
        "disable_existing_loggers": False,
        "formatters": {
            "default": {
                "()": 'colorlog.ColoredFormatter',
                "format": "%(asctime)s [%(log_color)s%(levelname)-8s%(reset)s] %(blue)s%(message)s",
                "datefmt": "%Y-%m-%d %H:%M:%S",
                "log_colors": {
                    'DEBUG': 'cyan',
                    'INFO': 'green',
                    'WARNING': 'yellow',
                    'ERROR': 'red',
                    'CRITICAL': 'red,bg_white',
                },
            },
        },
        "handlers": {
            "console": {
                "class": "logging.StreamHandler",
                "level": "INFO",
                "formatter": "default",
                "stream": "ext://sys.stdout",
            },
        },
        "loggers": {
            "app": {"handlers": ["console"], "level": "INFO", "propagate": False},
        },
        "root": {"handlers": ["console"], "level": "INFO"},
    }

    # Apply config
    dictConfig(log_config)

def get_logger():
    """
    Returns the logger for the app
    """

    return logging.getLogger("app")