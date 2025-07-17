/*eslint-disable no-useless-catch */


/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */
import { ReturnDocument } from 'mongodb'
import { slugify } from '~/utils/formatters'
import { boardModel } from '~/models/boardModel'
//xửu lí logic dữ liệu tùy đăccj thù dự án : ví dụ ccaanf tao cái slug ,tất nhiên slug này người dùng k thể nhập ,ở tầng service này sẽ tạo rồi đưa vào model
const createNew = async(reqBody) =>{
    try {
        const newBoard = {
            ...reqBody, 
            slug: slugify(reqBody.title)
        }
        //Gọi tới tnaagf Model để xử lý lưu bản ghi newBoard vào trong Database

        const  createBoard = await boardModel.createNew(newBoard)
        //console.log(createBoard);

        //lấy bản ghi board sau khi gọi (tùy mục đích)
        const getNewBoard = await boardModel.findOneById(createBoard.insertedId)
        //console.log(getNewBoard);

        
        // trả kết quả về ,trong service luôn phải có return
        return getNewBoard
    } catch (error) {
        throw error
    }
}
export const boardService = {
    createNew
}