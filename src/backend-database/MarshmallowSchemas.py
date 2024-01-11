from marshmallow_sqlalchemy import SQLAlchemyAutoSchema

from AlchemyDatabase import Comment


class CommentSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Comment
        include_fk = True  # include foreign keys
