// swapCalc.js
import BN from 'bn.js'
import { adjustForSlippage, d, initCetusSDK, Percentage, TransactionUtil } from '@cetusprotocol/cetus-sui-clmm-sdk'

async function main() {
  const sdk = initCetusSDK({ network: 'mainnet' })

  const a2b = true
  const pool = await sdk.Pool.getPool('0x4255fce5235636d21b6a7adc947db0b8fcbf2f9d0316fed99fbd773526554da1')
  const byAmountIn = true
  const amount = new BN(1000000)

  const swapTicks = await sdk.Pool.fetchTicks({
    pool_id: pool.poolAddress,
    coinTypeA: pool.coinTypeA,
    coinTypeB: pool.coinTypeB
  })

  console.log("swapTicks length: ", swapTicks.length)

  console.log("Entered amount :",amount);
  const res = sdk.Swap.calculateRates({
    decimalsA: 6,
    decimalsB: 6,
    a2b,
    byAmountIn,
    amount,
    swapTicks,
    currentPool: pool
  })

  console.log('calculateRates###res###', {
    estimatedAmountIn: res.estimatedAmountIn.toString(),
    estimatedAmountOut: res.estimatedAmountOut.toString(),
    estimatedEndSqrtPrice: res.estimatedEndSqrtPrice.toString(),
    estimatedFeeAmount: res.estimatedFeeAmount.toString(),
    isExceed: res.isExceed,
    extraComputeLimit: res.extraComputeLimit,
    amount: res.amount.toString(),
    aToB: res.aToB,
    byAmountIn: res.byAmountIn,
  })
}

main().catch(console.error)
