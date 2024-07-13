import React, { useEffect, useMemo, useState } from 'react';
import { Box, Spinner, Text, Image, Table, Tbody, Td, Th, Thead, Tr, Button, List, ListItem } from '@chakra-ui/react';
import {
  useReactTable,
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
} from '@tanstack/react-table';
import { getAssetsByOwner } from '@/utils/helius';
import { Collections, DAS } from 'helius-sdk';
import { ResponsiveCirclePacking, CircleComponent } from '@nivo/circle-packing';
import { useTooltip } from '@nivo/tooltip';
import {CustomBulletList} from '@/components/CustomBulletList';

interface CirclePackingNodeData {
  name: string;
  value?: number; // Root node doesn't need a value
  image?: string; // Root node doesn't need an image
  children?: CirclePackingNodeData[];
}

interface Attribute {
  value: string;
  trait_type: string;
}

interface File {
  uri: string;
  cdn_uri?: string;
  mime: string;
}

interface Metadata {
  attributes: Attribute[];
  description: string;
  name: string;
  symbol: string;
  token_standard: string;
}

interface Links {
  image: string;
  animation_url?: string;
  external_url: string;
}

interface Content {
  $schema: string;
  json_uri: string;
  files: File[];
  metadata: Metadata;
  links: Links;
}

interface Authority {
  address: string;
  scopes: string[];
}

interface Compression {
  eligible: boolean;
  compressed: boolean;
  data_hash: string;
  creator_hash: string;
  asset_hash: string;
  tree: string;
  seq: number;
  leaf_id: number;
}

interface Grouping {
  group_key: string;
  group_value: string;
}

interface Royalty {
  royalty_model: string;
  target: string | null;
  percent: number;
  basis_points: number;
  primary_sale_happened: boolean;
  locked: boolean;
}

interface Creator {
  address: string;
  share: number;
  verified: boolean;
}

interface Ownership {
  frozen: boolean;
  delegated: boolean;
  delegate: string | null;
  ownership_model: string;
  owner: string;
}

interface Supply {
  print_max_supply: number;
  print_current_supply: number;
  edition_nonce: number | null;
}

interface Asset {
  id: string;
  content: Content;
  authorities: Authority[];
  compression: Compression;
  grouping: Grouping[];
  royalty: Royalty;
  creators: Creator[];
  ownership: Ownership;
  supply: Supply;
  mutable: boolean;
  burnt: boolean;
}

interface MintTokensListProps {
  walletAddress: string;
  onlyVerified: boolean;
  page: number;
  fetchTrigger: number; // to trigger refetch on click
}

const MintTokensList: React.FC<MintTokensListProps> = ({ walletAddress, onlyVerified, page, fetchTrigger }) => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedGrouping, setSelectedGrouping] = useState<string | null>(null);
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>(assets);

  useEffect(() => {
    const fetchAssets = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await getAssetsByOwner(walletAddress, 1);
        if (response.items == undefined) {
          throw new Error('Failed to fetch minted tokens');
        }
        
        const data = response.items.map((item: DAS.GetAssetResponse) => {
          if (!item.content) {
            throw new Error(`Asset content is undefined for item ${item.id}`);
          }

          // Check if creators is defined and has at least one element, then check if the first creator is verified
          if (!item.creators?.length || !item.creators[0].verified) {
            return;
          }

          if (!item.content.metadata.attributes?.length || item.content.metadata.attributes[0].trait_type == "Website"){
            return;
          }

          return {
            id: item.id,
            content: item.content,
            authorities: item.authorities || [],
            compression: item.compression || {
              eligible: false,
              compressed: false,
              data_hash: '',
              creator_hash: '',
              asset_hash: '',
              tree: '',
              seq: 0,
              leaf_id: 0
            },
            grouping: item.grouping || [],
            royalty: item.royalty || {
              royalty_model: '',
              target: null,
              percent: 0,
              basis_points: 0,
              primary_sale_happened: false,
              locked: false
            },
            creators: item.creators || [],
            ownership: item.ownership || {
              frozen: false,
              delegated: false,
              delegate: null,
              ownership_model: '',
              owner: ''
            },
            supply: item.supply || {
              print_max_supply: 0,
              print_current_supply: 0,
              edition_nonce: null
            },
            mutable: item.mutable || false,
            burnt: item.burnt || false
          } as Asset;
        }).filter(item => item !== undefined) as Asset[];

        setAssets(data);
      } catch (err) {
        setError(String(err));
      } finally {
        setLoading(false);
      }
    };

    fetchAssets();
  }, [walletAddress, onlyVerified, page, fetchTrigger]); // include fetchTrigger as a dependency

  const circlePackingData = useMemo(() => {
    const collectionData: { [key: string]: { count: number, image: string } } = {};

    assets.forEach(asset => {
      const collection = asset.grouping.find(group => group.group_key === 'collection')?.group_value;
      const image = asset.content.links.image;
      if (collection) {
        if (!collectionData[collection]) {
          collectionData[collection] = { count: 0, image };
        }
        collectionData[collection].count += 1;
      }
    });

    return {
      name: "collections",
      children: Object.entries(collectionData).map(([collection, { count, image }]) => ({
        name: collection,
        value: count,
        image,
      }))
    };
  }, [assets]);

  useEffect(() => {
    if (selectedGrouping) {
      const groupingAssets = assets.filter(asset => {
        const collection = asset.grouping.find(group => group.group_key === 'collection')?.group_value;
        return collection === selectedGrouping;
      });
      setFilteredAssets(groupingAssets);
    } 
  }, [selectedGrouping, assets]);

  if (loading) {
    return <Spinner />;
  }

  if (error) {
    return <Text color="red.500">{error}</Text>;
  }

  const CustomCircle: CircleComponent<CirclePackingNodeData> = ({ node, style }) => {
    const { showTooltipFromEvent, hideTooltip } = useTooltip();
  
    if (!node.depth) {
      // Render an empty <g> element for the root node
      return <g />;
    }

    const handleClick = () => {
      setSelectedGrouping(node.data.name);
    };
  
    return (
      <g
        transform={`translate(${node.x},${node.y})`}
        onClick={handleClick}
      >
        <circle r={node.radius} />
        {node.data.image && (
          <image
            href={node.data.image}
            x={-node.radius}
            y={-node.radius}
            height={2 * node.radius}
            width={2 * node.radius}
            clipPath={`circle(${node.radius}px)`}
          />
        )}
      </g>
    );
  };

  const renderAssetDetails = (asset: Asset) => {
    const assetDetails = {
      Name: asset.content.metadata.name,
      Description: asset.content.metadata.description,
      Artist: asset.content.metadata.attributes.find(attr => attr.trait_type === 'Artist')?.value,
      Season: asset.content.metadata.attributes.find(attr => attr.trait_type === 'Season')?.value,
      Drop: asset.content.metadata.attributes.find(attr => attr.trait_type === 'Drop')?.value,
      Variation: asset.content.metadata.attributes.find(attr => attr.trait_type === 'Variation')?.value,
      // Rarity: asset.content.metadata.attributes.find(attr => attr.trait_type === 'Rarity')?.value,
      // Ownership: asset.ownership,
      // Supply: asset.supply.print_max_supply,
      // Compression: asset.compression,
      Collection: asset.grouping.find(attr => attr.group_key === 'collection')?.group_value,
      RoyaltyPercent: `${asset.royalty.percent * 100}%`,
      // Authorities: asset.authorities,
      Creators: asset.creators,
      // Mutable: asset.mutable,
      // Burnt: asset.burnt
    };

    return (
      <List spacing={3}>
        {Object.entries(assetDetails)
          .filter(([, value]) => value !== undefined && value !== null)
          .map(([key, value]) => (
            <CustomBulletList key={key} header={key} value={value} />
          ))}
      </List>
    );
  };

    return (
      <Box p={5}>
        {loading && <Spinner />}
        {error && <Text color="red.500">{error}</Text>}
        {!loading && !error && (
          <>
            <Box mt={5} height={500}>
              <ResponsiveCirclePacking
                data={circlePackingData}
                margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                padding={6}
                id="name"
                value="value"
                colors={{ scheme: 'nivo' }}
                childColor={{ from: 'color', modifiers: [['brighter', 0.4]] }}
                labelTextColor={{ from: 'color', modifiers: [['darker', 2]] }}
                borderWidth={1}
                borderColor={{ from: 'color', modifiers: [['darker', 0.5]] }}
                circleComponent={CustomCircle}
                animate={true}
              />
            </Box>
            {filteredAssets.length > 0 && (
              <Box mt={5}>
                {renderAssetDetails(filteredAssets[0])}
              </Box>
            )}
          </>
        )}
      </Box>
    );
  };
  

export default MintTokensList;

