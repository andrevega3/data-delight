import React, { useState } from 'react';
import { Box, List, ListItem, Button, Text, Flex } from '@chakra-ui/react';
import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';

interface CustomBulletListProps {
  header: string;
  value: any;
  level?: number;
}

const CustomBulletList: React.FC<CustomBulletListProps> = ({ header, value, level = 0 }) => {
  const [expanded, setExpanded] = useState<boolean>(false);

  const toggleExpand = () => {
    setExpanded(prev => !prev);
  };

  if (Array.isArray(value)) {
    return (
      <ListItem pl={level * 4}>
        <Flex alignItems="center">
        <Text fontWeight={level === 0 ? "bold" : "normal"}>{`- ${header}:`}</Text>
          <Button size="xs" onClick={toggleExpand} ml={2}>
            {expanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
          </Button>
        </Flex>
        {expanded && (
          <List pl={level * 4} mt={2}>
            {value.map((item, index) => (
              <ListItem key={index} pl={level * 4}>
                {typeof item === 'object' ? (
                  <CustomBulletList header={`${item["address"]}`} value={item} level={level + 1} />
                ) : (
                  <Flex>
                    <Text>{`${index + 1}: `}</Text>
                    <Text>{`${String(item)}`}</Text>
                  </Flex>
                )}
              </ListItem>
            ))}
          </List>
        )}
      </ListItem>
    );
  }

  if (typeof value === 'object' && value !== null) {
    return (
      <ListItem pl={level * 4}>
        <Flex alignItems="center">
        <Text fontWeight={level === 0 ? "bold" : "normal"}>{`- ${header}:`}</Text>
          <Button size="xs" onClick={toggleExpand} ml={2}>
            {expanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
          </Button>
        </Flex>
        {expanded && (
          <List pl={level * 4} mt={2}>
            {Object.entries(value).map(([key, nestedValue]) => (
              <CustomBulletList key={key} header={key} value={nestedValue} level={level + 1} />
            ))}
          </List>
        )}
      </ListItem>
    );
  }

  return (
    <ListItem pl={level * 4}>
      <Flex>
        <Text fontWeight={level === 0 ? "bold" : "normal"}>{`- ${header}:`}</Text>
        <Text>{`\u00A0${String(value)}`}</Text>
      </Flex>
    </ListItem>
  );
};

export default CustomBulletList;