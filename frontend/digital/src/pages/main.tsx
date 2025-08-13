import Mapping from "@/components/mapping"
import { Button } from "@mui/material"
import Grid from "@mui/material/Grid"


function Main() {
    return (
        <>
        <Grid container spacing={1}>
            <Grid size={{ xs: 4 }} style={{border: "1px solid black", height: "100vh"}}>
                <h1 style={{textAlign: 'center'}}>Understand/Simulate</h1>
            </Grid>
            <Grid size={{ xs: 8 }} style={{border: "1px solid black", height: "62.5vh"}}>
                <Mapping />
            </Grid>
            
            
            
        </Grid>
        </>
    )
}

export default Main;