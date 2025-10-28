import os
from dotenv import load_dotenv

def get_pdb_api_key():
    load_dotenv()
    return os.environ["PEERING_DB_API_KEY"]