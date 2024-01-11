import os

from flask import Flask, request
from flask_cors import CORS
from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from AlchemyDatabase import Base, Comment
from MarshmallowSchemas import CommentSchema
from utilities.LogRoutes import log_routes

# create flask app
app = Flask("ExampleAPY")
app.app_context().push()

# setup CORS
CORS(app)

# setup flask-alchemy db connection
db_path = os.path.join(os.path.abspath(os.path.dirname(__file__)), 'example.db')
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
def one_comment(id):
    """ Get or post a Comment. """
    if request.method == "POST":
        with Session(engine) as session:
            comment_data = request.json
            print("cd", comment_data)
            if comment_data.get('id', None) is None:
                # create new comment
                comment = Comment(
                    message=comment_data.get('message', ''),
                    # userId=comment_data.get('userId', None)
                )
                session.add(comment)
            else:
                # change existing comment
                comment = CommentSchema().load(request.json)
                session.merge(comment)
            session.commit()
            return CommentSchema().dump(comment), 200
    elif request.method == "DELETE":
        with Session(engine) as session:
            comment = session.get(Comment, id)
            session.delete(comment)
            session.commit()
            return comment, 200
    else:
        with Session(engine) as session:
            comment = session.get(Comment, id)
            return CommentSchema().dump(comment), 200


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
