// For CommonJS (default Node.js setup)
const fetch = global.fetch;


// If you're using ES modules (with `"type": "module"` in package.json), use:
// import fetch from 'node-fetch';

const GRAPHQL_ENDPOINT = 'https://sui-testnet.mystenlabs.com/graphql';

const address = process.argv[2];
if (!address) {
  console.error('❌ Please provide an address.');
  process.exit(1);
}

async function fetchTransactions(address) {
  const query = `
    query {
      transactionBlocks(
      last:10
        filter: {
          sentAddress: "${address}"
        }
      ) {
        nodes {
          sender {
            address
          }
          gasInput {
            gasPrice
            gasBudget
          }
        }
      }
    }
  `;

  try {
    const res = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    });

    const json = await res.json();
    if (json.errors) {
      console.error('GraphQL errors:', json.errors);
      return;
    }

    console.log(JSON.stringify(json.data.transactionBlocks.nodes, null, 2));
  } catch (err) {
    console.error('Error fetching transactions:', err);
  }
}

fetchTransactions(address);
