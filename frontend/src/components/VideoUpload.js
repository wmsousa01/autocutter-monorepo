'use client';
import { useState } from 'react';
import {
  Box,
  Button,
  Input,
  Text,
  VStack,
  Spinner,
  Code,
} from '@chakra-ui/react';

export default function VideoUpload() {
  const [video, setVideo] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [response, setResponse] = useState(null);

  const handleFileChange = (e) => {
    setVideo(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!video) return;

    const formData = new FormData();
    formData.append('video', video);

    setUploading(true);
    try {
      const res = await fetch('http://localhost:3001/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      setResponse(data);
    } catch (error) {
      console.error('Erro no upload', error);
    }
    setUploading(false);
  };

  return (
    <Box maxW="md" mx="auto" bg="white" p={6} borderRadius="lg" shadow="md">
      <VStack spacing={4}>
        <Text fontSize="xl" fontWeight="semibold">
          Enviar vídeo
        </Text>
        <Input type="file" accept="video/*" onChange={handleFileChange} />
        <Button
          colorScheme="blue"
          isDisabled={!video || uploading}
          onClick={handleUpload}
        >
          {uploading ? <Spinner size="sm" /> : 'Enviar'}
        </Button>

        {response && (
          <Box pt={4} w="full">
            <Text color="green.600">Upload completo!</Text>
            <Code whiteSpace="pre" display="block" mt={2}>
              {JSON.stringify(response, null, 2)}
            </Code>
          </Box>
        )}
      </VStack>
    </Box>
  );
}
