import os

from flask import Flask, request
from flask_cors import CORS
from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from AlchemyDatabase import Base, Comment
from MarshmallowSchemas import CommentSchema
from utilities.LogRoutes import log_routes

# create flask app
app = Flask("CommentDB")
app.app_context().push()

# setup CORS
CORS(app)

# setup flask-alchemy db connection
db_path = os.path.join(os.path.abspath(os.path.dirname(__file__)), 'ORKGComments.db')
engine = create_engine('sqlite:///' + db_path, echo=True)
Base.metadata.create_all(engine)


# declare routes
@app.route("/comments", methods=["GET"])
def all_comments():
    """ Get list of all Comments. """
    with Session(engine) as session:
        comments = session.query(Comment).all()
        return CommentSchema(many=True).dump(comments), 200

@app.route("/comments/<id>", methods=["GET", "POST", "DELETE"])
@app.route("/comments/<id>", methods=["GET", "POST", "DELETE"])
def one_comment(id):
    """ Get, post or delete a Comment. """
    if request.method == "POST":
        with Session(engine) as session:
            content = request.json
            if id == "_new":
                # create new comment
                comment = Comment(
                    typeRes=content.get('typeRes', None),
                    resourceId=content.get('resourceId', None),
                    uri=content.get('uri', None),
                    title=content.get('title', None),
                    typeComm=content.get('typeComm', None),
                    description=content.get('description', None)
                )
                session.add(comment)
            else:
                # change existing comment
                comment = session.query(Comment).get(id)
                if comment:
                    comment.typeRes = content.get('typeRes', comment.typeRes)
                    comment.resourceId = content.get('resourceId', comment.resourceId)
                    comment.uri = content.get('uri', comment.uri)
                    comment.title = content.get('title', comment.title)
                    comment.typeComm = content.get('typeComm', comment.typeComm)
                    comment.description = content.get('description', comment.description)
                else:
                    return "Comment not found", 404

            session.commit()
            return CommentSchema().dump(comment), 200
    elif request.method == "DELETE":
        with Session(engine) as session:
            comment = session.query(Comment).get(id)
            if comment:
                session.delete(comment)
                session.commit()
                return CommentSchema().dump(comment), 200
            else:
                return "Comment not found", 404
    else:
        with Session(engine) as session:
            comment = session.query(Comment).get(id)
            if comment:
                return CommentSchema().dump(comment), 200
            else:
                return "Comment not found", 404


if __name__ == '__main__':
    production = False
    ip = '0.0.0.0'
    port = 8001
    log_routes(app)
    if production:
        from waitress import serve
        serve(app, host=ip, port=port)
    else:
        app.run(debug=True, port=port)