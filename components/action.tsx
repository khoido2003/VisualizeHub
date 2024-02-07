"use client";

import { DropdownMenuContentProps } from "@radix-ui/react-dropdown-menu";

interface ActionProps {
  children: React.ReactNode;
  side?: DropdownMenuContentProps["side"];
  sideOffset?: DropdownMenuContentProps["sideOffset"];
  id: string;
  title: string;
}

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";
import { Link2, Pencil, Trash } from "lucide-react";
import { toast } from "sonner";

import { useApiMutation } from "@/hooks/use-api-mutation";
import { api } from "@/convex/_generated/api";
import { ConfirmModal } from "./confirm-modal";
import { Button } from "./ui/button";
import { useRenameModal } from "@/store/use-rename-model";

export const Action = ({
  children,
  id,
  title,
  side,
  sideOffset,
}: ActionProps) => {
  const { onOpen } = useRenameModal();

  const onCopyLink = () => {
    navigator.clipboard
      .writeText(`${window.location.origin}/board/${id}`)
      .then(() => {
        toast.success("Link copied!");
      })
      .catch(() => toast.error("Failed to copy link!"));
  };

  const { mutate: remove, pending } = useApiMutation(api.board.remove);

  const onDelete = () => {
    remove({ id })
      .then(() => {
        toast.success("Board deleted!");
      })
      .catch(() => toast.error("Failed to delete board"));
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>

      <DropdownMenuContent
        side={side}
        sideOffset={sideOffset}
        className="w-60"
        onClick={(e) => e.stopPropagation()}
      >
        <DropdownMenuItem onClick={onCopyLink} className="cursor-pointer p-3">
          <Link2 className="mr-2 h-4 w-4" />
          Copy board link
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => onOpen(id, title)}
          className="cursor-pointer p-3"
        >
          <Pencil className="mr-2 h-4 w-4" />
          Rename
        </DropdownMenuItem>

        <ConfirmModal
          header="Delete board?"
          description="This will delete the board and al of its contents."
          disabled={pending}
          onConfirm={onDelete}
        >
          <Button
            variant="ghost"
            className="w-full cursor-pointer justify-start p-3 text-sm font-normal"
          >
            <Trash className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </ConfirmModal>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
