# Mint and Reveal Contract

Contract for minting, revealing, whitelisting and for collecting and disbursing minting fees

For detailed types see [repository](https://github.com/drewstaylor/whitelist-minter)

## Queries

`Config {}` - Returns the contract's configuration parameters

Example response:
```js
{
    "owner": Addr,  // an admin who can change this configuration
    "cw721": Addr,  // nft contract

    "artist": Addr, // an `artist` who receives founders nfts
                    // and withdraws funds accrued from minting

    "supply": u64,  // max possible mints
    
    "whitelist_expiration": u64,    // a date in seconds, after which whitelisting
                                    // permissions no longer enforced (e.g. public minting)
    
    "whitelist_allowance": u64, // max nfts that can be minted by `whitelist` members
    "whitelist": Vec<Addr>,     // array of whitelisted addresses
    
    "total_reserved": u64,          // amount of nfts automatically minted to `artist`
    "total_reserved_founders": u64, // amount of nfts automatically minted to `artist` 
                                    // that will be revealed without using randomness
                                    // algorithm 
    
    "reveal": bool,     // true if revealing enabled, else false 
                        // revealing will be enabled by `owner`
                        // when they've sent an `EnableReveal` tx

    "price": Uint128,       // price of minting
    
    "name_prefix": String,  // a naming covention used during 
                            // randomized metadata creation
    
    "initialized": bool,    // true if contract has been initialized, else false 
                            // contract will be initialized by `owner` when they've  
                            // sent an `Initialize` tx
}
```

## Transactions

- `Mint{}` - Mint NFT. If `whitelist_expiration` is not expired, tx sender must be a member of `whitelist`. Fails if minting would `supply`.
- `Reveal{token_id}` - Reveal metadata of a specific `token_id`. Fails if tx sender does not own `token_id` or hasn't approved minting contract to make changes to the NFT (see [cw721 Approve{spender, token_id, expires}](https://github.com/CosmWasm/cw-nfts/blob/main/packages/cw721/README.md))

#### Artist Only

These can only be called by the `artist` account. 

`Withdraw{amount}` - Withdraw a specific `amount` of funds collecting from minting to the `artist` acount

#### Admin Only

These can only be called by the `owner` account

`Initialize{}` - Enables minting and mints all reserved NFTs to the `artist` account

`EnableReveal{}` - Enables revealing metadata. Fails if `whitelist_expiration` is not expired

`UpdateConfig{config}` - Update the contract's configuration parameters