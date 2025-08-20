"use client";

import React, { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
 
// ------- Types -------
type AssetId = "baseball" | "playground" | "dogpark" | "restroom";

type Asset = {
  id: AssetId;
  title: string;
  imageUrl: string;
  imageAlt: string;
  basicProfile: Array<{ label: string; value: string }>;
  planningContext: string[];
  communityRelevance: string[];
  notes?: string[];
};

// ------- Hard-coded asset data (edit/extend as needed) -------
const ASSETS: Record<AssetId, Asset> = {
  baseball: {
    id: "baseball",
    title: "Baseball Field",
    imageUrl:
      "/asset-images/baseball.png",
    imageAlt: "aerial diagram of a baseball diamond",
    basicProfile: [
      { label: "Size", value: "Up to 105×105 m (varies by level)" },
      { label: "Footprint", value: "~7,000–12,000 m² (outfield depth)" },
      { label: "Approx. cost", value: "$250k–$1.5M+ (grading, turf, lights)" },
    ],
    planningContext: [
      "Intended population: youth (10–18) & adult recreation",
      "Usage patterns: seasonal; busiest weekends/evenings",
      "Lighting/noise: consider nearby residences",
      "Drainage & maintenance requirements",
    ],
    communityRelevance: [
      "Hosts leagues/tournaments (visitor draw)",
      "Can double as large event space (with infield protection)",
      "Common feedback: 'too few baseball courts around this space'",
    ],
    notes: [
      "Alt uses: outdoor movie nights, fairs, fitness camps",
    ],
  },
  playground: {
    id: "playground",
    title: "Playground",
    imageUrl:
      "/asset-images/playground.png",
    imageAlt: "playground equipment",
    basicProfile: [
      { label: "Size", value: "20×40 m activity zone" },
      { label: "Footprint", value: "800–1,000 m² incl. fall zones" },
      { label: "Approx. cost", value: "$150k–$600k+ depending on features" },
    ],
    planningContext: [
      "Target ages: 2–5 & 5–12 (separate zones)",
      "Shade and seating for caregivers",
      "Inclusive & accessible surfacing (ASTM/ADA)",
    ],
    communityRelevance: [
      "High daily use; social hub for families",
      "Good adjacency: restrooms, picnic, parking",
    ],
  },
  dogpark: {
    id: "dogpark",
    title: "Dog Park",
    imageUrl:
      "/asset-images/dogpark.png",
    imageAlt: "dogs and people in a fenced dog park",
    basicProfile: [
      { label: "Size", value: "Up to 80×50 m; split small/large" },
      { label: "Footprint", value: "2,000–4,000 m² incl. buffers" },
      { label: "Approx. cost", value: "$75k–$400k (fencing, surfacing)" },
    ],
    planningContext: [
      "Drainage/odor control; surfacing (DG, turf, mulch)",
      "Noise considerations & setbacks from homes",
    ],
    communityRelevance: [
      "Year‑round use; fosters informal community",
      "Programming with shelters/trainers possible",
    ],
  },
  restroom: {
    id: "restroom",
    title: "Restroom",
    imageUrl:
      "/asset-images/restroom.png",
    imageAlt: "public restroom sign pictogram",
    basicProfile: [
      { label: "Size", value: "~8×12 m single building (example)" },
      { label: "Footprint", value: "~100 m² incl. service area" },
      { label: "Approx. cost", value: "$250k–$800k+ (utilities, ADA)" },
    ],
    planningContext: [
      "Sightlines & safety (CPTED)",
      "Servicing & utility access",
    ],
    communityRelevance: [
      "Enables longer park stays",
      "Critical near high‑use assets (playgrounds, courts)",
    ],
  },
};

// ------- Presentational helpers -------
function BulletedList({ items }: { items: string[] }) {
  return (
    <Stack component="ul" sx={{ m: 0, pl: 2, listStyle: "disc" }} spacing={0.5}>
      {items.map((t, i) => (
        <Box key={i} component="li">
          <Typography variant="body2" color="text.secondary">
            {t}
          </Typography>
        </Box>
      ))}
    </Stack>
  );
}

// ------- Detailed panel -------
function AssetPanel({ asset }: { asset: Asset }) {
  return (
    <Card elevation={0} sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "220px 1fr" }, gap: 2, borderRadius: 3, border: 1, borderColor: "divider" }}>
      <CardMedia
        component="img"
        image={asset.imageUrl}
        alt={asset.imageAlt}
        sx={{ width: 220, height: 220, objectFit: "cover", borderTopLeftRadius: (t) => t.shape.borderRadius, borderBottomLeftRadius: { md: (t) => t.shape.borderRadius, xs: 0 } }}
      />

      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }} gutterBottom>
          {asset.title}
        </Typography>

        <Typography variant="overline" color="text.secondary">Basic profile</Typography>
        <Stack spacing={0.5} sx={{ mt: 0.5, mb: 1 }}>
          {asset.basicProfile.map((row, i) => (
            <Typography key={i} variant="body2">
              <strong>{row.label}:</strong> {row.value}
            </Typography>
          ))}
        </Stack>

        <Divider sx={{ my: 1.5 }} />

        <Typography variant="overline" color="text.secondary">Urban planning context</Typography>
        <BulletedList items={asset.planningContext} />

        <Divider sx={{ my: 1.5 }} />

        <Typography variant="overline" color="text.secondary">Community relevance</Typography>
        <BulletedList items={asset.communityRelevance} />

        {asset.notes && asset.notes.length > 0 && (
          <>
            <Divider sx={{ my: 1.5 }} />
            <Typography variant="overline" color="text.secondary">Notes / alternative uses</Typography>
            <BulletedList items={asset.notes} />
          </>
        )}
      </CardContent>
    </Card>
  );
}

// ------- Public component for your Understand/Simulate column -------
// Pass `markerId` from your ArUco detector when you wire it up.
export default function Understand({ markerId }: { markerId?: number }) {
  // Example mapping from marker IDs to asset IDs
  const markerToAsset: Record<number, AssetId> = {
    101: "baseball",
    202: "playground",
    303: "dogpark",
    404: "restroom",
  };

  const [demoMarkerId, setDemoMarkerId] = useState<number | undefined>(markerId ?? 101);
  const assetId: AssetId | undefined = useMemo(() => (demoMarkerId == null ? undefined : markerToAsset[demoMarkerId]), [demoMarkerId]);
  const asset = assetId ? ASSETS[assetId] : undefined;

  return (
    <Box sx={{ p: 2, height: "100%", display: "flex", flexDirection: "column", gap: 2 }}>
      {/* Demo controls — remove when wired to detector */}
      <Card variant="outlined" sx={{ p: 1.5, borderStyle: "dashed" }}>
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
          <Typography variant="body2" sx={{ fontWeight: 600 }}>Simulate detected marker:</Typography>
          {[101, 202, 303, 404].map((id) => (
            <Button key={id} size="small" variant={demoMarkerId === id ? "contained" : "outlined"} onClick={() => setDemoMarkerId(id)}>
              #{id}
            </Button>
          ))}
          <Button size="small" variant="outlined" onClick={() => setDemoMarkerId(undefined)}>Clear</Button>
        </Stack>
      </Card>

      <Box sx={{ flex: 1, minHeight: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {asset ? (
          <AssetPanel asset={asset} />
        ) : (
          <Card variant="outlined" sx={{ p: 6, width: "100%", textAlign: "center" }}>
            <Typography color="text.secondary">No asset selected. Detect a marker to show details.</Typography>
          </Card>
        )}
      </Box>
    </Box>
  );
}
