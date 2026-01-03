import Navbar from "../shared/Navbar";
import Footer from "../shared/Footer";
import { Outlet } from "react-router-dom";

const MainLayout = () => {
 return (
   <div className="flex flex-col min-h-screen">
     <Navbar />
     <main className="flex-grow flex flex-col">
       <Outlet />
     </main>
     <Footer />
   </div>
 );
};

export default MainLayout;