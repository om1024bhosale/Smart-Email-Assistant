
import { useState } from 'react';
import axios from 'axios';

import './App.css'
import { Container, Typography, TextField, Box, FormControl, Select, MenuItem, InputLabel, Button, CircularProgress } from '@mui/material';
function App() {
  const [emailContent, setEmailContent] = useState('');
  const [tone, setTone] = useState('');
  const [generatedReply, setGeneratedReply] = useState('');
  const [loading, setLoading] = useState(false);

const handleSubmit = async () => {
  setLoading(true);
  try {
    const response = await axios.post(
      "http://localhost:8080/api/email/generate",
      {
        emailContent,
        tone
      },
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

    setGeneratedReply(
      typeof response.data === "string"
        ? response.data
        : JSON.stringify(response.data)
    );
  } catch (error) {
    console.error(error);
  } finally {
    setLoading(false);
  }
};


  return (
    <Container maxWidth="md"sx={{py:4}} >
      <Typography variant='h3' component = 'h1' gutterBottom >
        Email Reply Generator
      </Typography>
      <Box sx={{mx:3}} >
        <TextField
          fullWidth
          multiline
          rows={6}
          variant='outlined'
          label = "Original Email Content"
          value={emailContent || ''}
          onChange={(e)=> setEmailContent(e.target.value)}
          sx={{mb:2}}
        />
      <FormControl fullWidth sx={{mb:2}}>
        <InputLabel >Tone (Optional)</InputLabel>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={tone ||''}
          label="Tone (Optional)"
          onChange={(e=>setTone(e.target.value) )}
        >
          <MenuItem value="">None</MenuItem>
          <MenuItem value="professional">Professional</MenuItem>
          <MenuItem value="casual">Casual</MenuItem>
          <MenuItem value="friendly">Friendly</MenuItem>
        </Select>
      </FormControl>
      <Button variant="contained"
      sx={{mb:2}}
      onClick={handleSubmit}
      disabled={!emailContent || loading} >
        {loading? <CircularProgress size={24}/>:"Generate Reply" }
      </Button> 
      </Box>

      <Box sx={{mx:3}} >
        <TextField
        sx={{mb:2}}
          fullWidth
          multiline
          rows={6}
          variant='outlined'
          
          value={generatedReply || ''}
         inputProps={{readOnly: true}}
        />

        <Button
       
          variant='outlined'
          onClick={()=> navigator.clipboard.write(generatedReply)}
        >
          Copy To Clipboard
        </Button>

      </Box>
    </Container>
  )
}

export default App
