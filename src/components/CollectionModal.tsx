import React, { useState } from 'react';
import { Box, Flex, Image, Text, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, Button, useDisclosure } from '@chakra-ui/react';
import { DAS } from 'helius-sdk';
import NftDetails from './NftDetails';

interface CollectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    nfts: DAS.GetAssetResponse[];
    onNftSelect: (nft: DAS.GetAssetResponse) => void;
  }
  
  const CollectionModal: React.FC<CollectionModalProps> = ({ isOpen, onClose, nfts, onNftSelect }) => {
      const [selectedNft, setSelectedNft] = useState<DAS.GetAssetResponse | null>(null);
      const { isOpen: isDetailsOpen, onOpen: onDetailsOpen, onClose: onDetailsClose } = useDisclosure();
    
      const handleNftClick = (nft: DAS.GetAssetResponse) => {
        setSelectedNft(nft);
        onDetailsOpen();
      };
    
      const handleDetailsClose = () => {
        setSelectedNft(null);
        onDetailsClose();
        onClose();
      };

  return (
    <Modal isOpen={isOpen} onClose={handleDetailsClose} size="xl">
      <ModalOverlay />
      <ModalContent 
        width={["500px", "600px", "700px", "800px"]}
        height={["600px", "700px", "800px", "900px"]}
        bg="#1E222D"
      >
        <ModalHeader color="#B2F168">
          {selectedNft ? (
            <Button onClick={handleDetailsClose} colorScheme="green" size="sm">Back to Collection</Button>
          ) : (
            'NFTs'
          )}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody padding={0} display="flex" flexDirection="column" height="100%">
          {selectedNft ? (
            <NftDetails nft={selectedNft} />
          ) : (
            <Box overflowY="auto" height="80%" padding={4}>
              <Flex wrap="wrap">
                {nfts.map((nft, index) => (
                  <Box
                    key={index}
                    bg="white"
                    borderRadius="xl"
                    margin={2}
                    width="30%"
                    aspectRatio={1}
                    display="flex"
                    flexDirection="column"
                    position="relative"
                    overflow="hidden"
                    sx={{
                      ':hover .nft-image-container': {
                        height: '50%',
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
                      <Image src={nft.content?.links?.image} alt={nft.content?.metadata.name} width="100%" height="100%" objectFit="cover" />
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
                      {nft.content?.metadata.name}
                    </Text>
                    <Button
                      onClick={() => handleNftClick(nft)}
                      fontSize="x-small"
                      borderRadius="lg"
                      padding="10px"
                      boxShadow="0 1px 3px rgba(0, 0, 0, 0.12)"
                      backgroundColor="rgba(50, 205, 50, 0.6)" // Lime green background color
                      _hover={{ backgroundColor: "green.500" }}
                      alignSelf="center" // Center the button horizontally
                      height="22px"
                      mt="auto" // Push the button to the bottom
                      mb={1}
                    >
                      View Details
                    </Button>
                  </Box>
                ))}
              </Flex>
            </Box>
          )}
        </ModalBody>
        <ModalFooter mt="-125px">
          <Button colorScheme="green" mr={3} onClick={handleDetailsClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CollectionModal;
