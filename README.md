# proj-nft-marketplace-helpers
Code snippets, specs and examples for proj-nft-marketplace contracts

## Marketplace Contract
See [marketplace.js](./marketplace-contract/marketplace.js)

#### Queries
- [Config](./marketplace-contract/marketplace.js#L12-L50): Get basic information about the marketplace, such as which NFT collections are allowed to list in the marketplace, and what percentage of fees are retained from Sales and Offers.

- [List](./marketplace-contract/marketplace.js#L53-L83): Get a paginated list of all swap ids. Pagination is identical to cw721 enumerability (e.g. `start_after` strings), but all other paginated entry points use numeric page numbers (not `start_after` strings).

- [Details](./marketplace-contract/marketplace.js#L85-L127): Fetch details for a specific swap

- [SwapsOf](./marketplace-contract/marketplace.js#L129-L192): Get all swaps created by a specific address

- [GetTotal](./marketplace-contract/marketplace.js#L194-L220): Get the total number of swaps for a `SwapType` ('Sale' / 'Offer').

- [GetOffers](./marketplace-contract/marketplace.js#L222-L288): Fetch all swaps of type `SwapType::Offer`

- [GetListings](./marketplace-contract/marketplace.js#L290-L349): Fetch all swaps of type `SwapType::Sale`

- [ListingsOfToken](./marketplace-contract/marketplace.js#L351-L416): Fetch all swaps for a specific token ID; can optionally be filtered by swap type.

- [SwapsByPrice](./marketplace-contract/marketplace.js#L418-L486): Fetch all swaps within a given price range

- [SwapsByDenom](./marketplace-contract/marketplace.js#L488-L556): Fetch all swaps for a given denom. Works for both native and cw20 denoms (e.g. ARCH, wARCH, etc.).

- [SwapsByPaymentType](./marketplace-contract/marketplace.js#L558-L624): Fetch all swaps by payment type (e.g. either cw20 payments or native ARCH)

#### Transactions
- [CreateNative](./marketplace-contract/marketplace.js#L628-L675): Create a swap for native ARCH. Can be used to create both 'Sale' and 'Offer' swaps.

- [FinishNative](./marketplace-contract/marketplace.js#L677-L722): Finalize and consume a swap paying with native ARCH. Fails if cw721 contract has not approved marketplace contract to spend NFT owner's NFT (see [cw721](https://github.com/CosmWasm/cw-nfts/blob/main/packages/cw721/README.md) `Approve{spender, token_id, expires}`).

- [CreateCw20](./marketplace-contract/marketplace.js#L724-L770): Create a swap using a cw20 token as payment. Can be used to create both 'Sale' and 'Offer' swaps. 

- [FinishCw20](./marketplace-contract/marketplace.js#L772-L815): Finalize and consume a swap paying with cw20 tokens. Fails if cw20 contract has not been approved spend cw20 owner's cw20s (see [cw20](https://github.com/CosmWasm/cw-plus/blob/main/packages/cw20/README.md) `IncreaseAllowance{spender, amount, expires}`). Fails if cw721 contract has not approved marketplace contract to spend NFT owner's NFT (see [cw721](https://github.com/CosmWasm/cw-nfts/blob/main/packages/cw721/README.md) `Approve{spender, token_id, expires}`).

- [Cancel](./marketplace-contract/marketplace.js#L817-L852): Cancel a swap

- [Update](./marketplace-contract/marketplace.js#L854-L896): Update either the price, expiration, or both price and expiration of a swap.

- [Some addtional admin only transactions](./marketplace-contract/marketplace.js#L898-L911)


## Cw721 Contracts
See [cw721.md](./cw721-contract/cw721.md)

## Minting & Revealing Contract
See [whitelist-minter.md](./minter-contract/whitelist-minter.md)
