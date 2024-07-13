"use server";

import { postRequest } from "@/handlers/ApiHandler";
import { Helius } from "helius-sdk";

const apiKey = process.env.HELIUS_API_KEY;

if (!apiKey) {
  throw new Error('Missing Helius API key');
}

const helius = new Helius(apiKey);

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
        });

        return response
    } catch (error) {
        console.error('Error getting assets by creator:', error);
        throw new Error('Error getting assets by creator');
    }
}

export async function getPriorityFeeEstimate() {
    if (!process.env.NEXT_PUBLIC_RPC_ENDPOINT) {
        throw new Error("Missing RPC URL");
    }

    const HeliusURL = process.env.NEXT_PUBLIC_RPC_ENDPOINT;
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

    return response.data;
}