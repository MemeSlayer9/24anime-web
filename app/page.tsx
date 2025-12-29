import Link from "next/link";
import Trending from "./Home/Trending";
import Recent from './Home/Recent'
import Popular from './Home/Popular';
export default function Home() {
  return (
    <div>
      

       <Trending />
       <Recent/>
        <Popular/>
      </div>
  );
}
