import { Plus } from "lucide-react";
import { OrganizationProfile } from "@clerk/nextjs";

import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export const InviteButton = () => {
  return (
    <Dialog>
      <DialogTrigger>
        <Button variant="outline">
          <Plus className="mr-2 h-4 w-4 " />
          Invite members
        </Button>

        <DialogContent className="max-w-[880px] border-none bg-transparent p-0">
          <OrganizationProfile />
        </DialogContent>
      </DialogTrigger>
    </Dialog>
  );
};
