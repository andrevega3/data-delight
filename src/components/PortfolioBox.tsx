import { Box, Flex, Heading, Text, IconButton, VStack, Image, Button, useDisclosure } from '@chakra-ui/react';
import { CopyIcon } from '@chakra-ui/icons';
import { useClipboard } from '@chakra-ui/hooks';
import React, { useEffect, useMemo, useState } from 'react';
import { DAS } from 'helius-sdk';
import { capitalizeFirstLetter, truncateAddress } from '@/utils/utils';
import CollectionModal from './CollectionModal';
import { getBestOffers, getCollectionStats } from '@/utils/magiceden';
import { getSolanaPrice } from '@/utils/helius';

interface PortfolioBoxProps {
  walletAddress: string;
  assets: DAS.GetAssetResponse[];
}

interface CollectionData {
    name: string;
    value: number;
    image: string;
    assets: DAS.GetAssetResponse[];
    stats?: any;
    floorPrice?: number;
  }

const PortfolioBox: React.FC<PortfolioBoxProps> = ({ walletAddress, assets }) => {
  const { hasCopied, onCopy } = useClipboard(walletAddress);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedCollection, setSelectedCollection] = useState<DAS.GetAssetResponse[]>([]);
  const [selectedNft, setSelectedNft] = useState<DAS.GetAssetResponse | null>(null);
  const [groupedNfts, setGroupedNfts] = useState<CollectionData[]>([]);
  const [totalValue, setTotalValue] = useState<string | null>(null);


  const tokens = useMemo(() => {
    return assets.map(asset => {
        if (
            !asset.content?.metadata ||
            !asset.content?.links ||
            asset.interface != "FungibleToken" ||
            !asset.token_info?.decimals ||
            !asset.token_info.balance ||
            !asset.token_info.price_info?.price_per_token
        ) {
            return;
        }
        const decimal_divider = 10 ** asset.token_info?.decimals;
        const init_balance = asset.token_info.balance;
        const parsed_balance = init_balance / decimal_divider;
        const price_per_token = asset.token_info.price_info?.price_per_token;
        const total_usd_price = parsed_balance * price_per_token;
        return {
            symbol: asset.content.metadata.symbol,
            name: asset.content.metadata.name,
            image: asset.content.links.image,
            amount: Math.round(parsed_balance * 100) / 100,
            usd_equiv: Math.round(total_usd_price * 100) / 100,
        }
    }).filter(asset => asset !== undefined)
    .sort((a, b) => b.usd_equiv - a.usd_equiv);;

  }, [assets]);

  const collectionData = useMemo(() => {
    const data: { [key: string]: { name: string, count: number, image: string, symbol: string, assets: DAS.GetAssetResponse[] } } = {};
    assets.forEach(asset => {
      if (
        !asset.creators?.length ||
        !asset.creators[0].verified ||
        !asset.grouping ||
        !asset.content?.metadata?.attributes?.length ||
        asset.content.metadata.attributes[0].trait_type === "Website" ||
        !asset.content.links?.image
      ) {
        return;
      }

      const collection = asset.grouping.find(group => group.group_key === 'collection')?.group_value;
      const image = asset.content.links.image;

      if (collection) {
        if (!data[collection]) {
          data[collection] = { name: asset.content.metadata.name, count: 0, image, symbol: asset.content?.metadata.symbol, assets: [asset] };
        }
        data[collection].count += 1;
        data[collection].assets.push(asset);
      }
    });

    return Object.entries(data).map(([collection, { count, image, symbol, assets }]) => ({
      name: capitalizeFirstLetter(symbol),
      value: count,
      image,
      assets,
    }));
  }, [assets]);

  useEffect(() => {
    setGroupedNfts(collectionData);

    const fetchStats = async () => {
      const updatedCollectionData = await Promise.all(
        collectionData.map(async (collection) => {
          if (!collection.assets.length ||
            !collection.assets[0].grouping?.length){
                 return null;
            }
          const result = (await getBestOffers(collection.assets[0].id)).result;
          const symbol = result.results[0]?.collectionSymbol;
          if (symbol === undefined) return {...collection};
          const stats = await getCollectionStats(symbol)
          const decimal_divider = 10 ** 9;
          const init_price = stats.result.floorPrice;
          const parsed_price = init_price / decimal_divider;
          return { ...collection, stats: stats.result, floorPrice: parsed_price };
        })
      );
      const validCollections = updatedCollectionData.filter((collection): collection is CollectionData => collection !== null) as CollectionData[];
      setGroupedNfts(validCollections);
    };

    fetchStats();
  }, [collectionData]);

  useEffect(() => {
    const fetchTotalValue = async () => {
      const totalNFTValue = groupedNfts.reduce((total, nft) => total + (nft.floorPrice || 0), 0);
      const solana_price = await getSolanaPrice();
      if (!solana_price.token_info?.price_info?.price_per_token) return;
      const totalNFTUSDValue = totalNFTValue * solana_price.token_info?.price_info?.price_per_token;
      const totalTokenValue = tokens.reduce((total, token) => total + token.usd_equiv, 0);
      setTotalValue((totalNFTUSDValue + totalTokenValue).toFixed(2));
    };
  
    fetchTotalValue();
  }, [tokens, groupedNfts]);

  const handleViewCollection = (nfts: DAS.GetAssetResponse[]) => {
    setSelectedCollection(nfts);
    onOpen();
  };

  const handleNftSelect = (nft: DAS.GetAssetResponse) => {
    setSelectedNft(nft);
  };

  return (
    <>
    <Box
      bg="#1E222D"
      color="white"
      borderRadius="lg"
      p={4}
      width="100%"
      maxWidth="800px"
      height={["300px", "400px", "500px", "600px"]} // Responsive height
      overflow="hidden"
      m="auto"
      borderColor="#1E222D"
      borderBottomWidth="10px"
    >
    <Flex justifyContent="flex-end" alignItems="center" mb={4}>
        <Text fontSize="8px" color="gray.400" textAlign="right">
        <IconButton
            onClick={onCopy}
            sx={{
                width: "1px",     // Custom width
                height: "1px",    // Custom height
                fontSize: "8px",  // Custom font size for the icon
                bg: "transparent", // Set background to transparent
                color: "gray.400"     // Set icon color to black for silhouette effect
              }}
            icon={<CopyIcon />}
            aria-label="Copy Wallet Address"
            mr="-14px"
            mb="3px"
          />
          {truncateAddress(walletAddress, 20)}
        </Text>
      </Flex>
      <Flex flexDirection="column" alignItems="center" justifyContent="center" mb={4}>
        <Heading color="#B2F168" fontSize="2xl" fontWeight="bold">
          ${totalValue}
        </Heading>
        <Text size="lg" color="gray">
          Total Portfolio Value
        </Text>
      </Flex>
      <Flex height="100%">
      <Box width="40%" overflowY="auto" pr={2} mt={1}>
        <VStack spacing={2} align="start">
            {tokens.map((token, index) => (
            <Box 
                key={index}
                bg="gray.800"
                p={2}
                borderRadius="md"
                width="100%"
                height="40px"
                display="flex"
                alignItems="center"
                backgroundColor="white"
                overflow="hidden"
            >
                <Box
                width="auto"
                height="100%"
                aspectRatio={1}
                overflow="hidden"
                borderRadius="md"
                >
                    <Image 
                        src={token.image} 
                        alt={token.name} 
                        width="100%" 
                        height="100%" 
                        objectFit="cover"
                    />
                </Box>
                <Box 
                    flex="1"
                    height="100%"
                    display="flex"
                    flexDirection="column"
                    justifyContent="center"
                    ml="5px"
                >
                    <Text display="flex" alignItems="center" fontSize="11px" color="black" fontWeight="bold">
                        {token.symbol}
                    </Text>
                    <Text display="flex" alignItems="center" color="black" fontSize="7px">
                        {token.name}
                    </Text>
                </Box>
                <Box
                    flex="1"
                    display="flex"
                    flexDirection="column"
                    justifyContent="center"
                    alignItems="flex-end"
                    height="100%"
                    >
                    <Text 
                        display="flex" 
                        justifyContent="flex-end" 
                        alignItems="center" 
                        fontSize="8px" 
                        color="black" 
                        ml={2}
                        whiteSpace="nowrap" 
                        overflow="hidden" 
                        textOverflow="ellipsis"
                    >
                        {token.amount} {token.symbol}
                    </Text>
                    <Text 
                        display="flex" 
                        justifyContent="flex-end" 
                        alignItems="center" 
                        fontSize="6px" 
                        color="black" 
                        ml={2}
                        whiteSpace="nowrap" 
                        overflow="hidden" 
                        textOverflow="ellipsis"
                    >
                        ${token.usd_equiv}
                    </Text>
                    </Box>



            </Box>
            ))}
        </VStack>
        </Box>

        <Box width="60%" pl={2} overflowY="auto" height="100%">
          <Flex wrap="wrap" height="100%">
          {groupedNfts.map((nft, index) => (
            nft.floorPrice ? (
            <Box
                key={index}
                aspectRatio={0.9}
                maxHeight="36%"
                bg="white"
                borderRadius="xl"
                marginLeft={2}
                marginBottom={1.5}
                marginTop={1.5}
                marginRight={2}
                width="43%"
                display="flex"
                flexDirection="column"
                position="relative"
                overflow="hidden"
                sx={{
                ':hover .nft-image-container': {
                    height: '60%',
                },
                }}
            >
                <Box
                width="100%"
                height="100%"
                borderRadius="xl"
                className="nft-image-container"
                position="absolute"
                top="0"
                left="0"
                transition="height 0.3s ease-in-out"
                zIndex="100"
                >
                <Image src={nft.image} alt={nft.name} width="100%" height="100%" objectFit="cover" />
                </Box>
                <Text
                    m={2}
                    fontSize="10px"
                    color="black"
                    textAlign="left"
                    zIndex="1"
                    position="absolute"
                    bottom="15%"
                    width="100%"
                >
                    FloorPrice: {nft.floorPrice}SOL
                </Text>
                <Button
                    onClick={() => handleViewCollection(nft.assets)}
                    fontSize="x-small"
                    borderRadius="lg"
                    padding="10px"
                    boxShadow="0 1px 3px rgba(0, 0, 0, 0.12)"
                    maxWidth="400px"
                    width="90%" // Updated width to 90%
                    backgroundColor="rgba(50, 205, 50, 0.6)" // Lime green background color
                    _hover={{ backgroundColor: "green.500" }}
                    alignSelf="center" // Center the button horizontally
                    height="22px"
                    mt="auto" // Push the button to the bottom
                    mb={1}
                >
                View Collection
                </Button>
            </Box>
            ) : (
                <Box
                key={index}
                aspectRatio={0.9}
                maxHeight="36%"
                bg="white"
                borderRadius="xl"
                marginLeft={2}
                marginBottom={1.5}
                marginTop={1.5}
                marginRight={2}
                width="43%"
                display="flex"
                flexDirection="column"
                position="relative"
                overflow="hidden"
                sx={{
                ':hover .nft-image-container': {
                    height: '77%',
                },
                }}
            >
                <Box
                width="100%"
                height="100%"
                borderRadius="xl"
                className="nft-image-container"
                position="absolute"
                top="0"
                left="0"
                transition="height 0.3s ease-in-out"
                zIndex="100"
                >
                <Image src={nft.image} alt={nft.name} width="100%" height="100%" objectFit="cover" />
                </Box>
                <Text
                    m={2}
                    fontWeight="semibold"
                    fontSize="12px"
                    color="black"
                    textAlign="left"
                    zIndex="1"
                    position="absolute"
                    bottom="25%"
                    width="100%"
                >
                    {nft.name}
                </Text>
                <Button
                    onClick={() => handleViewCollection(nft.assets)}
                    fontSize="x-small"
                    borderRadius="lg"
                    padding="10px"
                    boxShadow="0 1px 3px rgba(0, 0, 0, 0.12)"
                    maxWidth="400px"
                    width="90%" // Updated width to 90%
                    backgroundColor="rgba(50, 205, 50, 0.6)" // Lime green background color
                    _hover={{ backgroundColor: "green.500" }}
                    alignSelf="center" // Center the button horizontally
                    height="22px"
                    mt="auto" // Push the button to the bottom
                    mb={1}
                >
                View Collection
                </Button>
            </Box>
            )
            ))}

          </Flex>
        </Box>
      </Flex>
    </Box>
    <CollectionModal
      isOpen={isOpen}
      onClose={onClose}
      nfts={selectedCollection}
      onNftSelect={handleNftSelect}
    />
    </>
  );
};

export default PortfolioBox;
