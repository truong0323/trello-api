/**
 * Updated by trungquandev.com's author on Oct 8 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */

import Joi from 'joi'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
import { GET_DB } from '~/config/mongodb'
import { ObjectId } from 'mongodb'
// Define Collection (name & schema)
const CARD_COLLECTION_NAME = 'cards'
const CARD_COLLECTION_SCHEMA = Joi.object({
  boardId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  columnId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),

  title: Joi.string().required().min(3).max(50).trim().strict(),
  description: Joi.string().optional(),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})
const INVALID_UPDATE_FIELDS = ['_id', 'createdAt','boardId']


const validateBeforeCreate = async(data) => {
    return await CARD_COLLECTION_SCHEMA.validateAsync(data, {abortEarly : false})
}
const createNew = async (data) => {
    try {
        const validData = await validateBeforeCreate(data)
        // console.log('valid Data:',validData);
        //biến đổi 1 số dữ liệu từ string về dạng objectId
        const newCardToAdd = {
          ...validData,
          boardId: new ObjectId(String(validData.boardId)),
          columnId: new ObjectId(String(validData.columnId))
        }

        const createCard = await GET_DB().collection(CARD_COLLECTION_NAME).insertOne(newCardToAdd)
        return createCard
    } catch (error) {
        throw new Error(error)
    }
}
const findOneById = async(cardId) => {
    try {
        
        const result = await GET_DB().collection(CARD_COLLECTION_NAME).findOne({
            _id: new ObjectId(String(cardId))
        })
        return result
    }
    catch(error) {
        throw new Error(error)
    }
}
const update = async ( cardId, updateData) =>{
    try {
        //lọc những field mà chúng ta không cho phép cập nhật lih tinh 
        Object.keys(updateData).forEach(fieldName => {
            if(INVALID_UPDATE_FIELDS.includes(fieldName)) {
                delete updateData[fieldName]
            }
        })
        // đối với những dữ liệu mà liên quan đến ObjectId, biến đổi ở đây
        if(updateData.columnId) {
            updateData.columnId = new ObjectId(String(updateData.columnId))
        }
        const result = await GET_DB().collection(CARD_COLLECTION_NAME).findOneAndUpdate(
            { _id: new ObjectId(String(cardId)) },
            { $set :  updateData },
            { returnDocument: 'after' } //trả về bản ghi sau khi đã cập nhật
        )
        return result
    } catch (error) {
        throw new Error(error)
    }
}
const deleteManyByColumnId = async(columnId) => {
    try {
        
        const result = await GET_DB().collection(CARD_COLLECTION_NAME).deleteMany({
            columnId: new ObjectId(String(columnId))
        })
        console.log('resut -of-deletMny-cardModel: ',result);
        return result
    }
    catch(error) {
        throw new Error(error)
    }
}

export const cardModel = {
  CARD_COLLECTION_NAME,
  CARD_COLLECTION_SCHEMA,
  createNew,
  findOneById,
  update,
  deleteManyByColumnId
}