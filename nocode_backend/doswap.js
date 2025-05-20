import BN from 'bn.js';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import {
  adjustForSlippage,
  d,
  initCetusSDK,
  Percentage,
  TransactionUtil
} from '@cetusprotocol/cetus-sui-clmm-sdk';
import { Transaction } from '@mysten/sui/transactions';

const TESTNET_CETUS_CONFIG = {
  packageId: '0x5b45da03d42b064f5e051741b6fed4b6d9c6e030b0d9a5ea0f322e7b34806d8d',
  globalConfigId: '0xdaa462f76b377cae55f110ea3a9e6cce0d4b61c7580dcf3a7e0f4150f003e735',
  publishedAt: '0x5b45da03d42b064f5e051741b6fed4b6d9c6e030b0d9a5ea0f322e7b34806d8d'
};


async function main() {
  // Full secret key Uint8Array (64 bytes)
  const fullSecretKey = new Uint8Array([
    120, 190, 57, 207, 136, 107, 141, 52, 54, 118, 77, 3, 77, 66, 248, 126,
    131, 224, 252, 88, 94, 109, 110, 75, 177, 215, 199, 231, 165, 56, 13, 189,
    192, 198, 123, 98, 108, 47, 156, 107, 120, 90, 107, 2, 34, 36, 240, 227,
    204, 137, 239, 247, 94, 99, 65, 17, 83, 71, 135, 108, 170, 158, 66, 249
  ]);

  // Only take the first 32 bytes as secret key
  const secretKey = fullSecretKey.slice(0, 32);
  console.log('Secret Key Uint8Array:', secretKey);

  // Create signer keypair from secretKey Uint8Array
  const signer = Ed25519Keypair.fromSecretKey(secretKey);
  console.log('Signer Address:', signer.getPublicKey().toSuiAddress());
  

  const sdk = initCetusSDK({ network: 'testnet',cetusConfig: TESTNET_CETUS_CONFIG });
sdk.senderAddress = signer.getPublicKey().toSuiAddress();
  const a2b = false;
  const byAmountIn = true;
  const amount = new BN(80000);
  const slippage = new Percentage(new BN("32"), new BN("1000000000"));

  const poolAddress = '0xabe1b85be598622df89862058f8a9e34ff17e8ebba7648d722c2b44497962158';
  const pool = await sdk.Pool.getPool(poolAddress);

  console.log("Params passing to preswap:", {
    pool,
    current_sqrt_price: pool.current_sqrt_price,
    coinTypeA: pool.coinTypeA,
    coinTypeB: pool.coinTypeB,
    decimalsA: 6,
    decimalsB: 8,
    a2b,
    by_amount_in: true,
    amount
  });

  const res = await sdk.Swap.preswap({
    pool,
    current_sqrt_price: pool.current_sqrt_price,
    coinTypeA: pool.coinTypeA,
    coinTypeB: pool.coinTypeB,
    decimalsA: 6,
    decimalsB: 8,
    a2b,
    byAmountIn,
    amount
  });

  const partner = '';
  // Convert to BN here before passing to adjustForSlippage
  const toAmountRaw = byAmountIn ? res.estimatedAmountOut : res.estimatedAmountIn;
  const toAmountBN = new BN(toAmountRaw.toString());

  console.log("Params before adjust for slippage");
  console.log("ToAmount:", toAmountBN.toString());
  console.log("Slippage:", slippage);
  console.log("By Amount In:", !byAmountIn);

  const amountLimit = adjustForSlippage(toAmountBN, slippage, !byAmountIn);

  console.log("Amount Limit after adjusting for slippage:", amountLimit.toString());

  const swapPayload = sdk.Swap.createSwapTransactionPayload({
    pool_id: pool.poolAddress,
    coinTypeA: pool.coinTypeA,
    coinTypeB: pool.coinTypeB,
    a2b,
    by_amount_in: byAmountIn,
    amount: res.amount.toString(),
    amount_limit: amountLimit.toString(),
    swap_partner: partner
  });

 const txb = new Transaction();
  const senderAddress = signer.getPublicKey().toSuiAddress();

  // Add move call with proper arguments
 // Fixed moveCall with proper BCS types
 txb.moveCall({
    target: `${TESTNET_CETUS_CONFIG.packageId}::clob_v2::swap`,
    arguments: [
      txb.object(pool.poolAddress),
      txb.object(TESTNET_CETUS_CONFIG.globalConfigId),
      txb.pure.u8(a2b ? 0 : 1),
      txb.pure.bool(byAmountIn),
      txb.pure.u64(res.amount.toString()),
      txb.pure.u64(amountLimit.toString())
    ],
    typeArguments: [pool.coinTypeA, pool.coinTypeB]
  });
  // Set sender and gas payment
  txb.setSender(senderAddress);

    // PROPER GAS PAYMENT HANDLING
  const gasCoins = await sdk.fullClient.getCoins({
    owner: senderAddress,
    coinType: "0x2::sui::SUI"
  });

  if (!gasCoins.data || gasCoins.data.length === 0) {
    throw new Error('No SUI coins available for gas payment');
  }

  // Convert coins to transaction inputs
  const gasPayment = gasCoins.data
    .slice(0, 1) // Use first coin
    .map(coin => txb.object(coin.coinObjectId));

  txb.setGasPayment(gasPayment);

  // Execute transaction
  const swapTxn = await sdk.fullClient.signAndExecuteTransaction({
    signer,
    transaction: txb,
    options: {
      showEffects: true,
      showEvents: true
    }
  });

  console.log('✅ Swap transaction sent:', swapTxn);
}

main().catch(console.error);
