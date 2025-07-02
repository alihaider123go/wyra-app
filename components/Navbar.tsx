import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import Image from "next/image";
import React from "react";
import Logout from "./Logout";

const Navbar = async () => {

  const supabase = await createClient();
  const {data:{user}} = await supabase.auth.getUser();

  return (
    <nav className="border-b bg-background w-full flex items-center">
      <div className="flex w-full items-center justify-between my-4">
        <Link className="font-bold" href="/">
          Home
        </Link>

        <div className="flex items-center gap-x-5">
          <Link href="/private">
          <div className="max-w-md mx-auto flex items-center justify-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
              {/* <Image src="/logo.png" alt="Logo" width={40} height={40} className="mr-2"/> */}
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-heart w-8 h-8 text-white"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path></svg>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-montserrat">Wyra</h1>
          </div>
          </Link>
        </div>


        <div className="flex items-center gap-x-5">
          {!user ? (
            <Link href="/login">
              <div className="bg-blue-600 text-white text-sm px-4 py-2 rounded-sm">
                Login
              </div>
            </Link>
          ) : (
            <>
              <div className="flex items-center gap-x-5 text-sm">
                {user?.email}
              </div>
              <Logout />
            </>            
          )}
          
          
          
          
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
