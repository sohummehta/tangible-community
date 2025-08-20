import React from 'react';
import Mapping from "@/components/mapping"
import {Typography, Button, Box } from "@mui/material"
import Grid from "@mui/material/Grid"
import Understand from '@/components/understand';

export default function Main() {
    return (
        <>
        <Grid container spacing={0.5} sx = {{height: {xs: "auto", md: "100vh"}, alignItems: 'stretch'}}>
            <Grid size={{xs: 12, md:4}} sx={{border: "1px solid black", overflow: 'auto', p: 1.5}}>
                <Typography align = "center" variant = "h6">Understand</Typography>
                <Understand />
            </Grid>
            
            <Grid size ={{xs: 12, md: 8}} sx={{display: "flex",flexDirection: "column",gap: 0.5,height: { xs: "auto", md: "100%" },}}>
                <Box sx = {{border: "1px solid black", p: 1, flex: { xs: "0 0 auto", md: "2 1 60%" }, display: "flex", flexDirection: "column", minHeight: { xs: 260, md: 0 },}}>
                    <Typography align = "center" variant = "h6">Mapping</Typography>
                    <Box sx = {{flex: 1, minHeight: 0}}>
                        <Mapping />
                    </Box>
                    <Box sx={{display: "flex", justifyContent: "center", mt: 1}}>
                        <Button variant = "contained" color= "primary" size = "small">Change View</Button>
                    </Box>
                </Box>

                <Box sx = {{border : "1px solid black", p: 1, flex: { xs: "0 0 auto", md: "1 1 40%" }, minHeight: { xs: 180, md: 0 }}}>
                    <Typography align = "center" variant = "h6">Feedback</Typography>
                </Box>
            </Grid>
        </Grid>
        </>
    )
}
