// import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import { NavigationMenu } from "radix-ui";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <div className="rounded-b-lg text-black p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        {/* Brand */}
        <Link to="/" className="text-xl w-fit font-bold">
          Youtube Parser
        </Link>

        {/* Navigation Links */}
        <NavigationMenu.Root className="relative z-10 flex w-fit justify-end border-0">
          <NavigationMenu.List className="center m-0 flex list-none  p-1 ">
            <NavigationMenu.Item>
              <NavigationMenu.Link className="text-black hover:bg-gray-100 px-3 py-2 rounded-md block select-none text-[15px] font-medium leading-none no-underline outline-none focus:shadow-[0_0_0_2px]" >
                <Link to="/AllVideos">
                All Videos
                </Link>
              </NavigationMenu.Link>
            </NavigationMenu.Item>
          </NavigationMenu.List>
        </NavigationMenu.Root>
      </div>
    </div>
  );
};

export default Navbar;
