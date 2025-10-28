import sys
import re
import subprocess
from fastapi import HTTPException, status
from logging_config import get_logger

logger = get_logger()

def get_route(host, hops=50):
    """
    Gets the list of IP addresses visited on a traceroute to a given host

    Args:
        host (string): the address to run the traceroute on
        hops (int): the maximum number of hops for the traceroute

    Returns:
        list: List of IP addresses logged to stdout after running traceroute
    """

    # get the traceroute command for the given host
    trace_cmd = _get_traceroute_cmd(host, hops)

    # get the results of the traceroute
    trace_result = _execute_traceroute(trace_cmd)

    # parse IPs from results of traceroute and return
    return _parse_ip_addresses(trace_result)

def _get_traceroute_cmd(host, hops):
    """
    Provides a traceroute command for the OS running the command

    Args:
        host (string): the address to run the traceroute on
        hops (int): maximum number of hops to run the traceroute on

    Returns:
        array: arguments to run in a traceroute call on the given OS
    """

    if (sys.platform == "win32"):
        return ["tracert", "-h", f"{hops}", "-w", "1", host]
    else:
        return ["traceroute", "-m", f"{hops}", "-q", "1", "-w", "1", host] # TODO: change to sudo tcptraceroute if possible

def _execute_traceroute(cmd):
    """
    Executes the traceroute command and returns the result
    """

    try:
        # try to run the subprocess
        res = subprocess.run(cmd, capture_output=True, check=True)
        logger.debug(f"[Route._execute_traceroute]: Got {res=} from subprocess")
        return res
    except subprocess.CalledProcessError as e:
        # catch subprocess errors and log them instead of breaking
        logger.error(f"Traceroute subprocess failed with error {e}")

def _parse_ip_addresses(result: subprocess.CompletedProcess):
    """
    Parses the result of a traceroute command

    Input:
        result (subprocess.CompletedProcess): The raw
            result of a traceroute command

    Output:
        List: List of IP addresses visited during the
            traceroute
    """

    # handle the empty stdout case gracefully
    if (not result.stdout):
        logger.error(f"No traceroute stdout to parse IP addresses from")
        return []

    # decode stdout bytes string to normal string
    trace_output = result.stdout.decode('utf-8')

    # create regex to match IP addresses inside parenthises
    ip_reg = re.compile(r'\([0-9\.]+\)')

    # get all IP addresses inside parenthises, then strip parens
    ip_addresses = [ip.strip('()') for ip in ip_reg.findall(trace_output)]

    # return list of IP addresses
    return ip_addresses
