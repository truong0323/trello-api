/*eslint-disable no-useless-catch */


/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */
import { ReturnDocument } from "mongodb"
import { slugify } from "~/utils/formatters"
//xửu lí logic dữ liệu tùy đăccj thù dự án : ví dụ ccaanf tao cái slug ,tất nhiên slug này người dùng k thể nhập ,ở tầng service này sẽ tạo rồi đưa vào model
const createNew = async(reqBody) =>{
    try {
        const newBoard = {
            ...reqBody, 
            slug: slugify(reqBody.title)
        }

        
        // trả kết quả về ,trong service luôn phải có return
        return newBoard
    } catch (error) {
        throw error
    }
}
export const boardService = {
    createNew
}