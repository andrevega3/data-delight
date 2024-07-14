"use client";

import React, { useEffect, useState } from 'react';
import { Box, Button, Heading, Input, Flex, ButtonGroup } from '@chakra-ui/react';
import dynamic from 'next/dynamic';

const MintedTokensList = dynamic(() => import('@/components/MintedTokensList'), { ssr: false });
const FungibleTokensList = dynamic(() => import('@/components/FungibleTokensList'), { ssr: false });

const Home: React.FC = () => {
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [submittedAddress, setSubmittedAddress] = useState<string>('');
  const [fetchTrigger, setFetchTrigger] = useState<boolean>(false);
  const [view, setView] = useState<string>('NFTs'); // State to manage current view

  const handleSearch = () => {
    setSubmittedAddress(walletAddress);
    setFetchTrigger((prev) => !prev);
  };

  return (
    <Box p={5}>
      <Heading>MintViewer</Heading>
      <Input
        placeholder="Enter wallet address"
        value={walletAddress}
        onChange={(e) => setWalletAddress(e.target.value)}
      />
      <Button onClick={handleSearch} mt={2}>
        Fetch Data
      </Button>

      <ButtonGroup mt={4} mb={4}>
        <Button onClick={() => setView('NFTs')} isActive={view === 'NFTs'}>
          NFTs
        </Button>
        <Button onClick={() => setView('SPL')} isActive={view === 'SPL'}>
          SPL
        </Button>
      </ButtonGroup>

      {submittedAddress && view === 'NFTs' && (
        <MintedTokensList
          walletAddress={submittedAddress}
          onlyVerified={true}
          page={1}
          fetchTrigger={fetchTrigger}
        />
      )}

      {submittedAddress && view === 'SPL' && (
        <FungibleTokensList
          walletAddress={submittedAddress}
          onlyVerified={false}
          page={1}
          fetchTrigger={fetchTrigger}
        />
      )}
    </Box>
  );
}

export default Home;
