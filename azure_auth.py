import os
import msal
from dotenv import load_dotenv

load_dotenv()

CLIENT_ID = os.getenv("CLIENT_ID")
TENANT_ID = os.getenv("TENANT_ID")
CLIENT_SECRET = os.getenv("CLIENT_SECRET")

AUTHORITY = f"https://login.microsoftonline.com/{TENANT_ID}"

app = msal.ConfidentialClientApplication(
  client_id=CLIENT_ID,
  authority=AUTHORITY,
  client_credential=CLIENT_SECRET
)

token_response = app.acquire_token_for_client(
  scopes=["https://graph.microsoft.com/.default"]
)

if "access_token" in token_response:
  print("Access token created successfully")
  print(token_response["access_token"])
else:
  print("Token generation failed")
  print(token_response)
