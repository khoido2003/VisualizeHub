"use client";

import { api } from "@/convex/_generated/api";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface NewBoardButtonProps {
  orgId: string;
  disabled?: boolean;
}

export const NewBoardButton = ({ orgId, disabled }: NewBoardButtonProps) => {
  const { mutate: create, pending } = useApiMutation(api.board.create);

  const router = useRouter();

  const onClick = () => {
    create({
      orgId,
      title: "Untitled",
    })
      .then((id) => {
        toast.success("Board created successfully!");
        router.push(`/board/${id}`);
      })
      .catch(() => {
        toast.error("Failed to create!");
      });
  };

  return (
    <button
      disabled={pending || disabled}
      onClick={onClick}
      className={cn(
        "col-span-1 flex aspect-[100/127] cursor-pointer flex-col items-center justify-center rounded-lg bg-indigo-500 py-6 hover:bg-indigo-700",
        (pending || disabled) &&
          "cursor-not-allowed opacity-75 hover:bg-indigo-500",
      )}
    >
      <div />
      <Plus className="h-12 w-12 stroke-1 text-white" />
      <p className="text-xs font-light text-white">New Board</p>
    </button>
  );
};
