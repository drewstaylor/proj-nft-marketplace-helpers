import { coin } from "@cosmjs/stargate";
import { Client } from '../util/client';
import { FromAtto } from "../util/denom";

const MARKETPLACE_CONTRACT = process.env.VUE_APP_MARKETPLACE_CONTRACT;

const SALE = "Sale";
const OFFER = "Offer";

// Queries

/**
 * Query marketplace config, which returns basic information and parameters about the marketplace
 * @returns {QueryResult} : Returns the Config of the marketplace
 * 
 * Example Return: 
 * {
 *    "admin": "archway1f395p0gg67mmfd5zcqvpnp9cxnu0hg6r9hfczq",  // An admin who can make changes to the contract
 *                                                                // such as changing the fee percentage, or adding 
 *                                                                // and removing NFT contracts to/from the curated list
 *                                                                // of contracts allowed to swap in this marketplace
 *    "denom": "aarch",
 *    "cw721": ["contract1_address", "contract2_address"],  // An array of contract addresses. Any NFT
 *                                                          // belonging to a contract not in this list cannot
 *                                                          // be listed for sale (e.g. curated marketplace)
 * 
 *    fees: 0.1,  // The marketplace fee percentage (e.g. 0.1 == 10%)
 *                // when this value is greater than 0, the marketplace
 *                // keeps a percentage of all swap payments 
 *                // (true for both native ARCH and cw20 payments)
 *                
 * }
 */
async function Config(client = null) {
  if (!client) client = await Client();
  try {
    let entrypoint = {
      config: {}
    };

    let query = await client.wasmClient.queryClient.wasm.queryContractSmart(
      MARKETPLACE_CONTRACT,
      entrypoint
    );
    return query;
  } catch(e) {
    console.error(e);
    return {};
  }
}


/**
 * List swaps (paginated)
 * @param {String} start? : (Optional) Start paginated request after this swap id. Default null
 * @param {Number} limit? : (Optional) Amount of swaps per paginated request. Default limit 10, maximum limit 30
 * @param {SigningCosmWasmClient} client? :  (Optional) instance of signing client
 * @returns {QueryResult} : Returns a paginated list of swap ids, default paging is 10 items per page
 * 
 * Example Return:
 * {
 *   "swaps": ["swap1","swap2","swap3","swap4","swap5","swap6","swap7","swap8","swap9","swap10"]
 * }
 */
async function List(start, limit, client = null) {
  if (!client) client = await Client();
  try {
    let entrypoint = {
      list: {}
    };
    if (start) entrypoint.list.start_after = start;
    if (limit) entrypoint.list.limit = limit;

    let query = await client.wasmClient.queryClient.wasm.queryContractSmart(
      MARKETPLACE_CONTRACT,
      entrypoint
    );
    return query;
  } catch(e) {
    console.error(e);
    return {};
  }
}

/**
 * Get details of a specific swap
 * @param {String} id : Swap id to get details for
 * @param {SigningCosmWasmClient} client? :  (Optional) instance of signing client
 * @returns {QueryResult} : Returns an object containing details of the swap that was fetched
 * 
 * Example Return:
 * {
 *    "creator": "archway1kjtmkagp4fz7tx9nsu5a2xfnz6m50nudp2u6g9",
 *    "contract": "archway1cf5rq0amcl5m2flqrtl4gw2mdl3zdec9vlp5hfa9hgxlwnmrlazsdycu4l", // Contract address of the cw721 
 *                                                                                      // that is being swapped
 *    "payment_token": null,    // If payment_token is null, payment is in native arch
 *                              // If payment_token is a contract address, payment is a cw20 
 *                              // denom (e.g. of the cw20 at the given contract address)
 * 
 *    "token_id": "1",          // ID of the token being swapped
 *    "expires": {
 *        "at_time": "1724388997000000000"  // This time is in seconds, convert it to a JS date like 
 *                                          // this: `new Date(1724388997000000000/1000000)`
 *    },
 *    "price": "1000000000000000000000",    // Price is in aarch precision
 *    "swap_type": "Sale"
 * }
 */
async function Details(id = null, client = null) {
  if (!client) client = await Client();
  try {
    let entrypoint = {
      details: {
        id: id
      }
    };

    let query = await client.wasmClient.queryClient.wasm.queryContractSmart(
      MARKETPLACE_CONTRACT,
      entrypoint
    );
    return query;
  } catch(e) {
    // console.error(e);
    return { error: e };
  }
}

/**
 * Get all swaps created by a specific wallet address (user)
 * @param {String} address : Swap creator to get listings for
 * @param {String} type : Swap type; must be either "Sale" or "Offer"
 * @param {Number} page : Results page to be returned; starts at 0. Requesting a non-existent page returns an error.
 * @param {Number} limit : Maximum quantity of results to return. An integer greater than 0 and less than 100.
 * @param {SigningCosmWasmClient} client? :  (Optional) instance of signing client
 * @returns {QueryResult} : Returns an object with an attribute called "swaps", that is an array of swaps
 * 
 * Example Response: 
 *    {
 *        "swaps": [
 *            {
 *                "creator": "archway1f395p0gg67mmfd5zcqvpnp9cxnu0hg6r9hfczq",
 *                "nft_contract": "archway1cf5rq0amcl5m2flqrtl4gw2mdl3zdec9vlp5hfa9hgxlwnmrlazsdycu4l",   // Contract address of the cw721 
 *                                                                                                        // that is being swapped
 *                "payment_token": null,      // No payment token means payment is in Native ARCH
 *                "token_id": "1",            // ID of the token being swapped
 *                "expires": {
 *                    "at_time": "1785271356000000000"    // This time is in seconds, convert it to a JS date like 
 *                                                        // this: `new Date(1724388997000000000/1000000)`
 *                },
 *                "price": "1000000000000000000000",      // Price is in aarch precision
 *                "swap_type": "Sale"
 *            },
 *            {
 *                "creator": "archway1f395p0gg67mmfd5zcqvpnp9cxnu0hg6r9hfczq",
 *                "nft_contract": "archway1cf5rq0amcl5m2flqrtl4gw2mdl3zdec9vlp5hfa9hgxlwnmrlazsdycu4l",
 *                "payment_token": null,
 *                "token_id": "2",
 *                "expires": {
 *                    "at_time": "1723050464000000000"
 *                },
 *                "price": "100000000000000000000",
 *                "swap_type": "Sale"
 *            }
 *        ],
 *        "page": 0,      // Note that pagination pages are 0 indexed
 *        "total": "2"    // Note that pagination returns the total value of swaps 
 *                        // (e.g. for requesting other pages & determining the last page)
 *    }
 */
async function SwapsOf(address = null, type = SALE, page = 0, limit = 10, client = null) {
  if (!client) client = await Client();
  try {
    let entrypoint = {
      swaps_of: {
        address: address,
        swap_type: type,
        page: page,
        limit: limit
      }
    };

    let query = await client.wasmClient.queryClient.wasm.queryContractSmart(
      MARKETPLACE_CONTRACT,
      entrypoint
    );
    return query;
  } catch(e) {
    console.error(e);
    return { error: e };
  }
}

/**
 * Count the total number of swaps, or the total number of swaps for a `SwapType` ('Sale' / 'Offer')
 * @param {String} type : Optional filter for `SwapType`. Can be Either SALE ('Sale') or OFFER ('Offer')
 * @param {SigningCosmWasmClient} client? :  (Optional) instance of signing client
 * @returns {QueryResult | Number} : Returns a number (unsigned integer)
 * 
 * Example Return: `258`
 */
async function GetTotal(swap_type = SALE, client = null) {
  if (!client) client = await Client();
  try {
    let entrypoint = {
      get_total: {
        swap_type
      }
    };

    let query = await client.wasmClient.queryClient.wasm.queryContractSmart(
      MARKETPLACE_CONTRACT,
      entrypoint
    );
    return query;
  } catch(e) {
    console.error(e);
    return { error: e };
  }
}

/**
 * Fetch all swaps of type `SwapType::Offer`
 * @param {Number} page : Results page to be returned; starts at 0. Requesting a non-existent page returns an error.
 * @param {Number} limit : Maximum quantity of results to return. An integer greater than 0 and less than 100.
 * @param {SigningCosmWasmClient} client? :  (Optional) instance of signing client
 * @returns {QueryResult} : Returns an object with an attribute called "swaps", that is an array of swaps
 * 
 * // Note that Offers cannot be made in native arch, but a cw20 token like wrapped ARCH 
 * // (wARCH) should instead be used
 * 
 * Example Response: 
 *    {
 *        "swaps": [
 *            {
 *                "creator": "archway1f395p0gg67mmfd5zcqvpnp9cxnu0hg6r9hfczq",
 *                "nft_contract": "archway1cf5rq0amcl5m2flqrtl4gw2mdl3zdec9vlp5hfa9hgxlwnmrlazsdycu4l",   // Contract address of the cw721 
 *                                                                                                        // that is being swapped
 * 
 *                "payment_token": "archway1jcahx3ruep9zwrhefwkdnuxrhk44w9zedeef0eg9pg3wjj66zyps9z2jrv",  // cw20 contract used for payment when settling the swap
 *
 *                // ID of the token being swapped
 *                "token_id": "1",
 * 
 *                "expires": {
 *                    "at_time": "1785271356000000000"    // This time is in seconds, convert it to a JS date like 
 *                                                        // this: `new Date(1724388997000000000/1000000)`
 *                },
 *                "price": "1000000000000000000000",      // Price is in denom precision of the cw20
 *                "swap_type": "Offer"
 *            },
 *            {
 *                "creator": "archway1f395p0gg67mmfd5zcqvpnp9cxnu0hg6r9hfczq",
 *                "nft_contract": "archway1cf5rq0amcl5m2flqrtl4gw2mdl3zdec9vlp5hfa9hgxlwnmrlazsdycu4l",
 *                "payment_token": "archway1jcahx3ruep9zwrhefwkdnuxrhk44w9zedeef0eg9pg3wjj66zyps9z2jrv",
 *                "token_id": "2",
 *                "expires": {
 *                    "at_time": "1723050464000000000"
 *                },
 *                "price": "100000000000000000000",
 *                "swap_type": "Offer"
 *            }
 *        ],
 *        "page": 0,      // Note that pagination pages are 0 indexed
 *        "total": "2"    // Note that pagination returns the total value of swaps 
 *                        // (e.g. for requesting other pages & determining the last page)
 *    }
 */
async function GetOffers(page = 0, limit = 10, client = null) {
  if (!client) client = await Client();
  try {
    let entrypoint = {
      get_offers: {
        page: page,
        limit: limit
      }
    };

    let query = await client.wasmClient.queryClient.wasm.queryContractSmart(
      MARKETPLACE_CONTRACT,
      entrypoint
    );
    return query;
  } catch(e) {
    console.error(e);
    return { error: e };
  }
}

/**
 * Fetch all swaps of type `SwapType::Sale`
 * @param {Number} page : Results page to be returned; starts at 0. Requesting a non-existent page returns an error.
 * @param {Number} limit : Maximum quantity of results to return. An integer greater than 0 and less than 100.
 * @param {SigningCosmWasmClient} client? :  (Optional) instance of signing client
 * @returns {QueryResult} : Returns an object with an attribute called "swaps", that is an array of swaps
 * 
 * Example Response: 
 *    {
 *        "swaps": [
 *            {
 *                "creator": "archway1f395p0gg67mmfd5zcqvpnp9cxnu0hg6r9hfczq",
 *                "nft_contract": "archway1cf5rq0amcl5m2flqrtl4gw2mdl3zdec9vlp5hfa9hgxlwnmrlazsdycu4l",   // Contract address of the cw721 
 *                                                                                                        // that is being swapped
 *                "payment_token": null,      // No payment token means payment is in Native ARCH
 *                "token_id": "1",            // ID of the token being swapped
 *                "expires": {
 *                    "at_time": "1785271356000000000"    // This time is in seconds, convert it to a JS date like 
 *                                                        // this: `new Date(1724388997000000000/1000000)`
 *                },
 *                "price": "1000000000000000000000",      // Price is in aarch precision
 *                "swap_type": "Sale"
 *            },
 *            {
 *                "creator": "archway1f395p0gg67mmfd5zcqvpnp9cxnu0hg6r9hfczq",
 *                "nft_contract": "archway1cf5rq0amcl5m2flqrtl4gw2mdl3zdec9vlp5hfa9hgxlwnmrlazsdycu4l",
 *                "payment_token": null,
 *                "token_id": "2",
 *                "expires": {
 *                    "at_time": "1723050464000000000"
 *                },
 *                "price": "100000000000000000000",
 *                "swap_type": "Sale"
 *            }
 *        ],
 *        "page": 0,      // Note that pagination pages are 0 indexed
 *        "total": "2"    // Note that pagination returns the total value of swaps 
 *                        // (e.g. for requesting other pages & determining the last page)
 *    }
 */
async function GetListings(page = 0, limit = 10, client = null) {
  if (!client) client = await Client();
  try {
    let entrypoint = {
      get_listings: {
        page: page,
        limit: limit
      }
    };

    let query = await client.wasmClient.queryClient.wasm.queryContractSmart(
      MARKETPLACE_CONTRACT,
      entrypoint
    );
    return query;
  } catch(e) {
    console.error(e);
    return { error: e };
  }
}

/**
 * Fetch all swaps for a specific token ID. Can be filtered by swap type.
 * @param {String} token_id 
 * @param {String} cw721 : Collection contract used for finding the `token_id`
 * @param {String} type? : Optional filter to limit results by swap type; must be either "Sale" or "Offer" (or `null` to show all results)
 * @param {Number} page : Results page to be returned; starts at 0. Requesting a non-existent page returns an error.
 * @param {Number} limit : Maximum quantity of results to return. An integer greater than 0 and less than 100.
 * @param {SigningCosmWasmClient} client? :  (Optional) instance of signing client
 * @returns {QueryResult} : Returns an object with an attribute called "swaps", that is an array of swaps
 * 
 * Example Response: 
 *    {
 *        "swaps": [
 *            {
 *                "creator": "archway1f395p0gg67mmfd5zcqvpnp9cxnu0hg6r9hfczq",
 *                "nft_contract": "archway1cf5rq0amcl5m2flqrtl4gw2mdl3zdec9vlp5hfa9hgxlwnmrlazsdycu4l",   // Contract address of the cw721 
 *                                                                                                        // that is being swapped
 *                "payment_token": null,      // No payment token means payment is in Native ARCH
 *                "token_id": "1",            // ID of the token being swapped
 *                "expires": {
 *                    "at_time": "1785271356000000000"    // This time is in seconds, convert it to a JS date like 
 *                                                        // this: `new Date(1724388997000000000/1000000)`
 *                },
 *                "price": "1000000000000000000000",      // Price is in aarch precision
 *                "swap_type": "Sale"
 *            },
 *            {
 *                "creator": "archway1f395p0gg67mmfd5zcqvpnp9cxnu0hg6r9hfczq",
 *                "nft_contract": "archway1cf5rq0amcl5m2flqrtl4gw2mdl3zdec9vlp5hfa9hgxlwnmrlazsdycu4l",
 * 
 *                "payment_token": "archway1jcahx3ruep9zwrhefwkdnuxrhk44w9zedeef0eg9pg3wjj66zyps9z2jrv",  // cw20 contract used for payment when settling the swap
 * 
 *                "token_id": "1",
 *                "expires": {
 *                    "at_time": "1723050464000000000"
 *                },
 *                "price": "100000000000000000000",
 *                "swap_type": "Offer"
 *            }
 *        ],
 *        "page": 0,      // Note that pagination pages are 0 indexed
 *        "total": "2"    // Note that pagination returns the total value of swaps (e.g. for requesting other pages & determining the last page)
 *    }
 */
async function ListingsOfToken(token_id = null, cw721 = null, type = null, page = 0, limit = 10, client = null) {
  if (!client) client = await Client();
  try {
    let entrypoint = {
      listings_of_token: {
        token_id,
        cw721,
        page,
        limit
      }
    };
    if (type) entrypoint.listings_of_token.swap_type = type;
    let query = await client.wasmClient.queryClient.wasm.queryContractSmart(
      MARKETPLACE_CONTRACT,
      entrypoint
    );
    return query;
  } catch(e) {
    console.error(e);
    return { error: e };
  }
}

/**
 * Fetch all swaps within a given price range
 * @param {Number} min? : (Optional) Minimum price range, cannot be negative. Defaults to 0.
 * @param {Number} max? : (Optional) Maximum price range. Defaults to showing all swaps greater than `min`
 * @param {String} type : Swap type; must be either "Sale" or "Offer"
 * @param {Number} page : Results page to be returned; starts at 0. Requesting a non-existent page returns an error.
 * @param {Number} limit : Maximum quantity of results to return. An integer greater than 0 and less than 100.
 * @param {SigningCosmWasmClient} client? :  (Optional) instance of signing client
 * @returns {QueryResult} : Returns an object with an attribute called "swaps", that is an array of swaps
 * 
 * Example Return:
 * 
 * // E.g. All swaps priced between 1 ARCH and 2 ARCH
 * 
 * {
    "swaps": [
        {
            "creator": "archway1fkftxkgv9evck6vkye9t8qcfmzjpyazgxuc03a",
            "nft_contract": "archway1cf5rq0amcl5m2flqrtl4gw2mdl3zdec9vlp5hfa9hgxlwnmrlazsdycu4l",   // Contract address of the cw721 
                                                                                                    // that is being swapped
            "payment_token": null, // No payment token means payment is in Native ARCH

            "token_id": "1",
            "expires": {
                "at_time": "1723948517000000000"    // This time is in seconds, convert it to a JS date like 
                                                    // this: `new Date(1724388997000000000/1000000)`
            },
            "price": "2000000000000000000",         // Price is in aarch precision
            "swap_type": "Sale"
        },
        {
            "creator": "archway1argv7r0vy9kdsjgd3qym0t4xvsvwvxded74z7l",
            "nft_contract": "archway1cf5rq0amcl5m2flqrtl4gw2mdl3zdec9vlp5hfa9hgxlwnmrlazsdycu4l",
            "payment_token": null,
            "token_id": "2",
            "expires": {
                "at_time": "1727336200000000000"
            },
            "price": "2000000000000000000",
            "swap_type": "Sale"
        }
    ],
    "page": 0,
    "total": "2"
}
 */
async function SwapsByPrice(min = null, max = null, type = SALE,page = 0, limit = 10, client = null) {
  if (!client) client = await Client();
  try {
    let entrypoint = {
      swaps_by_price: {
        swap_type: type,
        page: page,
        limit: limit
      }
    };
    if (min) entrypoint.swaps_by_price.min = String(min);
    if (max) entrypoint.swaps_by_price.max = String(max);

    let query = await client.wasmClient.queryClient.wasm.queryContractSmart(
      MARKETPLACE_CONTRACT,
      entrypoint
    );
    return query;
  } catch(e) {
    console.error(e);
    return { error: e };
  }
}

/**
 * Fetch all swaps for a given denom. 
 * Must provide `payment_token` (contract address) for cw20 swaps; 
 * Or, exclude `payment_token` to fetch all swaps for native ARCH.
 * @param {String|Addr} payment_token? : (Optional) Cosmos address of the cw20 payment token, or `null` for native ARCH
 * @param {String} type : Swap type; must be either "Sale" or "Offer"
 * @param {Number} page : Results page to be returned; starts at 0. Requesting a non-existent page returns an error.
 * @param {Number} limit : Maximum quantity of results to return. An integer greater than 0 and less than 100.
 * @param {SigningCosmWasmClient} client? :  (Optional) instance of signing client
 * @returns {QueryResult} : Returns an object with an attribute called "swaps", that is an array of swaps
 * 
 * Example Return:
 * 
 *    // E.g. for ARCH swaps...
 * 
 *    {
 *        "swaps": [
 *            {
 *                "creator": "archway1f395p0gg67mmfd5zcqvpnp9cxnu0hg6r9hfczq",
 *                "nft_contract": "archway1cf5rq0amcl5m2flqrtl4gw2mdl3zdec9vlp5hfa9hgxlwnmrlazsdycu4l",   // Contract address of the cw721 
 *                                                                                                        // that is being swapped
 *                "payment_token": null,      // No payment token means payment is in Native ARCH
 *                "token_id": "1",            // ID of the token being swapped
 *                "expires": {
 *                    "at_time": "1785271356000000000"    // This time is in seconds, convert it to a JS date like 
 *                                                        // this: `new Date(1724388997000000000/1000000)`
 *                },
 *                "price": "1000000000000000000000",      // Price is in aarch precision
 *                "swap_type": "Sale"
 *            },
 *            {
 *                "creator": "archway1f395p0gg67mmfd5zcqvpnp9cxnu0hg6r9hfczq",
 *                "nft_contract": "archway1cf5rq0amcl5m2flqrtl4gw2mdl3zdec9vlp5hfa9hgxlwnmrlazsdycu4l",
 *                "payment_token": null,
 *                "token_id": "2",
 *                "expires": {
 *                    "at_time": "1723050464000000000"
 *                },
 *                "price": "100000000000000000000",
 *                "swap_type": "Sale"
 *            }
 *        ],
 *        "page": 0,      // Note that pagination pages are 0 indexed
 *        "total": "2"    // Note that pagination returns the total value of swaps 
 *                        // (e.g. for requesting other pages & determining the last page)
 *    }
 */
async function SwapsByDenom(payment_token = null, type = SALE, page = 0, limit = 10, client = null) {
  if (!client) client = await Client();
  try {
    let entrypoint = {
      swaps_by_denom: {
        swap_type: type,
        page: page,
        limit: limit
      }
    };
    if (payment_token) entrypoint.swaps_by_denom.payment_token = payment_token;

    let query = await client.wasmClient.queryClient.wasm.queryContractSmart(
      MARKETPLACE_CONTRACT,
      entrypoint
    );
    return query;
  } catch(e) {
    console.error(e);
    return { error: e };
  }
}

/**
 * Fetch all swaps by payment type; either cw20 payments or native ARCH payments
 * @param {Boolean} cw20 : `true` to show all swaps for cw20 payments, `false` to show all swaps for native ARCH payments
 * @param {String} type : Swap type; must be either "Sale" or "Offer"
 * @param {Number} page : Results page to be returned; starts at 0. Requesting a non-existent page returns an error.
 * @param {Number} limit : Maximum quantity of results to return. An integer greater than 0 and less than 100.
 * @param {SigningCosmWasmClient} client? :  (Optional) instance of signing client
 * @returns {QueryResult} : Returns an object with an attribute called "swaps", that is an array of swaps
 * 
 * Example Return:
 * 
 *    // E.g. for cw20 == false
 * 
 *    {
 *        "swaps": [
 *            {
 *                "creator": "archway1f395p0gg67mmfd5zcqvpnp9cxnu0hg6r9hfczq",
 *                "nft_contract": "archway1cf5rq0amcl5m2flqrtl4gw2mdl3zdec9vlp5hfa9hgxlwnmrlazsdycu4l",   // Contract address of the cw721 
 *                                                                                                        // that is being swapped
 *                "payment_token": null,      // No payment token means payment is in Native ARCH
 *                "token_id": "1",            // ID of the token being swapped
 *                "expires": {
 *                    "at_time": "1785271356000000000"    // This time is in seconds, convert it to a JS date like 
 *                                                        // this: `new Date(1724388997000000000/1000000)`
 *                },
 *                "price": "1000000000000000000000",      // Price is in aarch precision
 *                "swap_type": "Sale"
 *            },
 *            {
 *                "creator": "archway1f395p0gg67mmfd5zcqvpnp9cxnu0hg6r9hfczq",
 *                "nft_contract": "archway1cf5rq0amcl5m2flqrtl4gw2mdl3zdec9vlp5hfa9hgxlwnmrlazsdycu4l",
 *                "payment_token": null,
 *                "token_id": "2",
 *                "expires": {
 *                    "at_time": "1723050464000000000"
 *                },
 *                "price": "100000000000000000000",
 *                "swap_type": "Sale"
 *            }
 *        ],
 *        "page": 0,      // Note that pagination pages are 0 indexed
 *        "total": "2"    // Note that pagination returns the total value of swaps 
 *                        // (e.g. for requesting other pages & determining the last page)
 *    }
 */
async function SwapsByPaymentType(cw20 = false, type = SALE, page = 0, limit = 10, client = null) {
  if (!client) client = await Client();
  try {
    let entrypoint = {
      swaps_by_payment_type: {
        cw20: cw20,
        swap_type: type,
        page: page,
        limit: limit
      }
    };

    let query = await client.wasmClient.queryClient.wasm.queryContractSmart(
      MARKETPLACE_CONTRACT,
      entrypoint
    );
    return query;
  } catch(e) {
    console.error(e);
    return { error: e };
  }
}

// Txs

/**
 * Create a swap for native ARCH
 * @param {String} id : An ID to be used to refer to this swap
 * @param {String} token_id : token_id (domain) to be sold in the swap
 * @param {Number} expiration : A timestamp (nanosecond precision) after which the swap is invalid
 * @param {Number} price : A price, in a cw20 denom, to be paid by the buyer
 * @param {String} swap_type : Either 'Sale' or 'Offer'
 * @param {SigningCosmWasmClient} client? :  (Optional) instance of signing client
 * @returns {ExecuteResult} : Returns success or error result
 */
async function CreateNative(id, token_id, expiration, price, swap_type = SALE, client = null) {
  if (!client) client = await Client();

  let cost = coin(String(price), client.chainInfo.currencies[0].coinMinimalDenom);

  try {
    // Msg.
    let entrypoint = {
      create: {
        id: id,
        payment_token: null,
        token_id: token_id,
        expires: {
          at_time: String(expiration)
        },
        price: cost.amount,
        swap_type: swap_type,
      }
    };
    // Sender
    let accounts = await client.offlineSigner.getAccounts();
    // Broadcast tx
    let tx = await client.wasmClient.execute(
      accounts[0].address,
      MARKETPLACE_CONTRACT,
      entrypoint,
      client.fees,
      "List " + token_id + " for " + FromAtto(price, true) + " ARCH"
    );
    // Tx result
    return tx;
  } catch (e) {
    console.error(e);
    return {
      error: String(e)
    };
  }
}

/**
 * Finalize and consume swap for native ARCH
 * @param {String} id : ID of swap to finalize
 * @param {Object} swap : (Optional) A swap details object; can be loaded from `Details` entry point
 * @param {SigningCosmWasmClient} client? : (Optional) instance of signing client
 * @returns {ExecuteResult} : Returns success or error result
 * @see Details
 */
async function FinishNative(id, swap, client = null) {
  if (!swap) swap = await Details(id, client);
  if (!client) client = await Client();

  try {
    // Msg.
    let entrypoint = {
      finish: {
        id: id,
        payment_token: null,
        token_id: swap.token_id,
        expires: swap.expires,
        price: swap.price,
        swap_type: swap.swap_type
      }
    };
    // Sender
    let accounts = await client.offlineSigner.getAccounts();
    // Purchase cost
    let funds = (swap.swap_type == SALE) ? [coin(String(swap.price), client.chainInfo.currencies[0].coinMinimalDenom)] : [];
    // Broadcast tx
    let tx = await client.wasmClient.execute(
      accounts[0].address,
      MARKETPLACE_CONTRACT,
      entrypoint,
      client.fees,
      "Swap " + swap.token_id + " for " + FromAtto(swap.price, true) + " ARCH",
      funds
    );
    // Tx result
    return tx;
  } catch (e) {
    console.error(e);
    return {
      error: String(e)
    };
  }
}

/**
 * Create swap for a cw20 token
 * @param {String} id : An ID to be used to refer to this swap
 * @param {String} token_id : token_id (domain) to be sold in the swap
 * @param {Number} expiration : A timestamp (nanosecond precision) after which the swap is invalid
 * @param {Number} price : A price, in `aarch`, to be paid by the buyer
 * @param {String} denom? : (Optional) denom of payment cw20; only used for memo
 * @param {String} swap_type : Either 'Sale' or 'Offer'
 * @param {SigningCosmWasmClient} client? :  (Optional) instance of signing client
 * @returns {ExecuteResult} : Returns success or error result
 */
async function CreateCw20(id, cw20_contract, token_id, expiration, price, denom = '', swap_type = SALE, client = null) {
  if (!client) client = await Client();

  try {
    // Msg.
    let entrypoint = {
      create: {
        id: id,
        payment_token: cw20_contract,
        token_id: token_id,
        expires: {
          at_time: expiration
        },
        price: String(price),
        swap_type: swap_type
      }
    };
    // Sender
    let accounts = await client.offlineSigner.getAccounts();
    // Broadcast tx
    let tx = await client.wasmClient.execute(
      accounts[0].address,
      MARKETPLACE_CONTRACT,
      entrypoint,
      client.fees,
      "List " + token_id + " for " + FromAtto(price, true) + denom
    );
    // Tx result
    return tx;
  } catch (e) {
    console.error(e);
    return {
      error: String(e)
    };
  }
}

/**
 * Finalize and consume swap for cw20 tokens
 * @param {String} id : ID of swap to finalize
 * @param {Object} swap : (Optional) A swap details object; can be loaded from `Details` entry point
 * @param {String} denom? : (Optional) denom of payment cw20; only used for memo
 * @param {SigningCosmWasmClient} client? :  (Optional) instance of signing client
 * @returns {ExecuteResult} : Returns success or error result
 * @see Details
 */
async function FinishCw20(id, swap, denom = '', client = null) {
  if (!swap) swap = await Details(id, client);
  if (!client) client = await Client();

  try {
    // Msg.
    let entrypoint = {
      finish: {
        id: id,
        payment_token: swap.payment_token,
        token_id: swap.token_id,
        expires: swap.expires,
        price: swap.price,
        swap_type: swap.swap_type
      }
    };
    // Sender
    let accounts = await client.offlineSigner.getAccounts();
    // Broadcast tx
    let tx = await client.wasmClient.execute(
      accounts[0].address,
      MARKETPLACE_CONTRACT,
      entrypoint,
      client.fees,
      "Swap " + swap.token_id + " for " + swap.price + denom
    );
    // Tx result
    return tx;
  } catch (e) {
    console.error(e);
    return {
      error: String(e)
    };
  }
}

/**
 * Cancel a swap by ID; caller must be swap creator
 * @param {String} id : ID of swap to be cancelled
 * @param {SigningCosmWasmClient} client? :  (Optional) instance of signing client
 * @returns {ExecuteResult} : Returns success or error result
 * @see Details
 */
async function Cancel(id, client = null) {
  if (!client) client = await Client();

  try {
    // Msg.
    let entrypoint = {
      cancel: {
        id: id
      }
    };
    // Sender
    let accounts = await client.offlineSigner.getAccounts();
    // Broadcast tx
    let tx = await client.wasmClient.execute(
      accounts[0].address,
      MARKETPLACE_CONTRACT,
      entrypoint,
      client.fees,
      "Cancel swap"
    );
    // Tx result
    return tx;
  } catch (e) {
    console.error(e);
    return {
      error: String(e)
    };
  }
}

/**
 * Update the price, expiry, or both price and expiry, of a swap by its ID
 * @param {String} id : ID of the swap to be updated
 * @param {Number} expires : New expiration time in seconds
 * @param {Number} price : New price amount; original denom settings will not be changed (e.g. aarch swaps can't be changed to cw20, and vice versa)
 * @param {SigningCosmWasmClient} client? :  (Optional) instance of signing client
 * @returns {ExecuteResult} : Returns success or error result
 */
async function Update(id, expiration, price, client = null) {
  if (!client) client = await Client();

  let cost = coin(String(price), client.chainInfo.currencies[0].coinMinimalDenom);

  try {
    // Msg.
    let entrypoint = {
      update: {
        id: id,
        expires: {
          at_time: String(expiration)
        },
        price: cost.amount,
      }
    };
    // Sender
    let accounts = await client.offlineSigner.getAccounts();
    // Broadcast tx
    let tx = await client.wasmClient.execute(
      accounts[0].address,
      MARKETPLACE_CONTRACT,
      entrypoint,
      client.fees,
      "Update swap"
    );
    // Tx result
    return tx;
  } catch (e) {
    console.error(e);
    return {
      error: String(e)
    };
  }
}

/**
 * Additional admin only txs not covered in this example file:
 * ExecuteMsg::UpdateConfig
 * Used to update config parameters, e.g. Marketplace fees or Admin address
 * 
 * ExecuteMsg::AddNft
 * Add an NFT collection contract to the curated list of contracts allowed to list NFTs
 * 
 * ExecuteMsg::RemoveNft
 * Remove an NFT collection contract to the curated list of contracts allowed to list NFTs
 * 
 * ExecuteMsg::Withdraw
 * Withdraw funds from the contract (e.g. accrued marketplace fees)
 */

const Query = {
  Config,
  List,
  Details,
  SwapsOf,
  GetTotal,
  GetOffers,
  GetListings,
  ListingsOfToken,
  SwapsByPrice,
  SwapsByDenom,
  SwapsByPaymentType
};

const Execute = {
  CreateNative,
  CreateCw20,
  FinishNative,
  FinishCw20,
  Cancel,
  Update,
};

// Export
export { Query, Execute }
