"use client";
import { Home, Info, CalendarDays, MapPin, Users } from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

                <div className="flex gap-4 md:gap-6 items-center">
                    <Link className="flex flex-col md:flex-row items-center gap-1 cursor-pointer hover:text-indigo-400 transition-all duration-300 ease-in-out" href="/">
                        <Home size={22} />
                        <span className="hidden md:inline">Home</span>
                    </Link>

                    <Link href="/about" className="flex flex-col md:flex-row items-center gap-1 cursor-pointer hover:text-indigo-400 transition-all duration-300 ease-in-out">
                        <Info size={22} />
                        <span className="hidden md:inline">About</span>
                    </Link>

                    <Link href="/timeline" className="flex flex-col md:flex-row items-center gap-1 cursor-pointer hover:text-indigo-400 transition-all duration-300 ease-in-out">
                        <CalendarDays size={22} />
                        <span className="hidden md:inline">Timeline</span>
                    </Link>

                    <Link href="/venue" className="flex flex-col md:flex-row items-center gap-1 cursor-pointer hover:text-indigo-400 transition-all duration-300 ease-in-out">
                        <MapPin size={22} />
                        <span className="hidden md:inline">Venue</span>
                    </Link>

                    <Link href="/speakers" className="flex flex-col md:flex-row items-center gap-1 cursor-pointer hover:text-indigo-400 transition-all duration-300 ease-in-out">
                        <Users size={22} />
                        <span className="hidden md:inline">Speakers</span>
                    </Link>
                </div>

                {/* Right Side Content */}
                <div className="ml-10 hidden md:block">
                    <Link
                        href="/register"
                        className="cursor-pointer 
							   border-2 border-white hover:border-blue-500
							   justify-items-center rounded-full w-30
							   bg-black p-3
							   transition-all duration-300 ml-10"
                    >
                        Register!
                    </Link>
                </div>
            </div>
        </div>
        {/* Right Side Content */}
        <div className="ml-10 hidden md:block">
          <a
            className="cursor-pointer 
                       border-2 border-white hover:border-blue-500
                       justify-items-center rounded-full w-30
                       bg-black p-3
                       transition-all duration-300 ml-10"
            href="/register"
          >
            Register!
          </a>
        </div>
      </div>
    </div>
  );
}