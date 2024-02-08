import { Loader } from "lucide-react";
import { InfoSkeleton } from "./info";
import Participants, { ParticipantsSkeleton } from "./participants";
import { ToolBarSkeleton } from "./toolbar";

export const Loading = () => {
  return (
    <main className="relative flex h-full w-full touch-none items-center justify-center bg-neutral-100">
      <Loader className="h-6 w-6 animate-spin text-muted-foreground" />
      <InfoSkeleton />
      <ParticipantsSkeleton />
      <ToolBarSkeleton />
    </main>
  );
};
