'use client';

import { ClerkProvider } from '@clerk/nextjs';
import { ChakraProvider } from '@chakra-ui/react';

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <ChakraProvider>
            {children}
          </ChakraProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
