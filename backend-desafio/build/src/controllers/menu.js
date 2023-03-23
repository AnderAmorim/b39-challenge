"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const menu_1 = __importDefault(require("../models/menu"));
const counter_1 = __importDefault(require("../useCases/counter"));
const menu_2 = require("../useCases/menu");
exports.default = {
    create: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { name, relatedId } = req.body;
        const parentInformed = relatedId;
        let parentMenu;
        const counterName = 'menucounter';
        const idIncremental = yield (0, counter_1.default)(counterName);
        if (parentInformed) {
            parentMenu = yield (0, menu_2.existsParentMenu)(relatedId);
            if (!parentMenu)
                return res.status(400).json({ message: 'Related menu not found' });
            yield (0, menu_2.updateParentMenu)(parentMenu.id, idIncremental);
        }
        const { _id: id } = yield menu_1.default.create({ name, relatedId, id: idIncremental });
        return res.status(201).json({
            id,
        });
    }),
    delete: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const menu = yield menu_1.default.findOne({ id: req.params.id });
        if (!menu || !(menu === null || menu === void 0 ? void 0 : menu.id))
            return res.status(400).json({ message: 'Menu not found to exclude' });
        //Se possuir um pai, esse pai passará a ser os filhos do item excluido
        const newRelatedIdToChildrenOfExcludedItem = menu.relatedId ? menu.relatedId : null;
        // const session = await mongoose.startSession();
        // try {
        //     await mongoose.connection.transaction(async (session) => {
        yield menu_1.default.deleteOne({ id: menu.id }); //, { session });
        yield menu_1.default.updateMany({ relatedId: menu.id }, { relatedId: newRelatedIdToChildrenOfExcludedItem }); //, { session });
        yield menu_1.default.updateOne({ childrenId: { $all: [menu.id] } }, { $pull: { childrenId: menu.id } }); //, { session });
        // });
        // } catch (error) {
        //     return res.status(500).json({
        //        message: 'there was an error while deleting the menu',
        //     })
        // } finally {
        //     await session.endSession();
        // }
        return res.status(200).json({
            message: 'Menu excluded',
        });
    }),
    getAll: (_, res) => __awaiter(void 0, void 0, void 0, function* () {
        let allItems = yield menu_1.default.find();
        if (allItems.length) {
            allItems = (0, menu_2.oreganizeMenu)(allItems);
        }
        const cleanMenu = (0, menu_2.clearMenu)(allItems);
        return res.json(cleanMenu);
    }),
    getAllWithMongodbOnly: (_, res) => __awaiter(void 0, void 0, void 0, function* () {
        const menus = yield menu_1.default.collection.aggregate([
            {
                $graphLookup: {
                    from: "menu",
                    startWith: "$id",
                    connectFromField: "id",
                    connectToField: "relatedId",
                    as: "submenus", // Nome do array que armazenará os documentos encontrados
                }
            },
            {
                $addFields: {
                    submenus: {
                        $map: {
                            input: "$submenus",
                            as: "child",
                            in: {
                                $mergeObjects: [
                                    "$$child",
                                    {
                                        children: {
                                            $filter: {
                                                input: "$$child.children",
                                                as: "grandchild",
                                                cond: { $in: ["$$grandchild.id", "$$child.relatedId"] }
                                            }
                                        }
                                    }
                                ]
                            },
                        }
                    }
                }
            },
            {
                $project: {
                    relatedId: 0,
                    _id: 0,
                    childrenId: 0,
                    __v: 0,
                    children: 0
                }
            }
        ]).toArray();
        return res.json(menus);
    }),
    deleteAll: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        yield menu_1.default.deleteMany();
        return res.status(200).json({ message: 'All menu exclude' });
    }),
};
