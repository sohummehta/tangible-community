"use client"

/*
import React from 'react';
import {Box} from '@mui/material';

const mockAssets = [
    {
      id: 'playground', 
      x: 100, 
      y: 150,
      width: 80,
      height: 40,
      color: '#FFD700'
    },
    {
      id: 'dogpark', 
      x: 300, 
      y: 200,
      width: 100,
      height: 100,
      color: 'green'
    },
    {
      id: 'restroom', 
      x: 200, 
      y: 80,
      width: 55,
      height: 30,
      color: '#ADD8E6'  
    },
];

const Mapping = () => {
    return (
        <div
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '4/3',
        height: 510,
        backgroundImage: 'url(/map.png)',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        border: '2px solid black',
        margin: '0 auto',
        marginTop: 20,
      }}
    >
      {mockAssets.map((asset) => (
        <div
          key={asset.id}
          style={{
            position: 'absolute',
            top: asset.y,
            left: asset.x,
            width: asset.width,
            height: asset.height,
            backgroundColor: asset.color,
            border: '2px solid black',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 12,
            textAlign: 'center',
            color: 'black'
          }}
        >
          {asset.id}
        </div>
      ))}
    </div>
    )
}
/*function Mapping() {
    return (
        <div>
            <h1>Mapping</h1>
        </div>
    )
}
*/

import React, { useLayoutEffect, useRef, useState } from "react";
import { Button } from "@mui/material";

type Asset = { id: string; x: number; y: number; width: number; height: number; color: string };

const mockAssets: Asset[] = [
  { id: "playground", x: 100, y: 150, width: 80,  height: 40,  color: "#FFD700" },
  { id: "dogpark",    x: 300, y: 200, width: 100, height: 100, color: "green"   },
  { id: "restroom",   x: 200, y:  80, width: 55,  height: 30,  color: "#ADD8E6" },
];

/**
 * Choose the coordinate system you authored against.
 * If you originally placed objects on a 600×450 canvas, keep these as 600/450.
 * If you want to use the map’s native pixels instead, set to 2800/1054
 * and input asset coords/sizes in that space.
 */
const BASE_W = 600;
const BASE_H = 450;

// Real image pixels (what you told me)
const IMG_W = 2800;
const IMG_H = 1054;
const IMG_RATIO = IMG_W / IMG_H; // ≈ 2.6578

export default function Mapping() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 900, h: Math.round(900 / IMG_RATIO) });

  // Track container width and compute height from the true image ratio
  useLayoutEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;

    const update = () => {
      const w = el.getBoundingClientRect().width;
      const h = w / IMG_RATIO;
      setSize({ w, h });
    };

    const ro = new ResizeObserver(update);
    ro.observe(el);
    update();
    return () => ro.disconnect();
  }, []);

  const scaleX = size.w / BASE_W;
  const scaleY = size.h / BASE_H;

  return (
    <div ref={containerRef} style={{ width: "100%", maxWidth: 1100, margin: "0 auto" }}>
      <div
        style={{
          position: "relative",
          width: "100%",
          height: size.h,                  // height derived from ratio
          border: "2px solid #000",
          backgroundImage: 'url("/map.png")',
          backgroundSize: "cover",         // keeps fill without letterboxing
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundColor: "#dceac2",      // optional tint
        }}
      >
        {mockAssets.map((a) => (
          <div
            key={a.id}
            style={{
              position: "absolute",
              top: a.y * scaleY,
              left: a.x * scaleX,
              width: a.width * scaleX,
              height: a.height * scaleY,
              backgroundColor: a.color,
              border: "2px solid black",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              color: "black",
              boxSizing: "border-box",
            }}
          >
            {a.id}
          </div>
        ))}
        
      </div>
    </div>
  );
}



//export default Mapping;
