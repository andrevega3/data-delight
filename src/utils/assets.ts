import { DAS } from "helius-sdk";
import { postRequestAssetsByOwner } from "./helius";

export async function getAssets(walletAddress: string){
        try {
            const response = await postRequestAssetsByOwner(walletAddress) as DAS.GetAssetResponseList;
    
    
            if (response.items == undefined) {
              throw new Error('Failed to fetch assets');
            }
            
            const data = response.items.map((item: DAS.GetAssetResponse) => {   
              return item
            }).filter(item => item !== undefined);
    
            return data;
          } catch (err) {
            throw new Error(String(err));
          }
    }