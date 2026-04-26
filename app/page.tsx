import Trending from "./Home/Trending";
import Recent from './Home/Recent';
import Popular from './Home/Popular';

export default function Home() {
  return (
    <div className="bg-black min-h-screen">

      {/* Trending — full width */}
      <Trending />

      {/* Body: Recent (main) + Popular (sidebar) */}
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-8 flex flex-col lg:flex-row gap-6">

        {/* Left — Latest Release grid */}
        <div className="flex-1 min-w-0">
          <Recent />
        </div>

        {/* Right — Popular ranked list */}
        <aside className="w-full lg:w-[320px] flex-shrink-0">
          <Popular />
        </aside>

      </div>
    </div>
  );
}