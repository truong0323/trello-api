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
const COLUMN_COLLECTION_NAME = 'columns'
const COLUMN_COLLECTION_SCHEMA = Joi.object({
  boardId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  title: Joi.string().required().min(3).max(50).trim().strict(),

  // Lưu ý các item trong mảng cardOrderIds là ObjectId nên cần thêm pattern cho chuẩn nhé, (lúc quay video số 57 mình quên nhưng sang đầu video số 58 sẽ có nhắc lại về cái này.)
  cardOrderIds: Joi.array().items(
    Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  ).default([]),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})
const INVALID_UPDATE_FIELDS = ['_id', 'createdAt','boardId']
const validateBeforeCreate = async(data) => {
    return await COLUMN_COLLECTION_SCHEMA.validateAsync(data, {abortEarly : false})
}
const createNew = async (data) => {
    try {
        const validData = await validateBeforeCreate(data)
        // console.log('valid Data:',validData);
        const newColumnToAdd = {
          ...validData,
          boardId: new ObjectId(String(validData.boardId))
        }

        const createColumn = await GET_DB().collection(COLUMN_COLLECTION_NAME).insertOne(newColumnToAdd)
        return createColumn
    } catch (error) {
        throw new Error(error)
    }
}
const findOneById = async(columnId) => {
    try {
        
        const result = await GET_DB().collection(COLUMN_COLLECTION_NAME).findOne({
            _id: new ObjectId(String(columnId))
        })
        return result
    }
    catch(error) {
        throw new Error(error)
    }
}
//nhiệm vụ púh 1 giá trị cardId vào cuối mảng CardOrderIds
const pushCardOrderIds = async (card) =>{
    try {
        const result = await GET_DB().collection(COLUMN_COLLECTION_NAME).findOneAndUpdate(
            { _id: new ObjectId(String(card.columnId))},
            { $push : { cardOrderIds: new ObjectId(String(card._id)) } },
            { ReturnDocument: 'after' } //trả về bản ghi sau khi đã cập nhật
            
        )
        return result
    } catch (error) {
        throw new Error(error)
    }
}
const update = async (columnId , updateData) =>{
    try {
        //lọc những field mà chúng ta không cho phép cập nhật lih tinh 
        Object.keys(updateData).forEach(fieldName => {
            if(INVALID_UPDATE_FIELDS.includes(fieldName)) {
                delete updateData[fieldName]
            }
        })
        // đối với những dữ liệu mà liên quan đến ObjectId, biến đổi ở đây
        if(updateData.cardOrderIds) {
            updateData.cardOrderIds = updateData.cardOrderIds.map(_id => (new ObjectId(String(_id))))
        }
        const result = await GET_DB().collection(COLUMN_COLLECTION_NAME).findOneAndUpdate(
            { _id: new ObjectId(String(columnId)) },
            { $set :  updateData },
            { returnDocument: 'after' } //trả về bản ghi sau khi đã cập nhật
            
        )
        return result
    } catch (error) {
        throw new Error(error)
    }
}
const deleteOneById = async(columnId) => {
    try {
        
        const result = await GET_DB().collection(COLUMN_COLLECTION_NAME).deleteOne({
            _id: new ObjectId(String(columnId))
        })
        console.log('reslut of findOne-columnModel: ', result);
        return result
    }
    catch(error) {
        throw new Error(error)
    }
}
export const columnModel = {
  COLUMN_COLLECTION_NAME,
  COLUMN_COLLECTION_SCHEMA,
  createNew,
  findOneById,
  pushCardOrderIds,
  update,
  deleteOneById
}