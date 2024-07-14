"use client";

import React, { useEffect, useState } from 'react';
import { Image, Box, Button, Heading, Input, Text, Flex, ButtonGroup, InputGroup, InputLeftElement, InputRightElement } from '@chakra-ui/react';
import dynamic from 'next/dynamic';
import { DAS } from 'helius-sdk';
import { getAssets } from '@/utils/assets';
import { CheckCircleIcon, CheckIcon } from '@chakra-ui/icons';
import PortfolioBox from '@/components/PortfolioBox';

const Home: React.FC = () => {
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [submittedAddress, setSubmittedAddress] = useState<string>('');
  const [fetchTrigger, setFetchTrigger] = useState<boolean>(false);
  const [view, setView] = useState<string>('NFTs');
  const [assets, setAssets] = useState<DAS.GetAssetResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    try{
      setLoading(true);
      setError(null);
      setSubmittedAddress(walletAddress);
      const assets = await getAssets(walletAddress);
      setAssets(assets)
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p={5} textAlign="center" maxWidth="600px" margin="auto" display="flex" flexDirection="column" alignItems="center">
      <Box width="100%">
        <Heading as="h1" fontWeight="bold" fontSize="5xl" color="#9EDF56" mb={-1}>
          Dive Into The Details
        </Heading>
        <Heading as="h1" fontWeight="bold" fontSize="5xl" color="#9EDF56" mb={2}>
          With Ease
        </Heading>
      </Box>
      <Text fontSize="sm" mb={4} width="70%">
        We Offer An Intuitive And User-Friendly Interface For Seamless Data Access And Interaction
      </Text>
      <InputGroup size="lg" mb={4} maxWidth="400px" width="60%">
        <Input
          placeholder="Enter Your Wallet Address Here"
          value={walletAddress}
          onChange={(e) => setWalletAddress(e.target.value)}
          borderRadius="full"
          backgroundColor="gray.50"
          padding="10px"
          boxShadow="inset 0 1px 3px rgba(0, 0, 0, 0.12)"
          fontSize="11px"
        />
        <InputRightElement pointerEvents="none">
          {submittedAddress ? (
            <CheckIcon 
              borderRadius="md" 
              backgroundColor="#B2F168"
              color="black" 
            />
            ) : (
            <CheckIcon color="gray.300" />
            )}
        </InputRightElement>
      </InputGroup>
      <Button
        onClick={handleSearch}
        size="lg"
        borderRadius="full"
        padding="10px"
        boxShadow="0 1px 3px rgba(0, 0, 0, 0.12)"
        maxWidth="400px"
        width="60%"
        backgroundColor="#B2F168"
        _hover={{ backgroundColor: "green.500" }}
        mb={4}
      >
        Display My Assets
      </Button>
      <Flex alignItems="center">
        <Text fontSize="sm" width="100%" alignSelf="flex-start" verticalAlign="top">
          View Your Assets Below
        </Text>
        <Box>
          <Image src="/down.svg" alt="Down Icon" width="62" height="81" />
        </Box>
      </Flex>
      {assets && (
      <PortfolioBox
        walletAddress={walletAddress}
        assets={assets}
      />
      )}
    </Box>
  );
}

export default Home;
