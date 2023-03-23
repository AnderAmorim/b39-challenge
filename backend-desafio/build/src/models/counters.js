"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const CounterSchema = new mongoose_1.Schema({
    seq: { type: Number, default: 1 },
    nameCounter: { type: String, require: true }
});
exports.default = (0, mongoose_1.model)('counter', CounterSchema, 'counter');
