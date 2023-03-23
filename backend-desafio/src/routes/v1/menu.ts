import express from 'express'
import MenuController from '../../controllers/menu'
import menuValidation from '../../validation/menu'

const routes = express.Router()

routes.post('/', menuValidation.upsert, MenuController.create)
routes.get('/', MenuController.getAll)
routes.delete('/:id', menuValidation.idDelete, MenuController.delete)
routes.delete('/',MenuController.deleteAll)


routes.get('/allByMongo', MenuController.getAllWithMongodbOnly)

export default routes
