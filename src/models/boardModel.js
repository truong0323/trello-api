/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */
import Joi  from 'joi'
import { ObjectId, returnDocument } from 'mongodb'
import { OBJECT_ID_RULE,OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
import { GET_DB } from '~/config/mongodb'
import { columnModel } from '~/models/columnModel'
import { cardModel } from '~/models/cardModel'
//define  Collection (name & Schema)

const BOARD_COLLECTION_NAME = 'boards'
const BOARD_COLLECTION_SCHEMA = Joi.object({
    title: Joi.string().required().min(3).max(50).trim().strict(),
    slug: Joi.string().required().min(3).trim().strict(),
    description: Joi.string().required().min(3).max(256).trim().strict(),
    type: Joi.string().valid('public', 'private').required(),
    columnOrderIds: Joi.array().items(
        Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
    ).default([]),
    createdAt : Joi.date().timestamp('javascript').default(Date.now),
    updatedAt: Joi.date().timestamp('javascript').default(null),
    _destroy: Joi.boolean().default(false)

})
//chỉ định những hàm mà chúng  ta không muốn cho phép cập nhật trong hầm update
const INVALID_UPDATE_FIELDS = ['_id', 'createdAt']
const validateBeforeCreate = async(data) => {
    return await BOARD_COLLECTION_SCHEMA.validateAsync(data, {abortEarly : false})
}
const createNew = async (data) => {
    try {
        const validData = await validateBeforeCreate(data)
        // console.log('valid Data:',validData);
        const createBoard = await GET_DB().collection(BOARD_COLLECTION_NAME).insertOne(validData)
        return createBoard
    } catch (error) {
        throw new Error(error)
    }
}
const findOneById = async(boardId) => {
    try {
        
        const result = await GET_DB().collection(BOARD_COLLECTION_NAME).findOne({
            _id: new ObjectId(String(boardId))
        })
        return result
    }
    catch(error) {
        throw new Error(error)
    }
}
const getDetails = async(id) => {
    try {
        //hôm này hàm này tạm thời giống hàm findOneById và sẽ tiếp tục được update
        const result = await GET_DB().collection(BOARD_COLLECTION_NAME).aggregate([
            { $match : {
                _id: new ObjectId(String(id)),
                _destroy: false
            } },
            { $lookup: {
                from: columnModel.COLUMN_COLLECTION_NAME,
                localField: '_id',
                foreignField : 'boardId',
                as: 'columns'
            } },
            { $lookup: {
                from: cardModel.CARD_COLLECTION_NAME,
                localField: '_id',
                foreignField : 'boardId',
                as: 'cards'
            }}
        ]).toArray()
        return result[0] || null
    } catch (error) {
        throw new Error(error)
    }
}
//nhiệm vụ của function này là cập nhật push 1 giá trị columnId vào cuối mảng columnOrderIds
const pushColumnOrderIds = async (column) =>{
    try {
        const result = await GET_DB().collection(BOARD_COLLECTION_NAME).findOneAndUpdate(
            { _id: new ObjectId(String(column.boardId)),},
            { $push : { columnOrderIds: new ObjectId(String(column._id)) } },
            { returnDocument: 'after' } //trả về bản ghi sau khi đã cập nhật
            
        )
        return result
    } catch (error) {
        throw new Error(error)
    }
}
//hàm này để láy một phần tử columnId ra khỏi mảng columnOrderIds
//dùng $pull trong mongoDB ở th này để lấy một phần tử ra khỏi mảng rồi xóa nó đi
const pullColumnOrderIds = async (column) =>{
    try {
        const result = await GET_DB().collection(BOARD_COLLECTION_NAME).findOneAndUpdate(
            { _id: new ObjectId(String(column.boardId)),},
            { $pull : { columnOrderIds: new ObjectId(String(column._id)) } },
            { returnDocument: 'after' } //trả về bản ghi sau khi đã cập nhật
            
        )
        return result
    } catch (error) {
        throw new Error(error)
    }
}
const update = async (boardId , updateData) =>{
    try {
        //lọc những field mà chúng ta không cho phép cập nhật lih tinh 
        Object.keys(updateData).forEach(fieldName => {
            if(INVALID_UPDATE_FIELDS.includes(fieldName)) {
                delete updateData[fieldName]
            }
        })
         // đối với những dữ liệu mà liên quan đến ObjectId, biến đổi ở đây
        if(updateData.columnOrderIds) {
            updateData.columnOrderIds = updateData.columnOrderIds.map(_id => (new ObjectId(String(_id))))
        }

        const result = await GET_DB().collection(BOARD_COLLECTION_NAME).findOneAndUpdate(
            { _id: new ObjectId(String(boardId)) },
            { $set :  updateData },
            { returnDocument: 'after' } //trả về bản ghi sau khi đã cập nhật
            
        )
        return result
    } catch (error) {
        throw new Error(error)
    }
}
export const boardModel = {
    BOARD_COLLECTION_NAME,
    BOARD_COLLECTION_SCHEMA,
    createNew,
    findOneById,
    getDetails,
    pushColumnOrderIds,
    pullColumnOrderIds,
    update
}
//boardID: 687a4e1419077f7ff489e057
//columnid: 687a55dfafe5d61253f35ae6
//cardId: 687a5711afe5d61253f35ae9