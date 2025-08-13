import Image from "next/image";
import Mapping from "@/components/mapping"

export default function Home() {
  return (
    <>
    <div>
      <h1 style = {{textAlign: 'center'}}> 1-to-1 Mapping Demo</h1>
      <Mapping />
    </div>
    </>
  );
}
