import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useRouter } from "next/navigation";

// import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useOrganization } from "@clerk/nextjs";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { toast } from "sonner";

export const EmptyBoards = () => {
  const router = useRouter();
  const { organization } = useOrganization();

  // const create = useMutation(api.board.create);
  const { mutate, pending } = useApiMutation(api.board.create);

  const onClick = () => {
    if (!organization) return;

    mutate({
      orgId: organization.id,
      title: "Untitled",
    })
      .then((id) => {
        toast.success("Board created successfully!");
        router.push(`/board/${id}`);
      })
      .catch(() => toast.error("Failed to create board!"));
  };

  return (
    <div className="flex h-full  flex-col items-center justify-center">
      <Image src="/empty-6.svg" height={300} width={300} alt="Empty search" />

      <h2 className="mt-1 text-2xl font-semibold">Create your first board</h2>
      <p className="mt-2 text-sm text-muted-foreground ">
        Start by creating a board for your organization
      </p>
      <div className="mt-6">
        <Button disabled={pending} onClick={onClick} size="lg">
          Create Board
        </Button>
      </div>
    </div>
  );
};
