"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

import { EmptyBoards } from "./empty-boards";
import { EmptyFavourites } from "./empty-favourites";
import { EmptySearch } from "./empty-search";
import { BoardCard } from "./board-card";
import { NewBoardButton } from "./new-board-btn";

interface BoardListProps {
  orgId: string;
  query: {
    search?: string;
    favourites?: string;
  };
}

export const BoardList = ({ orgId, query }: BoardListProps) => {
  const data = useQuery(api.boards.get, { orgId });

  if (true) {
    return (
      <div>
        <h2 className="text-3xl">
          {query.favourites ? "Favourite boards" : "Team boards"}
        </h2>

        <div className="mt-8 grid grid-cols-1 gap-5 pb-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
          <NewBoardButton orgId={orgId} disabled />
          <BoardCard.Skeleton />
          <BoardCard.Skeleton />
          <BoardCard.Skeleton />
          <BoardCard.Skeleton />
          <BoardCard.Skeleton />
          <BoardCard.Skeleton />
          <BoardCard.Skeleton />
          <BoardCard.Skeleton />
          <BoardCard.Skeleton />
        </div>
      </div>
    );
  }

  if (!data?.length && query.search) {
    return <EmptySearch />;
  }

  if (!data?.length && query.favourites) {
    return <EmptyFavourites />;
  }

  if (!data?.length) {
    return <EmptyBoards />;
  }

  return (
    <div>
      <h2 className="text-3xl">
        {query.favourites ? "Favourite boards" : "Team boards"}
      </h2>

      <div className="mt-8 grid grid-cols-1 gap-5 pb-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
        <NewBoardButton orgId={orgId} />
        {data?.map((board) => (
          <BoardCard
            key={board._id}
            id={board._id}
            title={board.title}
            imageUrl={board.imageUrl}
            authorId={board.authorId}
            authorName={board.authorName}
            createdAt={board._creationTime}
            orgId={board.orgId}
            isFavourite={false}
          />
        ))}
      </div>
    </div>
  );
};