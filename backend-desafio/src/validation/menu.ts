import * as yup from 'yup'
import mongoose from 'mongoose'
import { Request, Response, NextFunction } from 'express'

export default {
    upsert: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const schemaMenu = yup.object().shape({
                name: yup.string().required().min(3),
                relatedId: yup.number().optional(),
            })

            await schemaMenu.validate(req.body, { abortEarly: false })
            return next()
        } catch (err) {
            const { errors } = err as yup.ValidationError
            return res.status(400).json({ messages: errors })
        }
    },
    idDelete: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const deleteValidation = yup.object().shape({
                id: yup.number().required().typeError("Id must be a number"),
            });

            await deleteValidation.validate(req.params, { abortEarly: false })
            return next()
        } catch (err) {
            const { errors } = err as yup.ValidationError
            return res.status(400).json({ messages: errors })
        }
    }
}
