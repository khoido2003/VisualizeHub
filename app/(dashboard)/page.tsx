"use client";

import { useOrganization } from "@clerk/nextjs";
import { EmptyOrg } from "./_components/empty-org";
import { BoardList } from "./_components/board-list";

interface DashBoardPageProps {
  searchParams: {
    search?: string;
    favourites?: string;
  };
}

const DashBoardPage = ({ searchParams }: DashBoardPageProps) => {
  const { organization } = useOrganization();

  return (
    <div className="h-[calc(100%-80px)] flex-1 p-6">
      {!organization ? (
        <EmptyOrg />
      ) : (
        <p>
          <BoardList orgId={organization.id} query={searchParams} />
        </p>
      )}
    </div>
  );
};

export default DashBoardPage;
