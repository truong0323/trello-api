/*eslint-disable no-useless-catch */


/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */
import { columnModel } from '~/models/columnModel'
import { boardModel } from '~/models/boardModel'
//xửu lí logic dữ liệu tùy đăccj thù dự án : ví dụ ccaanf tao cái slug ,tất nhiên slug này người dùng k thể nhập ,ở tầng service này sẽ tạo rồi đưa vào model
const createNew = async(reqBody) =>{
    try {
        const newColumn = {
            ...reqBody, 
        }
        //Gọi tới tnaagf Model để xử lý lưu bản ghi newColumn vào trong Database

        const  createColumn = await columnModel.createNew(newColumn)
        //console.log(createColumn);

        //lấy bản ghi Column sau khi gọi (tùy mục đích)
        const getNewColumn = await columnModel.findOneById(createColumn.insertedId)
        
        if (getNewColumn) {
            //xử lí cấu trúc data ở đây trước khi trả dữ liệu về
            getNewColumn.cards = []
            //cập nhật lại mảng columnOrderIds trong collection boards
            await boardModel.pushColumnOrderIds(getNewColumn)
        }

        return getNewColumn
    } catch (error) {
        throw error
    }
}

const update = async(boardId,reqBody) =>{
    try {
        const updateData = {
            ...reqBody,
            updatedAt: Date.now()
        }
        const updatedColumn = await columnModel.update(boardId,updateData)
        

        return updatedColumn
    } catch (error) {
        throw error
    }
}

export const columnService = {
    createNew, update
}