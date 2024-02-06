import { List } from "./list";
import { NewButton } from "./new_button";

const Sidebar = () => {
  return (
    <div className="fixed left-0 z-[1] flex h-full w-[60px] flex-col gap-y-4 bg-blue-950 p-3 text-white">
      <List />
      <NewButton />
    </div>
  );
};

export default Sidebar;
