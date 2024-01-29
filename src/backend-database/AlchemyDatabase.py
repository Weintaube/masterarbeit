from sqlalchemy import String
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    pass


class Comment(Base):
    __tablename__ = 'comments'

    id: Mapped[int] = mapped_column(primary_key=True)

    typeRes: Mapped[str] = mapped_column(String(40))
    resourceId: Mapped[str] = mapped_column(String(40))  # or int?
    uri:Mapped[str] = mapped_column(String(100), nullable=True) #fix null
    title:Mapped[str] = mapped_column(String(100), nullable=True) #fix null

    typeComm: Mapped[str] = mapped_column(String(40))
    description: Mapped[str] = mapped_column(String(300), nullable=True)  # can be empty

    # creationTime: Mapped[str] = mapped_column(String(20), nullable=True)