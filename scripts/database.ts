import dotenv from "dotenv"
import { BigNumber } from "ethers"
import mongoose, { Mongoose, mongo } from "mongoose"

dotenv.config()

export type User = {
    userAddress: string,
    marginCondition: {
        error: BigNumber,
        liquidity: BigNumber,
        shortfall: BigNumber
    },
    deposits?: {
        tokenAddress: string,
        tokenName: string,
        depositAmount: BigNumber
    }[],
    borrows?: {
        tokenAddress: string,
        tokenName: string,
        borrowAmount: BigNumber
    }[],
    risk?: Number
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

    private marginConditionSchema = new mongoose.Schema({
        error: { type: Number, required: true },
        liquidity: { type: Number, required: true },
        shortfall: { type: Number, required: true }
    })


    private userSchema = new mongoose.Schema<User>({
        userAddress: { type: String, required: true },
        marginCondition: { type: this.marginConditionSchema, required: true },
        deposits: { type: [this.depositsSchema], required: false },
        borrows: { type: [this.borrowsSchema], required: false },
        risk: { type: Number, required: false }, // 0, 1, 2 low to high risk
    })

    public User = mongoose.model("User", this.userSchema)

    constructor() {

    }
    public async initDB() {
        const init = await this.connect()
        if (init == null) { console.log("Failed to connect to DB, Please Ensure Connection via correct URL exists") }
        return
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

    public async validateUserAddresses(_userAddresses: string[]) {
        const isUniqueUserProms = _userAddresses.map((address) => {
            const isUnique = this.verifyUniqueUser(address)
            return isUnique
        })
        const resolve = await Promise.all(isUniqueUserProms)

        const uniqueAddresses = []
        for (let i = 0; i < resolve.length; i++) {
            if (resolve[i]) {
                uniqueAddresses.push(_userAddresses[i])
            }
        }
        return uniqueAddresses
    }

    public async insertUsersInBatches(documents: User[], batchSize: number) {
        //validation
        const addresses = documents.map((user) => {
            return user.userAddress
        })

        const uniqueAddresses = await this.validateUserAddresses(addresses)

        const uniqueDocuments = documents.map((document, i) => {
            if (uniqueAddresses.includes(document.userAddress)) {
                return document
            }
        })

        //batching
        const numBatches = Math.ceil(uniqueDocuments.length / batchSize);

        for (let i = 0; i < numBatches - 1; i++) {
            const startIndex = i * batchSize;
            const endIndex = startIndex + batchSize;
            const batch = uniqueDocuments.slice(startIndex, endIndex);


            try {
                await this.User.insertMany(batch);
            } catch (error) {
                console.error(error);
            }
        }
        // insert the final batch separately
        const startIndex = (numBatches - 1) * batchSize;
        const finalBatch = uniqueDocuments.slice(startIndex);
        try {
            await this.User.insertMany(finalBatch);
        } catch (error) {
            console.error(error);
        }
    }

}







