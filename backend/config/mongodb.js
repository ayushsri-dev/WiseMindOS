import mongoose from 'mongoose';

const connectDB = async()=> {
    mongoose.connection.on('connected', ()=>{
        console.log("DataBase Connected Successfully!")
    })
    const connectionOptions = {};
    if (process.env.DB_NAME) {
        connectionOptions.dbName = process.env.DB_NAME;
    }
    await mongoose.connect(process.env.MONGO_URI, connectionOptions)
}

export default connectDB;