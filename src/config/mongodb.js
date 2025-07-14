/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */


import {env }from '~/config/environment'
import { MongoClient , ServerApiVersion } from 'mongodb'


//khởi tpaj một đối tượng trelloDatabaseInstance ban đầu là null(vì chúng ta chưa connect)
let trelloDatabaseInstance = null
//khởi tạo một đối tượng mongoClient để connect tới MongoDB
const mongoClientInstance = new MongoClient(env.MONGODB_URI , {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true
    }
})
export const CONNECT_DB = async() => {
    //Gọi kết nối đến mongoDb Atlas với URI đã khai báo trong thân của ClientInstance 
    await mongoClientInstance.connect()
    //kết nối thành công thì lấy ra database theo tên và gán ngược lại vào biến trelloDatabaseInstance ở trên 
    trelloDatabaseInstance = mongoClientInstance.db(env.DATABASE_NAME)
}
//Function : GET_DB (không phải là async ) này có nhiệm vụ export ra cái Trello Database Instance sau khi đã connect thnahf công
// tới MongoDB để chúng ta có thể sử dụng biến trelloDatabaseInstance ở nhiều nơi 
// Lưu ý : phải đảm bảo chỉ luôn gọi cái getDB khi đã kết nối thành công
export const GET_DB = ()=> {
    if(!trelloDatabaseInstance) throw new Error('Must Connect to DataBase first')
    return trelloDatabaseInstance
}

export const CLOSE_DB = async()=>{
    await mongoClientInstance.close()
}
