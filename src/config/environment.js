/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */
import 'dotenv/config'

export const env ={
    MONGODB_URI : process.env.MONGODB_URI,
    DATABASE_NAME : process.env.DATABASE_NAME,
    LOCAL_DEV_APP_HOST : process.env.LOCAL_DEV_APP_HOST,
    LOCAL_DEV_APP_PORT: process.env.LOCAL_DEV_APP_PORT,
    BUILD_MODE: process.env.BUILD_MODE,
    AUTHOR : process.env.AUTHOR,
    
    RESEND_API_KEY:process.env.RESEND_API_KEY,
    ADMIN_SENDER_EMAIL: process.env.ADMIN_SENDER_EMAIL,

    ACCESS_TOKEN_SECRET_SIGNATURE: process.env.ACCESS_TOKEN_SECRET_SIGNATURE,
    ACCESS_TOKEN_LIFE:process.env.ACCESS_TOKEN_LIFE,

    REFRESH_TOKEN_SECRET_SIGNATURE:process.env.REFRESH_TOKEN_SECRET_SIGNATURE,
    REFRESH_TOKEN_LIFE: process.env.REFRESH_TOKEN_LIFE

    
}