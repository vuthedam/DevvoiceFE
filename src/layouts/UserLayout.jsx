import { Outlet } from "react-router-dom";
import Navbar from "./Navbar.jsx";
import Footer from "./Footer.jsx";

const UserLayout = () => (
  <div className="d-flex flex-column min-vh-100">
    <Navbar />
    <main className="container flex-grow-1 py-4">
      <Outlet />
    </main>
    <Footer />
  </div>
);

export default UserLayout;
