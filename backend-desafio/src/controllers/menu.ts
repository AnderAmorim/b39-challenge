import { Request, Response } from 'express'
import mongoose from 'mongoose'
import Menu, { IMenu } from '../models/menu'
import counterIncrement from '../services/counter'
import { IMenuItemFromDB } from '../services/interfaces/menu-item-from-db'
import { MenuService } from '../services/menu'

export default {
    create: async (req: Request, res: Response): Promise<Response> => {
        const { name, relatedId } = req.body
        const parentInformed = relatedId

        let parentMenu: IMenu | undefined;
        const counterName:string = 'menucounter'
        const idIncremental:number = await counterIncrement(counterName)

        if (parentInformed) {
            parentMenu = await MenuService.existsParentMenu(relatedId)
            if (!parentMenu) return res.status(400).json({ message: 'Related menu not found' })

            await MenuService.updateParentMenu(parentMenu.id, idIncremental)
        }

        const { _id: id } = await Menu.create({ name, relatedId, id: idIncremental })
        return res.status(201).json({
            id,
        })
    },

    delete: async (req: Request, res: Response): Promise<Response> => {
        const menu = await Menu.findOne({ id: req.params.id }) as IMenuItemFromDB
        if (!menu || !menu?.id)
            return res.status(400).json({ message: 'Menu not found to exclude' })
        
        const newRelatedIdToChildrenOfExcludedItem:number|null = menu.relatedId? menu.relatedId:null

        // const session = await mongoose.startSession();
        // try {
            await MenuService.deleteItemMenu(menu, newRelatedIdToChildrenOfExcludedItem)
        // } catch (error) {
        //     return res.status(500).json({
        //        message: 'there was an error while deleting the menu',
        //     })
        // } finally {
        //     await session.endSession();
        // }

        return res.status(200).json({
            message: 'Menu excluded',
        })
    },

    getAll: async (_: Request, res: Response): Promise<Response> => {
        let allItems = await Menu.find() as IMenuItemFromDB[]

        if (allItems.length) {
            allItems = MenuService.organizeMenuStructure(allItems)
        }

        const cleanMenu = MenuService.clearMenu(allItems)

        return res.json(cleanMenu)
    },

    getAllWithMongodbOnly: async (_: Request, res: Response): Promise<Response> => {
        const menus = await MenuService.getAllWIthMongoQuery()
        return res.json(menus)
    },

    deleteAll: async (req: Request, res: Response): Promise<Response> => {
        await Menu.deleteMany()
        return res.status(200).json({ message: 'All menu exclude' })
    },
}