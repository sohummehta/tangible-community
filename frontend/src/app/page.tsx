import Image from "next/image";
import Mapping from "@/components/mapping"
import { Button } from "@mui/material"

export default function Home() {
  return (
    <>
    <div style={{padding: '10px'}}>
      <Button variant="contained" color="primary" href="/asset-config">Asset configuration</Button>
    </div>
    <div>
      <h1 style = {{textAlign: 'center'}}> 1-to-1 Mapping Demo</h1>
      <Mapping />
    </div>
    </>
  );
}
