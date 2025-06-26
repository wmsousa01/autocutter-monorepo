'use client'

import { ChakraProvider } from '@chakra-ui/react'

export function ChakraProviders({ children }) {
  return <ChakraProvider>{children}</ChakraProvider>
}
