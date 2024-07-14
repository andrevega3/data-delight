"use server";

import { postRequest } from "@/handlers/ApiHandler";
import { Helius } from "helius-sdk";

const apiKey = process.env.HELIUS_API_KEY;

if (!apiKey) {
  throw new Error('Missing Helius API key');
}

const helius = new Helius(apiKey);

export async function getSolanaPrice(
) {
    try {
        const response = await helius.rpc.getAsset({
            id: "So11111111111111111111111111111111111111112"
        });

        return response
    } catch (error) {
        console.error('Error getting assets by creator:', error);
        throw new Error('Error getting assets by creator');
    }
}

export async function getAssetsByCreator(
    creatorAddress: string, 
    onlyVerified: boolean,
    page: number
) {
    try {
        const response = await helius.rpc.getAssetsByCreator({
            creatorAddress: `${creatorAddress}`,
            onlyVerified: onlyVerified,
            page: page,
        });

        return response
    } catch (error) {
        console.error('Error getting assets by creator:', error);
        throw new Error('Error getting assets by creator');
    }
}

export async function getAssetsByOwner(
    ownerAddress: string,
    page: number
) {
    try {
        const response = await helius.rpc.getAssetsByOwner({
            ownerAddress: `${ownerAddress}`,
            page: page,
            displayOptions: {
                showCollectionMetadata: true,
            }
        });

        return response
    } catch (error) {
        console.error('Error getting assets by owner:', error);
        throw new Error('Error getting assets by owner');
    }
}

export async function getFungibleAssets(
    ownerAddress: string,
    page: number,
    tokenType: string,
) {
    try {
        const response = await helius.rpc.searchAssets({
            ownerAddress: ownerAddress,
            page: page,
            tokenType: 'All'
        });

        return response
    } catch (error) {
        console.error('Error getting assets by creator:', error);
        throw new Error('Error getting assets by creator');
    }
}

export async function getTokenAccounts(
    page: number,
    limit: number,
    options: {
      showZeroBalance: boolean,
    },
    owner: string,
) {
    try {
        const response = await helius.rpc.getTokenAccounts({
            page: page,
            limit: limit,
            options: {
              showZeroBalance: options.showZeroBalance,
            },
            owner: owner
        });

        return response
    } catch (error) {
        console.error('Error getting assets by creator:', error);
        throw new Error('Error getting assets by creator');
    }
}

export async function getPriorityFeeEstimate() {
    if (!process.env.RPC_ENDPOINT) {
        throw new Error("Missing RPC URL");
    }

    const HeliusURL = process.env.RPC_ENDPOINT;
    const body = {
        jsonrpc: "2.0",
        id: "1",
        method: "getPriorityFeeEstimate",
        params: [
            {
                "options": {
                    "includeAllPriorityFeeLevels": true,
                }
            }
        ]
    };
    const response = await postRequest(HeliusURL, body)

    return response.result;
}

export async function postRequestAssetsByOwner(address: string) {
    if (!process.env.RPC_ENDPOINT) {
        throw new Error("Missing RPC URL");
    }

    const HeliusURL = process.env.RPC_ENDPOINT;
    const body = {
        jsonrpc: '2.0',
        id: 'my-id',
        method: 'getAssetsByOwner',
        params: {
          ownerAddress: address,
          page: 1, // Starts at 1
          limit: 1000,
          displayOptions: {
                showFungible: true //return both fungible and non-fungible tokens
            }
        }
    }
    const response = await postRequest(HeliusURL, body)

    return response.result;
}