import jwt

from app.core.config import JWT_ALGORITHM, JWT_SECRET_KEY
from app.core.security import create_access_token


token = create_access_token(
    user_id=1,
    role="ADMIN",
)

print("JWT:")
print(token)

payload = jwt.decode(
    token,
    JWT_SECRET_KEY,
    algorithms=[JWT_ALGORITHM],
)

print("\nDecoded payload:")
print(payload)