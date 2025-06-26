'use client';

import {
  Box,
  Button,
  Container,
  Heading,
  Input,
  Text,
  VStack,
  useToast,
  Spinner,
  Flex,
} from '@chakra-ui/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignOutButton,
  useUser,
} from '@clerk/nextjs';

export default function HomePage() {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const toast = useToast();
  const router = useRouter();
  const { user } = useUser();

  async function handleSubmit() {
    if (!youtubeUrl && !file) {
      toast({
        title: 'Insira um link ou selecione um arquivo.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);

    const formData = new FormData();
    if (youtubeUrl) formData.append('youtubeUrl', youtubeUrl);
    if (file) formData.append('file', file);

    try {
      const res = await fetch('/api/process', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        toast({
          title: 'Vídeo enviado com sucesso!',
          description: 'Você será redirecionado para os cortes em instantes.',
          status: 'success',
          duration: 2000,
          isClosable: true,
        });

        setTimeout(() => {
          router.push('/cuts');
        }, 2000);
      } else {
        throw new Error(data.error || 'Erro no processamento.');
      }
    } catch (err) {
      toast({
        title: 'Erro ao enviar',
        description: err.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container maxW="lg" py={10}>
      <Flex justify="space-between" mb={4}>
        <SignedOut>
          <SignInButton>
            <Button colorScheme="blue" variant="outline">
              Entrar
            </Button>
          </SignInButton>
        </SignedOut>

        <SignedIn>
          <Flex align="center" gap={3}>
            <Text color="gray.200">Olá, {user?.firstName || user?.username}!</Text>
            <SignOutButton>
              <Button colorScheme="red" variant="ghost" size="sm">
                Sair
              </Button>
            </SignOutButton>
          </Flex>
        </SignedIn>
      </Flex>

      <VStack spacing={6} align="stretch">
        <Heading size="lg" textAlign="center">
          Enviar novo vídeo
        </Heading>

        <Box>
          <Text mb={2}>Link do YouTube</Text>
          <Input
            placeholder="https://www.youtube.com/watch?v=..."
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            isDisabled={loading}
          />
        </Box>

        <Box>
          <Text mb={2}>Ou envie um vídeo local (.mp4)</Text>
          <Input
            type="file"
            accept="video/mp4"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            isDisabled={loading}
          />
        </Box>

        <Button
          onClick={handleSubmit}
          colorScheme="blue"
          isLoading={loading}
          loadingText="Enviando..."
        >
          Enviar para processamento
        </Button>

        {loading && (
          <Box w="100%" bg="gray.200" borderRadius="md" overflow="hidden">
            <Box
              height="8px"
              width={`${progress}%`}
              bg="blue.500"
              transition="width 0.3s"
            />
          </Box>
        )}
      </VStack>
    </Container>
  );
}
