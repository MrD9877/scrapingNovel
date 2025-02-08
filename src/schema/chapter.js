"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatPage = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const { Schema } = mongoose_1.default;
const chatsSchema = new Schema({
    novelId: {
        type: Schema.Types.String,
        required: true,
    },
    chats: [
        {
            date: { type: Schema.Types.Date },
            chat: [
                {
                    user: {
                        type: Schema.Types.String,
                        required: true,
                    },
                    date: {
                        type: Schema.Types.Date,
                        required: true,
                    },
                    message: {
                        type: Schema.Types.String,
                        required: true,
                    },
                    isImage: {
                        type: Schema.Types.Boolean,
                        default: false,
                    },
                },
            ],
        },
    ],
    imagesUrl: [
        {
            imageId: { type: Schema.Types.String },
            url: { type: Schema.Types.String },
            dateGenerated: { type: Schema.Types.Date },
        },
    ],
});
exports.ChatPage = mongoose_1.default.models.ChatPage || mongoose_1.default.model("ChatPage", chatsSchema);
