import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
import { EMAIL_RULE,EMAIL_RULE_MESSAGE } from '~/utils/validators'
const USER_ROLES = {
    CLIENT: 'client',
    ADMIN: 'admin'
}

//define collectionName:
const USER_COLLECTION_NAME = 'users'
const USER_COLLECTION_NAME_SCHEMA = Joi.object({
    email: Joi.string().required().pattern(EMAIL_RULE).message(EMAIL_RULE_MESSAGE),//unique
    password:Joi.string().required(),
    //username cắt ra từ email sẽ có khả năng không unique bởi vì sẽ có những ten email trùng nhai nhưng từ các nhà cung cấp khác nhau
    username: Joi.string().required().trim().strict(),
    displayName: Joi.string().required().trim().strict(),
    avatar: Joi.string().default(null),
    role: Joi.string().valid(...Object.values(USER_ROLES)).default(USER_ROLES.CLIENT),

    isActive: Joi.boolean().default(false),
    verifyToken: Joi.string(),

    createdAt:Joi.date().timestamp('javascript').default(Date.now),
    updatedAt: Joi.date().timestamp('javascript').default(null),
    _destroy: Joi.boolean().default(false)

})
const INVALID_UPDATE_FIELDS = [ '_id', 'username','createdAt']
const validateBeforeCreate = async (data) => {
    return await USER_COLLECTION_NAME_SCHEMA.validateAsync(data, {abortEarly: false})
}
const createNew = async(data) => {
    try {
        const validData = await validateBeforeCreate(data)
        const createdUser = await GET_DB().collection(USER_COLLECTION_NAME).insertOne(validData)
        return createdUser
    } catch (error) {
        throw new Error(error)
    }
}
const findOneById = async(userId) => {
    try {
        
        const result = await GET_DB().collection(USER_COLLECTION_NAME).findOne({
            _id: new ObjectId(String(userId))
        })
        return result
    }
    catch(error) {
        throw new Error(error)
    }
}
const findOneByEmail = async(emailValue) => {
    try {
        
        const result = await GET_DB().collection(USER_COLLECTION_NAME).findOne({
            email: emailValue
        })
        return result
    }
    catch(error) {
        throw new Error(error)
    }
}
const update = async (userId , updateData) =>{
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

        const result = await GET_DB().collection(USER_COLLECTION_NAME).findOneAndUpdate(
            { _id: new ObjectId(String(userId)) },
            { $set :  updateData },
            { returnDocument: 'after' } //trả về bản ghi sau khi đã cập nhật
            
        )
        return result
    } catch (error) {
        throw new Error(error)
    }
}
export const userModel = {
    USER_COLLECTION_NAME,
    USER_COLLECTION_NAME_SCHEMA,
    USER_ROLES,
    createNew,

    findOneByEmail,findOneById,
    update
}


