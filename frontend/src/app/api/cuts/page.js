'use client';

import {
  Box,
  Text,
  Heading,
  Badge,
  Stack,
  Container,
  Select,
  Button,
  useToast,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';

export default function CutsPage() {
  const [cuts, setCuts] = useState([]);
  const [filter, setFilter] = useState('todos');
  const toast = useToast();

  const loadCuts = () => {
    fetch('/api/list-cuts')
      .then((res) => res.json())
      .then((data) => setCuts(data))
      .catch((err) => console.error('Erro ao carregar cortes:', err));
  };

  useEffect(() => {
    loadCuts();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'done':
        return 'green';
      case 'processing':
        return 'yellow';
      case 'error':
        return 'red';
      default:
        return 'gray';
    }
  };

  const handleDelete = async (filename) => {
    const confirm = window.confirm(`Excluir corte ${filename}?`);
    if (!confirm) return;

    const res = await fetch(`/api/delete-cut?filename=${encodeURIComponent(filename)}`, {
      method: 'DELETE',
    });

    if (res.ok) {
      toast({
        title: 'Corte excluído com sucesso.',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
      loadCuts();
    } else {
      toast({
        title: 'Erro ao excluir corte.',
        status: 'error',
        duration: 2000,
        isClosable: true,
      });
    }
  };

  const filteredCuts =
    filter === 'todos' ? cuts : cuts.filter((cut) => cut.status === filter);

  return (
    <Container maxW="6xl" py={10}>
      <Heading mb={4} textAlign="center" color="white">
        Seus Cortes de Vídeo
      </Heading>

      <Select
        maxW="300px"
        mb={8}
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        bg="gray.700"
        color="white"
        borderColor="gray.600"
      >
        <option value="todos">Todos</option>
        <option value="processing">Processando</option>
        <option value="done">Concluído</option>
        <option value="error">Erro</option>
      </Select>

      <Stack spacing={8}>
        {filteredCuts.length === 0 && (
          <Text color="gray.400" textAlign="center">
            Nenhum corte encontrado.
          </Text>
        )}

        {filteredCuts.map((cut, index) => (
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
                {cut.title || cut.filename}
              </Heading>

              <Text color="gray.300" fontSize="sm" whiteSpace="pre-wrap">
                {cut.description || 'Sem descrição disponível.'}
              </Text>

              <Stack direction="row" align="center">
                <Badge
                  colorScheme={getStatusColor(cut.status)}
                  px={3}
                  py={1}
                  borderRadius="full"
                >
                  {cut.status || 'desconhecido'}
                </Badge>

                <Button
                  size="sm"
                  colorScheme="red"
                  variant="outline"
                  onClick={() => handleDelete(cut.filename)}
                >
                  Excluir
                </Button>
              </Stack>
            </Stack>
          </Box>
        ))}
      </Stack>
    </Container>
  );
}
