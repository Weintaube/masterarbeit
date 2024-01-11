from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    pass


class User(Base):
    __tablename__ = 'users'

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(40))

    # comments: Mapped[list["Comment"]] = relationship(back_populates="byUser")

    type: Mapped[str]

    __mapper_args__ = {
        "polymorphic_identity": "user",
        "polymorphic_on": "type"
    }


class SpecialUser(User):
    __tablename__ = 'special_users'
    id: Mapped[int] = mapped_column(ForeignKey("users.id"), primary_key=True)

    specialInfo: Mapped[str] = mapped_column(String(20), nullable=True)

    __mapper_args__ = {
        "polymorphic_identity": "special_user"
    }


class Comment(Base):
    __tablename__ = 'comments'

    id: Mapped[int] = mapped_column(primary_key=True)
    message: Mapped[str] = mapped_column(String(300), nullable=True)  # can be empty

    # byUser: Mapped[User] = relationship(back_populates="comments")
    # userId: Mapped[int] = mapped_column(ForeignKey("users.id"))
