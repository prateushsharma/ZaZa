
import fs from "fs";
import { initCetusSDK } from '@cetusprotocol/cetus-sui-clmm-sdk'; // Ensure installed: npm install cetus-clmm-sdk

const TestnetSDK = initCetusSDK({ network: 'mainnet' });

async function getAllPool() {
    try {
        const pools = await TestnetSDK.Pool.getPoolsWithPage([]);

        // Convert the full object to string
        const poolText = JSON.stringify(pools, null, 2); // Pretty-print JSON

        // Write it to a file
        fs.writeFileSync('all_mainnet_pools.txt', poolText);

        console.log(`✅ Saved ${pools.length} pools to all_pools.txt`);
    } catch (error) {
        console.error('❌ Error fetching pools:', error);
    }
}

getAllPool();
