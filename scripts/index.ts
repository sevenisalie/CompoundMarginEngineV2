import Scrapinator from "./scrape"

const main = async () => {
    const scrape = new Scrapinator()
    await scrape.init()
    console.log(scrape.marketTokens.map(token => token.name))
    const data = await scrape.loadBorrowers()
    console.log(data.length)
    console.log(data[0].borrowers[199])

    const aggregateAddresses = async (_data: any) => {
        const mergedMarketAddresses = []
        const allMarketAddresses = _data.map((market: any, i: any) => {
            const marketAddresses = market.borrowers.map((borrower: any, j: number) => {
                return borrower.address
            })
            return marketAddresses
        })
        for (let i = 0; i < allMarketAddresses.length; i++) {
            mergedMarketAddresses.push(...allMarketAddresses[i])
        }
        function removeDuplicates(dataset: any) {
            return [...new Set(dataset)];
        }
        const pureAddresses = removeDuplicates(mergedMarketAddresses)

        return pureAddresses
    }

    const dart = await aggregateAddresses(data)
    console.log(dart.length)



}

main()