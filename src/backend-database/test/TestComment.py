import requests

from AlchemyDatabase import Comment, User
from MarshmallowSchemas import CommentSchema

APY_URL = 'http://127.0.0.1:8001'

# post one
# u = User(name="Leowulf Alphason")
c = Comment(message="Test comment.")  # , byUser=u)
c_json = CommentSchema().dump(c)
print(c_json)
response = requests.post(f'{APY_URL}/comments/_', json=c_json)
print(response)
print(response.json())

# get all
response = requests.get(f'{APY_URL}/comments')
print(response.json())

# get one

# delete one