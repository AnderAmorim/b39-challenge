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
const counters_1 = __importDefault(require("../models/counters"));
const incrementValue = 1;
function createCounter(name) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield counters_1.default.create({ nameCounter: name });
    });
}
function updateCounter(id, currentCount) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield counters_1.default.findByIdAndUpdate(id, { seq: currentCount + incrementValue }, { new: true });
    });
}
const counterIncrement = function (name) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = { nameCounter: name };
        let counter = yield counters_1.default.findOne(query);
        if (!counter) {
            counter = yield createCounter(name);
        }
        else {
            counter = yield updateCounter(counter._id, counter.seq);
        }
        return counter.seq;
    });
};
exports.default = counterIncrement;
