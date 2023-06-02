const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MediaSchema = new Schema({
    link: {type: String},
    alt: {type: String},
})

const MetricSchema = new Schema ({
    likes: { type: Number },
    comments: { type: [] }
})

const PostSchema = new Schema({
    title: {type: String, required: true},
    desc: {type: String, required: true},
    author: {type: {}, required: true},
    media: {type: [MediaSchema]},
    metrics: {type: MetricSchema},
    tags: {type: []},
    location: {type: String}
    // Title, Description, [Images, Videos], [Likes, Comments], Place
})

const PlaceSchema = new Schema({
    title: {type: String, required: true},
    desc: {type: String, required: true},
    media: {type: [MediaSchema]},
    metrics: {type: MetricSchema},
    tags: {type: []},
    location: {type: String}
    // Name, Description, Images, videos, posts, ratings, ggl navigations
})

const Post = mongoose.model('Travel20_Posts', PostSchema);
const Place = mongoose.model('Travel20_Places', PlaceSchema);

exports.Post = Post;
exports.Place = Place;