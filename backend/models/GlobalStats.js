import mongoose from 'mongoose';

const globalStatsSchema = new mongoose.Schema({
  // Using a fixed ID to ensure only one document exists
  _id: {
    type: String,
    default: 'global_stats'
  },
  visitors: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  dislikes: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Static method to get or create the global stats document
globalStatsSchema.statics.getGlobalStats = async function() {
  let stats = await this.findById('global_stats');
  if (!stats) {
    stats = await this.create({ _id: 'global_stats' });
  }
  return stats;
};

// Static method to increment visitor count
globalStatsSchema.statics.incrementVisitors = async function() {
  const stats = await this.getGlobalStats();
  stats.visitors += 1;
  await stats.save();
  return stats;
};

// Static method to increment likes
globalStatsSchema.statics.incrementLikes = async function() {
  const stats = await this.getGlobalStats();
  stats.likes += 1;
  await stats.save();
  return stats;
};

// Static method to increment dislikes
globalStatsSchema.statics.incrementDislikes = async function() {
  const stats = await this.getGlobalStats();
  stats.dislikes += 1;
  await stats.save();
  return stats;
};

const GlobalStats = mongoose.model('GlobalStats', globalStatsSchema);

export default GlobalStats;

