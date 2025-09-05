/*eslint-disable no-useless-catch */


/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */
import { slugify } from '~/utils/formatters'
import { boardModel } from '~/models/boardModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { cloneDeep } from 'lodash'
import { columnModel } from '~/models/columnModel'
import { cardModel } from '~/models/cardModel'
import { DEFAULT_ITEMS_PER_PAGE, DEFAULT_PAGE } from '~/utils/constants'
//xửu lí logic dữ liệu tùy đăccj thù dự án : ví dụ ccaanf tao cái slug ,tất nhiên slug này người dùng k thể nhập ,ở tầng service này sẽ tạo rồi đưa vào model
const createNew = async(userId, reqBody) =>{
    try {
        const newBoard = {
            ...reqBody, 
            slug: slugify(reqBody.title)
        }
        //Gọi tới tnaagf Model để xử lý lưu bản ghi newBoard vào trong Database

        const  createBoard = await boardModel.createNew(userId, newBoard)
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
const getDetails = async(userId, boardId) =>{
    try {
        
        const board = await boardModel.getDetails(userId, boardId)
        // trả kết quả về ,trong service luôn phải có return
        if(!board) {
            throw new ApiError(StatusCodes.NOT_FOUND , 'Board not found!!!')
        }
        //B1: Deep Clone board ra một cái mới để xử lý , không ảnh hưởng tới board ban đầu , tùy
        // mục đích về sau mà có cần clone deep hay không (vd 63)
        const resBoard = cloneDeep(board)
        //B2: đưa card về đúng column của nó
        resBoard.columns.forEach( column => {
            //cách dùng equals này là vởi vì chúng ta hiểu ObjectID trong MongoDB có support method .equals
            column.cards = resBoard.cards.filter( card => card.columnId.equals(column._id))
            //cách khác là convert ObjectID về string để so sánh bằng toString() của javascript
            //column.cards = resBoard.cards.filter( card => card.columnId.toString() === column._id.toString())
        })
        //B3:xóa mảng cards khỏi board ban đầu
        delete resBoard.cards
        return resBoard
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
        const updatedBoard = await boardModel.update(boardId,updateData)
        

        return updatedBoard
    } catch (error) {
        throw error
    }
}
const moveCardToDifferentColumn = async(reqBody) =>{
    try {
    //khi di chuyển card sang column khác chúng ta  có 3 bước:
    // b1: Cập nhật mảng cardOrderIds của Column ban đầu chứa nó (hiểu bản chất là xóa cái _id của Card ra khỏi mảng)
     await columnModel.update(reqBody.prevColumnId ,{ 
        cardOrderIds: reqBody.prevCardOrderIds,
        updatedAt: Date.now()

      } )
    
    
    // b2: Cập nhật mảng cardOrderIds của Column  tiếp theo (là thêm _id của Card vào mảng )
      await columnModel.update(reqBody.nextColumnId ,{ 
        cardOrderIds: reqBody.nextCardOrderIds,
        updatedAt: Date.now()

      } )

    // b3: cập nhật lại trường columnId của cái Card đã kéo 
       await cardModel.update(reqBody.currentCardId ,{
        columnId: reqBody.nextColumnId
       } )
    

        return {updateResult: 'Successfully' }
    } catch (error) { throw error }
}
const getBoards = async (userId,page, itemsPerPage) =>{
    try {
        if(!page) page = DEFAULT_PAGE
        if(!itemsPerPage) itemsPerPage = DEFAULT_ITEMS_PER_PAGE
        const results =await boardModel.getBoards(userId , parseInt(page,10) , parseInt(itemsPerPage,10))
        return results
    } catch (error ) {
        throw error
    }
}
export const boardService = {
    createNew,
    getDetails,
    update,
    moveCardToDifferentColumn,
    getBoards
}