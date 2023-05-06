import dotenv from "dotenv"
import { BigNumber } from "ethers"
import mongoose, { Mongoose, mongo } from "mongoose"

dotenv.config()

type User = {
    userAddress: string,
    marginCondition: {
        error: BigNumber,
        liquidity: BigNumber,
        shortfall: BigNumber
    },
    deposits: {
        tokenAddress: string,
        tokenName: string,
        depositAmount: BigNumber
    }[],
    borrows: {
        tokenAddress: string,
        tokenName: string,
        borrowAmount: BigNumber
    }[]
}

export default class Databasinator {
    private depositsSchema = new mongoose.Schema({
        tokenAddress: String,
        tokenName: String,
        depositAmount: Number
    })

    private borrowsSchema = new mongoose.Schema({
        tokenAddress: String,
        tokenName: String,
        borrowAmount: Number
    })


    private userSchema = new mongoose.Schema({
        userAddress: String,
        marginCondition: {
            error: Number,
            liquidity: Number,
            shortfall: Number
        },
        deposits: [this.depositsSchema],
        borrows: [this.borrowsSchema],
        risk: Number // 0, 1, 2 low to high risk
    })

    public User = mongoose.model("User", this.userSchema)

    constructor() {

    }

    public async connect() {
        try {
            const URI = process.env.DATABASE_URL!
            await mongoose.connect(URI)
            const db = mongoose.connection
            db.once('open', () => {
                console.log("Connected to MongoDB Remote DB")
            })
            return db
        } catch (err) {
            console.log(err)
            return null
        }
    }

    public async verifyUniqueUser(_userAddress: string) {
        const query = await this.User.find({ userAddress: _userAddress })
        if (query.length == 0) { return true } else { return false }
    }


    public async insertUsersInBatches(documents: User[], batchSize: number) {
        const numBatches = Math.ceil(documents.length / batchSize);
        for (let i = 0; i < numBatches - 1; i++) {
            const startIndex = i * batchSize;
            const endIndex = startIndex + batchSize;
            const batch = documents.slice(startIndex, endIndex);

            try {
                await this.User.insertMany(batch);
            } catch (error) {
                console.error(error);
            }
        }
        // insert the final batch separately
        const startIndex = (numBatches - 1) * batchSize;
        const finalBatch = documents.slice(startIndex);
        try {
            await this.User.insertMany(finalBatch);
        } catch (error) {
            console.error(error);
        }
    }

}







