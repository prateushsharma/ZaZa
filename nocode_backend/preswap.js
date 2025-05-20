// swapCalc.js
import BN from 'bn.js'
import { adjustForSlippage, d, initCetusSDK, Percentage, TransactionUtil } from '@cetusprotocol/cetus-sui-clmm-sdk'

async function main() {
  const sdk = initCetusSDK({ network: 'testnet' })

  const a2b = false
  const pool = await sdk.Pool.getPool('0xabe1b85be598622df89862058f8a9e34ff17e8ebba7648d722c2b44497962158')
  const byAmountIn = false
  const amount = new BN(80000000000000)

  const swapTicks = await sdk.Pool.fetchTicks({
    pool_id: pool.poolAddress,
    coinTypeA: pool.coinTypeA,
    coinTypeB: pool.coinTypeB
  })

  console.log("swapTicks length: ", swapTicks.length)

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
