'use strict';
import mongoose from 'mongoose';

const ArtistSchema = new mongoose.Schema({
  name: { type: String, required: true },
});

const ArtworkSchema = new mongoose.Schema({
  title: { type: String, required: true },
  images: [{
    src: String,
    color: String,
    width: Number,
    height: Number
  }],
  about: { type: String },
  artist: ArtistSchema,
  year: { type: Number },
  price: { type: Number },
  priceCurrency: { type: String },
  width: { type: Number },
  height: { type: Number },
  style: { type: String },
  medium: { type: String },
  framed: { type: Boolean },
  likes: { type: Number, default: 0 },
  purchasable: { type: Boolean, default: false },
  status: { type: String, default: "for-sale" },
	publish_status: { type: String, enum: ['draft', 'in_review', 'published'], required: true, default: "draft"},
  created_at: { type: Date, default: Date.now },
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  gallery: { type: mongoose.Schema.Types.ObjectId, ref: 'Gallery' },
  shows: [{type: mongoose.Schema.Types.ObjectId, ref: 'Show'}]
});

ArtworkSchema.index(
	{
		'$**': 'text'
	},
	{
		name: 'TextIndex',
		background: true
	}
);

const ArtworkModel = mongoose.model('Artwork', ArtworkSchema);
export default ArtworkModel;
