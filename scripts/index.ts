import Scrapinator from "./scrape"

const main = async () => {
    const scrape = new Scrapinator()
    await scrape.init()

}

main()