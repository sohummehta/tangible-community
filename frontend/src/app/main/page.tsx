import React from 'react';
import Mapping from "@/components/mapping"
import {Typography } from "@mui/material"
import Grid from "@mui/material/Grid"
import Understand from '@/components/understand';

export default function Main() {
    return (
        <>
        <Grid container spacing={0.5}>
            <Grid size={{xs: 12, md:4}} sx={{border: "1px solid black", height: "100vh"}}>
                <Typography align = "center" variant = "h6">Understand/Simulate</Typography>
                <Understand />
            </Grid>
            
            <Grid size ={{xs: 12, md: 8}}>
                <Grid container direction = "column" spacing = {0.5} sx = {{height: "100vh"}}>
                    <Grid sx = {{border: "1px solid black", height: "62.5vh"}}>
                        <Mapping />
                    </Grid>

                    <Grid sx = {{border : "1px solid black", height: "37vh"}}>
                        <Typography align = "center" variant = "h6">Feedback</Typography>
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
        </>
    )
}
