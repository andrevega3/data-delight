"use client";

import React, { useEffect, useState } from 'react';
import { Box, Button, Heading, Input, Spinner, Text } from '@chakra-ui/react';
import { getPriorityFeeEstimate } from '@/utils/helius';
import dynamic from 'next/dynamic';
import { ftruncate } from 'fs';

const MintedTokensList = dynamic(() => import('@/components/MintedTokensList'), { ssr: false });

const Home: React.FC = () => {
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [submittedAddress, setSubmittedAddress] = useState<string>('');
  const [fetchTrigger, setFetchTrigger] = useState<number>(0);

  const handleSearch = () => {
    setSubmittedAddress(walletAddress);
    setFetchTrigger((prev) => prev + 1);
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
        Fetch Minted Tokens
      </Button>
      {submittedAddress && 
      <MintedTokensList 
      walletAddress={submittedAddress}
      onlyVerified={true}
      page={1}
      fetchTrigger={fetchTrigger} 
      />}
    </Box>
  );
}

export default Home;
