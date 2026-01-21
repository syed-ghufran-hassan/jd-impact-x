import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CampaignCard, type Campaign } from '../components/CampaignCard';
import { Search, TrendingUp, Filter, Plus, Zap, Globe, Shield, RefreshCw } from 'lucide-react';
import { CAMPAIGN_CATEGORIES } from '../lib/ipfs';
import { getAllCampaigns, filterCampaigns, type FullCampaign } from '../lib/campaigns';

export function HomePage() {
  const [campaigns, setCampaigns] = useState<FullCampaign[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch campaigns on mount
  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllCampaigns();
      setCampaigns(data);
    } catch (err) {
      console.error('Failed to load campaigns:', err);
      setError('Failed to load campaigns. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Filter campaigns
  const filteredCampaigns = filterCampaigns(campaigns, {
    searchQuery,
    category: selectedCategory,
  });

  // Convert FullCampaign to Campaign for CampaignCard
  const displayCampaigns: Campaign[] = filteredCampaigns.map(c => ({
    id: c.id,
    title: c.title,
    description: c.description,
    imageUrl: c.imageUrl,
    goal: c.goal,
    raised: c.raised,
    backers: c.backers,
    daysLeft: c.daysLeft,
    category: c.category,
    owner: c.owner,
  }));

  // Stats
  const totalRaised = campaigns.reduce((sum, c) => sum + c.raised, 0);
  const totalBackers = campaigns.reduce((sum, c) => sum + c.backers, 0);
  const successfulCampaigns = campaigns.filter(c => c.raised >= c.goal).length;

  return (
    <div className="space-y-12 animate-in">
      {/* Hero Section */}
      <section className="text-center py-16 px-4 relative">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-heading font-bold mb-6">
            <span className="text-dark-100">Fund the Future of</span>
            <br />
            <span className="gradient-text">Bitcoin Builders</span>
          </h1>
          <p className="text-lg md:text-xl text-dark-400 max-w-2xl mx-auto mb-10 font-body">
            Back innovative projects on Stacks using USDC from Ethereum. 
            Seamless cross-chain donations powered by Circle xReserve.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              to="/create" 
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Start a Campaign
            </Link>
            <a 
              href="#campaigns" 
              className="btn-secondary"
            >
              Explore Projects
            </a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        <div className="glass-card p-6 text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-primary-500/15 flex items-center justify-center">
            <Globe className="w-6 h-6 text-primary-400" />
          </div>
          <h3 className="font-heading font-semibold text-dark-100 mb-2">Cross-Chain</h3>
          <p className="text-sm text-dark-400">Donate USDC from Ethereum, receive on Stacks via Circle xReserve</p>
        </div>
        <div className="glass-card p-6 text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-secondary-500/15 flex items-center justify-center">
            <Shield className="w-6 h-6 text-secondary-400" />
          </div>
          <h3 className="font-heading font-semibold text-dark-100 mb-2">Transparent</h3>
          <p className="text-sm text-dark-400">All donations tracked on-chain with Clarity smart contracts</p>
        </div>
        <div className="glass-card p-6 text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-success-500/15 flex items-center justify-center">
            <Zap className="w-6 h-6 text-success-400" />
          </div>
          <h3 className="font-heading font-semibold text-dark-100 mb-2">Low Fees</h3>
          <p className="text-sm text-dark-400">Only 5% platform fee, more funds go to creators</p>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
        <div className="stat-card">
          <div className="stat-value">
            ${totalRaised > 0 ? (totalRaised / 1000).toFixed(0) + 'K+' : '0'}
          </div>
          <div className="stat-label">Total Raised</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {totalBackers}+
          </div>
          <div className="stat-label">Backers</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {successfulCampaigns}
          </div>
          <div className="stat-label">Funded Projects</div>
        </div>
      </section>

      {/* Search & Filter */}
      <section id="campaigns" className="space-y-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
            <input
              type="text"
              placeholder="Search campaigns..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-12"
            />
          </div>

          {/* Refresh Button */}
          <button
            onClick={loadCampaigns}
            disabled={loading}
            className="btn-secondary flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
          <Filter className="w-5 h-5 text-dark-500 flex-shrink-0" />
          {['All', ...CAMPAIGN_CATEGORIES].map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                selectedCategory === category
                  ? 'bg-primary-500 text-dark-900'
                  : 'bg-white/5 text-dark-300 hover:bg-white/10 border border-white/10'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Trending Label */}
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary-400" />
          <span className="font-heading font-medium text-dark-100">
            {campaigns.length > 0 ? 'Live Campaigns' : 'Campaigns'}
          </span>
          <span className="text-dark-500">({filteredCampaigns.length} projects)</span>
        </div>
      </section>

      {/* Campaign Grid */}
      <section>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="glass-card overflow-hidden animate-pulse">
                <div className="h-48 bg-dark-700" />
                <div className="p-5 space-y-4">
                  <div className="h-4 bg-dark-700 rounded w-3/4" />
                  <div className="h-3 bg-dark-700 rounded w-full" />
                  <div className="h-3 bg-dark-700 rounded w-2/3" />
                  <div className="h-2 bg-dark-700 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="glass-card text-center py-16">
            <p className="text-dark-400 text-lg mb-4">{error}</p>
            <button onClick={loadCampaigns} className="btn-primary">
              Try Again
            </button>
          </div>
        ) : displayCampaigns.length === 0 ? (
          <div className="glass-card text-center py-16">
            <p className="text-dark-400 text-lg">
              {campaigns.length === 0 
                ? 'No campaigns yet. Be the first to create one!'
                : 'No campaigns found matching your criteria.'}
            </p>
            <Link to="/create" className="btn-primary inline-flex items-center gap-2 mt-4">
              <Plus className="w-4 h-4" />
              Create the first one
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayCampaigns.map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
