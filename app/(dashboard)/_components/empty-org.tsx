import Image from "next/image";
import { CreateOrganization } from "@clerk/nextjs";

import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";

export const EmptyOrg = () => {
  return (
    <div className="flex h-full flex-col items-center justify-center">
      <Image src="/empty-2.svg" alt="empty" height={300} width={300} />

      <h2 className="mt-6 text-2xl font-semibold">Welcome to Visualize Hub</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Create an organization to get started
      </p>

      <div className="mt-6">
        <Dialog>
          <DialogTrigger>
            <Button>Create an organization</Button>
          </DialogTrigger>
          <DialogContent className="max-w-[400px] border-none bg-transparent p-0 ">
            <CreateOrganization />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};
