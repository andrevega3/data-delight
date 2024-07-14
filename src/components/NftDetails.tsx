import React, { useState } from 'react';
import { Box, Image, Table, Tbody, Tr, Td, Button, Collapse, useDisclosure } from '@chakra-ui/react';
import { DAS } from 'helius-sdk';

interface NftDetailsProps {
  nft: DAS.GetAssetResponse;
}

const NftDetails: React.FC<NftDetailsProps> = ({ nft }) => {
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({});

  const toggleSection = (key: string) => {
    setExpandedSections(prevState => ({ ...prevState, [key]: !prevState[key] }));
  };

  const renderNestedDetails = (key: string, value: any) => {
    if (Array.isArray(value)) {
      return (
        <>
          <Button size="sm" colorScheme="green" onClick={() => toggleSection(key)}>
            {expandedSections[key] ? `Hide ${key}` : `Show ${key}`}
          </Button>
          <Collapse in={expandedSections[key]} animateOpacity>
            <Table variant="simple" colorScheme="whiteAlpha" mt={2} size="sm">
              <Tbody>
                {value.map((item, index) => (
                  <Tr key={index} borderBottom="1px solid gray">
                    <Td fontSize="sm">{typeof item === 'object' ? renderNestedDetails(`${key} ${index + 1}`, item) : item?.toString()}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Collapse>
        </>
      );
    }

    if (typeof value === 'object' && value !== null) {
      return (
        <>
          <Button size="sm" colorScheme="green" onClick={() => toggleSection(key)}>
            {expandedSections[key] ? `Hide ${key}` : `Show ${key}`}
          </Button>
          <Collapse in={expandedSections[key]} animateOpacity>
            <Table variant="simple" colorScheme="whiteAlpha" mt={2} size="sm">
              <Tbody>
                {Object.entries(value).map(([nestedKey, nestedValue]) => (
                  <Tr key={nestedKey} borderBottom="1px solid gray">
                    <Td fontWeight="bold" fontSize="sm">{nestedKey}</Td>
                    <Td fontSize="sm">{typeof nestedValue === 'object' ? renderNestedDetails(nestedKey, nestedValue) : nestedValue?.toString()}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Collapse>
        </>
      );
    }
    return value?.toString();
  };

  return (
    <Box mt="-125px" height="100%" display="flex" flexDirection="column" alignItems="center" justifyContent="center">
      <Box maxHeight="80%" flex="1" display="flex" justifyContent="center" alignItems="center" width="100%">
        <Image src={nft.content?.links?.image} alt={nft.content?.metadata.name} maxHeight="45%" objectFit="cover" />
      </Box>
      <Box mt="-135px" flex="1" overflowY="auto" p={4} color="white" width="90%">
        <Table variant="simple" colorScheme="whiteAlpha">
          <Tbody>
            {Object.entries(nft).map(([key, value]) => (
              <Tr key={key}>
                <Td fontWeight="bold" fontSize="xs">{key}</Td>
                <Td fontSize="xs">{renderNestedDetails(key, value)}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
};

export default NftDetails;
