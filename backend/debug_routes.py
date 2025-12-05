from main import app
import logging_config
from undersea_cables import CableMapper

cableMapper = CableMapper()
logger = logging_config.get_logger()

@app.get("/debug/user")
def check_user():
    """Log which user is running commands"""
    import os
    import subprocess
    return {
        "os_user": os.getenv("USER"),
        "effective_uid": os.geteuid(),
        "whoami": subprocess.run(["whoami"], capture_output=True, text=True).stdout.strip(),
    }

@app.get("/debug/sudoTest")
def test_sudo():
    """Test to check if sudo works without password"""
    import subprocess
    try:
        result = subprocess.run(
            ["sudo", "tcptraceroute", "-m", "50", "-q", "1", "-w", "1", "google.com", "443"],
            capture_output=True,
            text=True,
            timeout=30
        )
        return {
            "returncode": result.returncode,
            "stdout": result.stdout[:500],
            "stderr": result.stderr[:500]
        }
    except Exception as e:
        return {"error": str(e)}

@app.get("/debug/cableData")
def get_cables():
    return cableMapper.cable_map

@app.post("/debug/getCables")
async def get_cables(latA: float, lonA: float, latB: float, lonB: float, tol: float):
    logger.debug(f"getCables input: {latA=}, {lonA=}, {latB=}, {lonB=}, {tol=}")
    return cableMapper.find_nearest_cable(latA, lonA, latB, lonB, tol=tol)