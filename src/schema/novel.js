"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Novel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const { Schema } = mongoose_1.default;
const novelSchema = new Schema({
    novelId: {
        type: Schema.Types.String,
        required: true,
    },
    overview: {
        type: Schema.Types.String,
    },
    totalChapters: {
        type: Schema.Types.Number,
    },
    lastUpdate: {
        type: Schema.Types.Date,
    },
    cover: {
        type: Schema.Types.String,
    },
    title: {
        type: Schema.Types.String,
    },
    author: {
        type: Schema.Types.String,
    },
    chapter: [
        {
            topic: Schema.Types.String,
            constent: Schema.Types.String,
        },
    ],
});
exports.Novel = mongoose_1.default.model("novel", novelSchema);
