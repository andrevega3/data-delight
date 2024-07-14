"use server"

import { getRequest, postRequest } from "@/handlers/ApiHandler";

export async function getCollectionStats(symbol: string){

    const url = `http://api-mainnet.magiceden.dev/v2/collections/${symbol.toLowerCase().replace(" ", "_")}/stats`;

    return await getRequest<any>(url);
}

export async function getBestOffers(mint_adress: string){

    const url = `https://api-mainnet.magiceden.dev/v2/mmm/token/${mint_adress}/pools`;

    return await getRequest<any>(url);
}
