"use client";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";

import { cn } from "@/lib/utils";
import { Poppins } from "next/font/google";
import Image from "next/image";
import Link from "next/link";

import { Hint } from "@/components/hint";
import { Button } from "@/components/ui/button";
import { useRenameModal } from "@/store/use-rename-model";
import { Action } from "@/components/action";
import { Menu } from "lucide-react";
interface InfoProps {
  boardId: string;
}

const font = Poppins({
  subsets: ["latin"],
  weight: ["600"],
});

export const TabSeparator = () => {
  return <div className="px-1.5 text-neutral-300">|</div>;
};

const Info = ({ boardId }: InfoProps) => {
  const { onOpen } = useRenameModal();

  const data = useQuery(api.board.get, {
    id: boardId as Id<"boards">,
  });

  return (
    <div className="absolute left-2 top-2 flex h-12 items-center rounded-md bg-white px-1.5 shadow-md">
      <Hint label="Back to dashboard" side="bottom" sideOffset={10}>
        <Button asChild variant="board" className="px-2 ">
          <Link href="/">
            <Image src="/logo.svg" alt="board logo" height={40} width={40} />

            <span
              className={cn(
                "ml-2 text-xl font-semibold text-black",
                font.className,
              )}
            >
              Visualize
            </span>
          </Link>
        </Button>
      </Hint>
      <TabSeparator />

      <Hint label="Edit title" side="bottom" sideOffset={10}>
        <Button
          variant="board"
          className="px-2 text-base font-normal"
          onClick={() => {
            onOpen(data?._id!, data?.title!);
          }}
        >
          {data?.title}
        </Button>
      </Hint>

      <TabSeparator />

      <Action
        id={data?._id!}
        title={data?.title!}
        side="bottom"
        sideOffset={10}
      >
        {
          <div>
            <Hint label="Main Menu" side="bottom" sideOffset={10}>
              <Button size="icon" variant="board">
                <Menu />
              </Button>
            </Hint>
          </div>
        }
      </Action>
    </div>
  );
};

export function InfoSkeleton() {
  return (
    <div className="absolute left-2 top-2 flex h-12 w-[300px] items-center rounded-md bg-white px-1.5 shadow-md" />
  );
}

export default Info;
