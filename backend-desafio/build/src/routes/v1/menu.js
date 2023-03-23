"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const menu_1 = __importDefault(require("../../controllers/menu"));
const menu_2 = __importDefault(require("../../validation/menu"));
const routes = express_1.default.Router();
routes.post('/', menu_2.default.upsert, menu_1.default.create);
routes.get('/', menu_1.default.getAll);
routes.delete('/:id', menu_2.default.idDelete, menu_1.default.delete);
routes.delete('/', menu_1.default.deleteAll);
routes.get('/allByMongo', menu_1.default.getAllWithMongodbOnly);
exports.default = routes;
