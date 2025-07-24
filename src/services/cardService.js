/*eslint-disable no-useless-catch */


/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */
import { cardModel } from '~/models/cardModel'
import { columnModel } from '~/models/columnModel'

//xửu lí logic dữ liệu tùy đăccj thù dự án : ví dụ ccaanf tao cái slug ,tất nhiên slug này người dùng k thể nhập ,ở tầng service này sẽ tạo rồi đưa vào model
const createNew = async(reqBody) =>{
    try {
        const newCard = {
            ...reqBody
        }
        //Gọi tới tnaagf Model để xử lý lưu bản ghi newCard vào trong Database

        const  createCard = await cardModel.createNew(newCard)
        //console.log(createCard);

        //lấy bản ghi Card sau khi gọi (tùy mục đích)
        const getNewCard = await cardModel.findOneById(createCard.insertedId)
        
        //...
        if(getNewCard) {
            await columnModel.pushCardOrderIds(getNewCard)
        }

        return getNewCard
    } catch (error) {
        throw error
    }
}


export const cardService = {
    createNew
}