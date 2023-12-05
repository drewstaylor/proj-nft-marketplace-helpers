# Marketplace Contract

Permissioned contract for secondary NFT trading, supporting sale swaps and offer swaps. NFT contract must be added to permissioned list of contracts to be able to list and swap NFTs of that collection.

See [marketplace.js](./marketplace.js)

## Queries
- [Config{}](./marketplace.js#L12-L50): Get basic information about the marketplace, such as which NFT collections are allowed to list in the marketplace, and what percentage of fees are retained from Sales and Offers.

- [List{start_after, limit}](./marketplace.js#L53-L83): Get a paginated list of all swap ids. Pagination is identical to cw721 enumerability (e.g. `start_after` strings), but all other paginated entry points use numeric page numbers (not `start_after` strings).

- [Details{id}](./marketplace.js#L85-L127): Fetch details for a specific swap

- [SwapsOf{address, swap_type, page, limit}](./marketplace.js#L129-L192): Get all swaps created by a specific address

- [GetTotal{swap_type}](./marketplace.js#L194-L220): `swap_type` is optional. Get the total number of swaps, or the total number of swaps for a `SwapType` ('Sale' / 'Offer').

- [GetOffers{page, limit}](./marketplace.js#L222-L288): Fetch all swaps of type `SwapType::Offer`

- [GetListings{page, limit}](./marketplace.js#L290-L349): Fetch all swaps of type `SwapType::Sale`

- [ListingsOfToken{token_id, cw721, swap_type, page, limit}](./marketplace.js#L351-L416): Fetch all swaps for a specific token ID; can optionally be filtered by swap type.

- [SwapsByPrice{min, max, swap_type, page, limit}](./marketplace.js#L418-L486): Fetch all swaps within a given price range

- [SwapsByDenom{payment_token, swap_type, page, limit}](./marketplace.js#L488-L556): Fetch all swaps for a given denom. Works for both native and cw20 denoms (e.g. ARCH, wARCH, etc.).

- [SwapsByPaymentType{cw20, swap_type, page, limit}](./marketplace.js#L558-L624): Fetch all swaps by payment type (e.g. either cw20 payments or native ARCH)

## Transactions
- `Create{SwapMsg}` - Create a swap
    - [CreateNative](./marketplace.js#L628-L675): Create a swap for native ARCH. Can be used to create both 'Sale' and 'Offer' swaps.
    - [CreateCw20](./marketplace.js#L724-L770): Create a swap using a cw20 token as payment. Can be used to create both 'Sale' and 'Offer' swaps. 

- `Finish{SwapMsg}` - Finalize a trade by consuming a swap
    - [FinishNative](./marketplace.js#L677-L722): Finalize and consume a swap paying with native ARCH. Fails if cw721 contract has not approved marketplace contract to spend NFT owner's NFT (see [cw721](https://github.com/CosmWasm/cw-nfts/blob/main/packages/cw721/README.md) `Approve{spender, token_id, expires}`).
    - [FinishCw20](./marketplace.js#L772-L815): Finalize and consume a swap paying with cw20 tokens. Fails if cw20 contract has not approved marketplace contract to spend cw20 owner's cw20s (see [cw20](https://github.com/CosmWasm/cw-plus/blob/main/packages/cw20/README.md) `IncreaseAllowance{spender, amount, expires}`). Fails if cw721 contract has not approved marketplace contract to spend NFT owner's NFT (see [cw721](https://github.com/CosmWasm/cw-nfts/blob/main/packages/cw721/README.md) `Approve{spender, token_id, expires}`).

- [Cancel{CancelMsg}](./marketplace.js#L817-L852): Cancel a swap

- [Update{UpdateMsg}](./marketplace.js#L854-L896): Update either the price, expiration, or both price and expiration of a swap.

- [Some addtional admin only transactions](./marketplace.js#L898-L911)

## Messages

- `SwapMsg` - Message type or creating and finishing swaps

```rs
pub struct SwapMsg {
    pub id: String,
    pub cw721: Addr,
    pub payment_token: Option<Addr>, // Optional cw20 address; if `None` create swap for `aarch`
    pub token_id: String,
    pub expires: Expiration,
    pub price: Uint128,
    pub swap_type: SwapType, // Enum with a value of either 'Sale' or 'Offer'
}
```

- `CancelMsg` - Message type for cancelling a swap

```rs
pub struct CancelMsg {
    pub id: String, // ID of swap to be cancelled
}
```

- `UpdateMsg` - Message type for updating a swap's price and expiration

```rs
pub struct UpdateMsg {
    pub id: String, // ID of swap to be updated
    pub expires: Expiration, // New expiration (see: https://docs.rs/cw20/latest/cw20/enum.Expiration.html)
    pub price: Uint128, // New swap price (see: https://docs.rs/cosmwasm-std/latest/cosmwasm_std/struct.Uint128.html)
}
```
