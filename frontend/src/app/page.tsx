import Image from "next/image";
import Mapping from "@/components/mapping"
import { Button } from "@mui/material"
import Link from "next/link";

export default function Home() {
  return (
    <>
    <div style={{padding: '10px', display: 'flex', gap: '10px'}}>
      <Button variant="contained" color="primary" href="/asset-config">Asset configuration</Button>
      <Button variant="contained" color="secondary" href="/leaflet-map">Dynamic Map (Leaflet)</Button>
      <Button variant="contained" color="success" href="/dynamic-map">Full Screen Map</Button>
    </div>
    <div>
      <h1 style = {{textAlign: 'center'}}> 1-to-1 Mapping Demo</h1>
      <Mapping />
    </div>
    </>
  );
}
