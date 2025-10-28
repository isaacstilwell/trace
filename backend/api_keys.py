import os
from dotenv import load_dotenv

def get_pdb_api_key():
    """
    Gets and returns the PDB API key from .env
    """

    load_dotenv()
    return os.environ["PEERING_DB_API_KEY"]