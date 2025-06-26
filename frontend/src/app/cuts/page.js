'use client';

import {
  Box,
  Text,
  Heading,
  Badge,
  Stack,
  Container,
  Button,
  useToast,
  IconButton,
} from '@chakra-ui/react';
import { CopyIcon } from '@chakra-ui/icons';
import { useEffect, useState } from 'react';

export default function CutsPage() {
  const [cuts, setCuts] = useState([]);
  const toast = useToast();

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cuts`)
      .then((res) => res.json())
      .then((data) => setCuts(data.cuts || []))
      .catch((err) => console.error('Erro ao carregar cortes:', err));
  }, []);

  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60)
      .toString()
      .padStart(2, '0');
    const sec = Math.floor(seconds % 60)
      .toString()
      .padStart(2, '0');
    return `${min}:${sec}`;
  };

  const handleCopy = (url) => {
    navigator.clipboard.writeText(url);
    toast({
      title: 'Link copiado!',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  return (
    <Container maxW="6xl" py={10}>
      <Heading mb={6} textAlign="center" color="white">
        🎬 Cortes de Podcast
      </Heading>

      <Stack spacing={8}>
        {cuts.length === 0 && (
          <Text color="gray.400" textAlign="center">
            Nenhum corte encontrado.
          </Text>
        )}

        {cuts.map((cut, index) => (
          <Box
            key={index}
            bg="gray.800"
            p={5}
            rounded="xl"
            boxShadow="lg"
            border="1px solid"
            borderColor="gray.700"
          >
            <video
              src={cut.url}
              controls
              style={{ borderRadius: '8px', width: '100%' }}
            />

            <Stack mt={4} spacing={2}>
              <Heading size="md" color="white">
                {cut.title}
              </Heading>

              <Text color="gray.300" fontSize="sm" whiteSpace="pre-wrap">
                {cut.description}
              </Text>

              <Text color="gray.500" fontSize="xs">
                ⏱️ {formatTime(cut.start)} → {formatTime(cut.end)}
              </Text>

              <Stack direction="row" align="center" justify="space-between">
                <Badge colorScheme="green" px={3} py={1} borderRadius="full">
                  Concluído
                </Badge>

                <IconButton
                  icon={<CopyIcon />}
                  size="sm"
                  variant="outline"
                  colorScheme="blue"
                  onClick={() => handleCopy(cut.url)}
                  aria-label="Copiar link"
                />
              </Stack>
            </Stack>
          </Box>
        ))}
      </Stack>
    </Container>
  );
}
