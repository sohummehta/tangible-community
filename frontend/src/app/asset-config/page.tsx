import React from 'react';
// import Mapping from "@/components/mapping"
import { Button, TextField } from "@mui/material"
import Grid from "@mui/material/Grid";

export default function AssetConfig() {
    return (
        <>
        <Grid container spacing={1}>
            <Grid size={{ xs: 6 }} style={{border: "1px solid black", height: "100vh"}}>
                <h4>Enter the size of your land</h4>
                <TextField id="outlined-basic" label="Outlined" variant="outlined" />
            </Grid>
            <Grid size={{ xs: 6 }} style={{border: "1px solid black", height: "100vh"}}>
                
            </Grid>
        </Grid>
        </>
    )
}
