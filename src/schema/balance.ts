const { Schema, model } = require('mongoose');

export default model(
	'balance',
	new Schema({
		userID: { type: String, required: true },
		wallet: { type: Number, required: true, default: 1000 },
		bank: { type: Number, required: true, default: 1000 },
	}),
);
