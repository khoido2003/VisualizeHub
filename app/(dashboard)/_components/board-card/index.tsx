"use client";

import Image from "next/image";
import Link from "next/link";
import { Overlay } from "./overlay";
import { useAuth } from "@clerk/nextjs";
import { formatDistance, formatDistanceToNow } from "date-fns";
import { Footer } from "./footer";

import { Skeleton } from "@/components/ui/skeleton";
import { Action } from "@/components/action";
import { MoreHorizontal } from "lucide-react";

import { useApiMutation } from "@/hooks/use-api-mutation";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";

interface BoardCardProps {
  id: string;
  title: string;
  authorName: string;
  authorId: string;
  createdAt: number | string;
  imageUrl: string;
  orgId: string;
  isFavourite: boolean;
}

export const BoardCard = ({
  authorId,
  authorName,
  createdAt,
  id,
  imageUrl,
  isFavourite,
  orgId,
  title,
}: BoardCardProps) => {
  const { userId } = useAuth();
  const authorLabel = userId === authorId ? "You" : authorName;

  const createdAtLabel = formatDistanceToNow(createdAt, { addSuffix: true });

  const { mutate: onFavourite, pending: pendingFavourite } = useApiMutation(
    api.board.favourite,
  );
  const { mutate: onUnFavourite, pending: pendingUnFavourite } = useApiMutation(
    api.board.unfavourite,
  );

  const toggleFavourite = () => {
    if (isFavourite) {
      onUnFavourite({ id }).catch(() => {
        toast.error("Failed to unfavourite");
      });
    } else {
      onFavourite({ id, orgId }).catch(() => {
        toast.error("Failed to favourite");
      });
    }
  };

  return (
    <Link href={`/board/${id}`}>
      <div className="group flex aspect-[100/127] flex-col justify-between overflow-hidden rounded-lg border ">
        <div className="relative flex-1 bg-violet-50">
          <Image src={imageUrl} fill alt={title} className="object-fill" />
          <Overlay />
          <Action id={id} title={title} side="right">
            <button className="absolute right-1 top-1 px-3 py-2 opacity-0 outline-none transition-opacity group-hover:opacity-100">
              <MoreHorizontal className="text-white opacity-75 transition-opacity hover:opacity-100" />
            </button>
          </Action>
        </div>

        <Footer
          isFavourite={isFavourite}
          title={title}
          authorLabel={authorLabel}
          createdAtLabel={createdAtLabel}
          onClick={toggleFavourite}
          disabled={pendingFavourite || pendingUnFavourite}
        />
      </div>
    </Link>
  );
};

BoardCard.Skeleton = function BoardCardSkeleton() {
  return (
    <div className="aspect-[100/127] overflow-hidden rounded-lg">
      <Skeleton className="h-full w-full" />
    </div>
  );
};
