/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */
import Joi  from 'joi'
import { ObjectId } from 'mongodb'
import { OBJECT_ID_RULE,OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
import { GET_DB } from '~/config/mongodb'

//define  Collection (name & Schema)

const BOARD_COLLECTION_NAME = 'boards'
const BOARD_COLLECTION_SCHEMA = Joi.object({
    title: Joi.string().required().min(3).max(50).trim().strict(),
    slug: Joi.string().required().min(3).trim().strict(),
    description: Joi.string().required().min(3).max(256).trim().strict(),
    columnOrderIds: Joi.array().items(
        Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
    ).default([]),
    createAt : Joi.date().timestamp('javascript').default(Date.now),
    updatedAt: Joi.date().timestamp('javascript').default(null),
    _destroy: Joi.boolean().default(false)

})
const validateBeforeCreate = async(data) => {
    return await BOARD_COLLECTION_SCHEMA.validateAsync(data, {abortEarly : false})
}
const createNew = async (data) => {
    try {
        const validData = await validateBeforeCreate(data)
        console.log('valid Data:',validData);
        const createBoard = await GET_DB().collection(BOARD_COLLECTION_NAME).insertOne(validData)
        return createBoard
    } catch (error) {
        throw new Error(error)
    }
}
const findOneById = async(id) => {
    try {
        
        const result = await GET_DB().collection(BOARD_COLLECTION_NAME).findOne({
            _id: new ObjectId(String(id))
        })
        return result
    }
    catch(error) {
        throw new Error(error)
    }
}
export const boardModel = {
    BOARD_COLLECTION_NAME,
    BOARD_COLLECTION_SCHEMA,
    createNew,
    findOneById
}